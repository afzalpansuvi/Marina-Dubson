export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

const AUTH_ROLES = new Set(['ADMIN', 'MANAGER', 'SUPER_ADMIN'])

export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || !AUTH_ROLES.has((payload.role || '').toUpperCase())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { bookingId, reporterId } = await request.json()
        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
        }

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        const targetReporterId = reporterId?.trim() || payload.userId
        if (!targetReporterId) {
            return NextResponse.json({ error: 'Reporter identity required' }, { status: 400 })
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                reporterId: targetReporterId,
                bookingStatus: 'ASSIGNED',
                isMarketplace: false
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Assign job error:', error)
        return NextResponse.json({ error: 'Unable to assign job' }, { status: 500 })
    }
}
