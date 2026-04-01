export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

const createSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    clientType: z.enum(['PRIVATE', 'AGENCY']).default('PRIVATE'),
    password: z.string().min(8).optional()
})

export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || !['ADMIN', 'MANAGER', 'SUPER_ADMIN', 'STAFF'].includes((payload.role || '').toUpperCase())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const data = createSchema.parse(body)

        const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
        }

        const hashed = await hashPassword(data.password || Math.random().toString(36).slice(2, 10) + '!Abc123')

        const contact = await prisma.contact.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                companyName: data.companyName,
                clientType: data.clientType,
                status: 'Active'
            }
        })

        const user = await prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: hashed,
                role: 'CLIENT',
                contactId: contact.id
            }
        })

        return NextResponse.json({ user, contact }, { status: 201 })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Admin create client error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
