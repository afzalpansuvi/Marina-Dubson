export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword, hashPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    clientType: z.enum(['PRIVATE', 'AGENCY']).optional(),
})

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@marinadubson.com'
const ADMIN_PASSWORD = process.env.DEFAULT_PASSWORD || 'MarinaAdmin@123##!'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, clientType } = loginSchema.parse(body)
        // ─── Admin Bootstrap ────────────────────────────────────────────────────
        // If logging in with the default admin credentials, ensure the admin user
        // actually exists in the database so foreign keys work across the app.
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Try to find existing admin user
            let adminUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })

            if (!adminUser) {
                // First time: create the admin user in DB so all FK references resolve
                console.log('[AUTH] Admin user not found in DB — creating bootstrap admin...')
                adminUser = await prisma.user.create({
                    data: {
                        email: ADMIN_EMAIL,
                        password: await hashPassword(ADMIN_PASSWORD),
                        firstName: 'Marina',
                        lastName: 'Dubson',
                        role: 'ADMIN',
                    }
                })
                console.log('[AUTH] Bootstrap admin created with ID:', adminUser.id)
            }

            const token = generateToken({
                userId: adminUser.id,
                id: adminUser.id,
                email: adminUser.email,
                role: adminUser.role,
                firstName: adminUser.firstName
            })

            return NextResponse.json({
                token,
                user: {
                    id: adminUser.id,
                    email: adminUser.email,
                    firstName: adminUser.firstName,
                    lastName: adminUser.lastName,
                    role: adminUser.role,
                    avatar: adminUser.avatar,
                },
            })
        }

        // ─── Standard DB Authentication ─────────────────────────────────────────
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                contact: {
                    select: { clientType: true, companyName: true, email: true }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'Auth failed' }, { status: 401 })
        }

        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
            return NextResponse.json({ error: 'Auth failed' }, { status: 401 })
        }

        // If a clientType was explicitly selected, enforce match strictly (including missing mapping)
        if (clientType) {
            const registeredType = user.contact?.clientType
            if (!registeredType || registeredType !== clientType) {
                return NextResponse.json(
                    { error: `This account is registered as ${registeredType || 'an unmapped type'}. Please select the matching client tab to log in.` },
                    { status: 403 }
                )
            }
        }

        const token = generateToken({
            userId: user.id,
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            clientType: user.contact?.clientType
        })

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                avatar: user.avatar,
                clientType: user.contact?.clientType
            },
        })
    } catch (error) {
        console.error('[AUTH_LOGIN_ERROR]:', error)
        return NextResponse.json({ error: 'System busy. Please try again.' }, { status: 500 })
    }
}
