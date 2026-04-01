export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || payload.role !== 'REPORTER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const invoices = await prisma.reporterInvoice.findMany({
            where: {
                reporterId: payload.userId
            },
            include: {
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
        return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 })
    }
}
