export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN' && payload.role !== 'MANAGER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const invoices = await prisma.reporterInvoice.findMany({
            include: {
                reporter: true,
                booking: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(invoices)
    } catch (error: any) {
        console.error('Fetch reporter invoices error:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch reporter invoices' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN' && payload.role !== 'MANAGER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { bookingId, reporterId, pageRate, appearanceFee, minimumFee, notes } = await request.json()

        if (!bookingId || !reporterId) {
            return NextResponse.json({ error: 'Booking ID and Reporter ID are required' }, { status: 400 })
        }

        const invoiceNumber = `RI-${Date.now().toString().slice(-6)}`

        // Check if one already exists
        const existing = await prisma.reporterInvoice.findUnique({
            where: { bookingId }
        })

        if (existing) {
            return NextResponse.json({ error: 'An offer already exists for this booking' }, { status: 400 })
        }

        const reporterInvoice = await prisma.reporterInvoice.create({
            data: {
                invoiceNumber,
                bookingId,
                reporterId,
                pageRate,
                appearanceFee,
                minimumFee,
                total: appearanceFee, // Initial total based on appearance fee
                status: 'PENDING',
                notes
            }
        })

        return NextResponse.json(reporterInvoice)
    } catch (error: any) {
        console.error('Create reporter invoice error:', error)
        return NextResponse.json({ error: error.message || 'Failed to create reporter invoice' }, { status: 500 })
    }
}
