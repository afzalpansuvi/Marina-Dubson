export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.id || payload.userId }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Manually fetch contact to avoid stale Prisma client type error
        const contact = await prisma.contact.findUnique({
            where: { email: user.email }
        })

        return NextResponse.json({
            user: {
                ...user,
                contact
            }
        })
    } catch (error) {
        console.error('Fetch user error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
