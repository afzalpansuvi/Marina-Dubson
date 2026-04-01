export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { status } = await request.json()
        const id = params.id

        // Fetch the invoice to check ownership
        const invoice = await prisma.reporterInvoice.findUnique({
            where: { id }
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Allow reporter to accept/decline their own, or admin to change anything
        const isReporter = payload.role === 'REPORTER' && invoice.reporterId === payload.userId
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(payload.role || '')

        if (!isReporter && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const allowedReporterStatuses = ['ACCEPTED', 'DECLINED']
        if (isReporter && !allowedReporterStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status for reporter' }, { status: 400 })
        }

        const updated = await prisma.reporterInvoice.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('Update reporter invoice error:', error)
        return NextResponse.json({ error: error.message || 'Failed to update invoice' }, { status: 500 })
    }
}
