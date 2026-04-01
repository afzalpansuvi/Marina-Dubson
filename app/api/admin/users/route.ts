export const dynamic = 'force-dynamic'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { extractTokenFromHeader, hashPassword, TokenPayload, verifyToken } from '@/lib/auth'
import { sendEmail, emailTemplates } from '@/lib/email'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']
const CLIENT_ROLES = ['CLIENT', 'AGENCY'] as const
type ClientRole = (typeof CLIENT_ROLES)[number]
type ClientType = 'PRIVATE' | 'AGENCY'

const isClientRole = (role: string): role is ClientRole => CLIENT_ROLES.includes(role as ClientRole)
const PASSWORD_LENGTH = 10

const createUserSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'REPORTER', 'CLIENT', 'AGENCY']),
    password: z.string().min(8).optional(),
    clientType: z.enum(['PRIVATE', 'AGENCY']).optional(),
    company: z.string().max(120).optional(),
    certification: z.string().max(200).optional(),
})

const requireAdmin = (request: NextRequest): TokenPayload | null => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'))
    const payload = token ? verifyToken(token) : null
    if (!payload || !ADMIN_ROLES.includes(payload.role.toUpperCase())) {
        return null
    }
    return payload
}

const buildTemporaryPassword = () => crypto.randomBytes(Math.ceil(PASSWORD_LENGTH / 2)).toString('hex').slice(0, PASSWORD_LENGTH)

const mapRoleToClientType = (role: ClientRole, provided?: ClientType): ClientType => {
    if (role === 'AGENCY') return 'AGENCY'
    return provided ?? 'PRIVATE'
}

export async function GET(request: NextRequest) {
    const authorized = requireAdmin(request)
    if (!authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')
        const search = searchParams.get('search')
        const clientType = searchParams.get('clientType')

        const where: any = {}
        if (role && role !== 'All Roles') {
            where.role = role.toUpperCase()
        }
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                contact: {
                    select: {
                        clientType: true,
                        companyName: true,
                        email: true
                    }
                }
            },
        })

        let hydratedUsers = users
        const missingContactEmails = users.filter(u => !u.contact).map(u => u.email)
        if (missingContactEmails.length > 0) {
            const contacts = await prisma.contact.findMany({
                where: { email: { in: missingContactEmails } },
                select: { id: true, email: true, clientType: true, companyName: true }
            })
            hydratedUsers = users.map(u => {
                if (u.contact) return u
                const found = contacts.find(c => c.email === u.email)
                return found ? { ...u, contact: { clientType: found.clientType, companyName: found.companyName, email: found.email } } : u
            })
        }

        const filtered = clientType
            ? hydratedUsers.filter(u => u.contact?.clientType === clientType)
            : hydratedUsers

        return NextResponse.json({ users: filtered })
    } catch (error) {
        console.error('Fetch users error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const authorized = requireAdmin(request)
    if (!authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const data = createUserSchema.parse(body)

        const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
        if (existingUser) {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 })
        }

        const temporaryPassword = data.password?.trim() || buildTemporaryPassword()
        const hashedPassword = await hashPassword(temporaryPassword)

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                company: data.company,
                certification: data.certification
            }
        })

        if (isClientRole(data.role)) {
            const contactType = mapRoleToClientType(data.role, data.clientType)
            try {
                const existingContact = await prisma.contact.findUnique({
                    where: { email: data.email }
                })

                const contact = existingContact || await prisma.contact.create({
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        companyName: data.company,
                        clientType: contactType || 'PRIVATE',
                        status: 'Active'
                    }
                })

                await prisma.user.update({
                    where: { id: user.id },
                    data: { contactId: contact.id }
                })
            } catch (contactError) {
                console.error('Failed to sync contact for new user:', contactError)
            }
        }

        try {
            const loginLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dubsonstenoservices.com'}/login`
            const emailTemplate = emailTemplates.welcomeEmail(user.firstName, user.role, loginLink)

            await sendEmail({
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            })
        } catch (emailError) {
            console.error('Failed to send welcome email to admin-created user:', emailError)
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            temporaryPassword: data.password ? null : temporaryPassword
        }, { status: 201 })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Input validation failed.', details: error.errors }, { status: 400 })
        }
        console.error('Admin user creation failed:', error)
        return NextResponse.json({
            error: 'Could not create user.',
            debug: error?.message
        }, { status: 500 })
    }
}
