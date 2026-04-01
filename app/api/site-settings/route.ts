export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
    companyName: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
    address: z.string().min(1).optional(),
    bio: z.string().optional(),
})

const defaults = {
    companyName: 'Marina Dubson Stenographic Services',
    phone: '(917) 494-1859',
    email: 'MarinaDubson@gmail.com',
    address: '12A Saturn Lane, Staten Island, NY',
    bio: 'Elite stenographic support for modern legal workflows.',
}

export async function GET() {
    try {
        const admin = await prisma.user.findFirst({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            orderBy: { createdAt: 'asc' },
        })

        if (!admin) {
            return NextResponse.json(defaults)
        }

        return NextResponse.json({
            companyName: admin.company || defaults.companyName,
            phone: admin.availability || defaults.phone,
            email: admin.portfolio || admin.email || defaults.email,
            address: admin.certification || defaults.address,
            bio: admin.bio || defaults.bio,
        })
    } catch (error) {
        console.error('Get site settings error:', error)
        return NextResponse.json(defaults)
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes((payload.role || '').toUpperCase())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const data = updateSchema.parse(body)

        const targetId = payload.id || payload.userId
        const updateData: any = {}
        if (data.companyName !== undefined) updateData.company = data.companyName
        if (data.phone !== undefined) updateData.availability = data.phone
        if (data.email !== undefined) updateData.portfolio = data.email
        if (data.address !== undefined) updateData.certification = data.address
        if (data.bio !== undefined) updateData.bio = data.bio

        const updated = await prisma.user.update({
            where: { id: targetId },
            data: updateData,
        })

        return NextResponse.json({
            companyName: updated.company || defaults.companyName,
            phone: updated.availability || defaults.phone,
            email: updated.portfolio || updated.email || defaults.email,
            address: updated.certification || defaults.address,
            bio: updated.bio || defaults.bio,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Update site settings error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
