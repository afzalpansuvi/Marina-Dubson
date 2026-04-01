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
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userRole !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 1. Calculate Gross Revenue (All Paid Invoices)
        const invoices = await prisma.invoice.findMany({
            where: { status: 'PAID' }
        })
        const totalGrossRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)

        // 2. Calculate Total Outgoing (Locked Reporter Rates on COMPLETED bookings)
        // We consider a payment "outgoing" once the job is COMPLETED, because that's when the debt is incurred.
        const completedBookings = await prisma.booking.findMany({
            where: {
                bookingStatus: 'COMPLETED',
                reporterId: { not: null }
            },
            select: {
                lockedReporterPageRate: true,
                lockedReporterAppearanceFee: true,
                invoice: {
                    select: {
                        pages: true
                    }
                }
            }
        })

        const totalOutgoing = completedBookings.reduce((sum, booking) => {
            const pageRate = booking.lockedReporterPageRate || 0
            const appearance = booking.lockedReporterAppearanceFee || 0
            const pages = booking.invoice?.pages || 0
            return sum + (pages * pageRate) + appearance
        }, 0)

        // 3. Optional: Pending Outgoing (Assigned but not yet completed)
        const pendingBookings = await prisma.booking.findMany({
            where: {
                bookingStatus: { in: ['ACCEPTED', 'CONFIRMED'] },
                reporterId: { not: null }
            },
            select: {
                lockedReporterAppearanceFee: true
            }
        })
        const pendingOutgoing = pendingBookings.reduce((sum, b) => sum + (b.lockedReporterAppearanceFee || 0), 0)

        return NextResponse.json({
            grossRevenue: totalGrossRevenue,
            outgoingPayments: totalOutgoing,
            netProfit: totalGrossRevenue - totalOutgoing,
            pendingOutgoing,
            marginPercentage: totalGrossRevenue > 0 ? ((totalGrossRevenue - totalOutgoing) / totalGrossRevenue) * 100 : 0
        })
    } catch (error) {
        console.error('Financial summary error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
