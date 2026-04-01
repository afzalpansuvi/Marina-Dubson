export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userRole = payload.role?.toUpperCase() || ''
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ campaigns })
    } catch (error) {
        console.error('Fetch campaigns error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
