export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
const updateSchema = z.object({
    pages: z.number().optional(),
    originalCopies: z.number().optional(),
    additionalCopies: z.number().optional(),
    realtimeDevices: z.number().optional(),
    afterHoursCount: z.number().optional(),
    waitTimeCount: z.number().optional(),
    pageRate: z.number().optional(),
    copyRate: z.number().optional(),
    appearanceFee: z.number().optional(),
    congestionFee: z.number().optional(),
    locationBaseFee: z.number().optional(),
    realtimeFee: z.number().optional(),
    roughFee: z.number().optional(),
    videographerFee: z.number().optional(),
    interpreterFee: z.number().optional(),
    expertFee: z.number().optional(),
    afterHoursFee: z.number().optional(),
    waitTimeFee: z.number().optional(),
    cancellationFee: z.number().optional(),
    preBilledReviewFee: z.number().optional(),
    paperDeliveryFee: z.number().optional(),
    readAndSignFee: z.number().optional(),
    miniFee: z.number().optional(),
    indexFee: z.number().optional(),
    extraCertOriginalFee: z.number().optional(),
    minimumFee: z.number().optional(),
    cartFee: z.number().optional(),
    lateFee: z.number().optional(),
    processingFee: z.number().optional(),
    subtotal: z.number().optional(),
    total: z.number().optional(),
    rateTier: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional()
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || !['ADMIN', 'MANAGER', 'SUPER_ADMIN', 'STAFF'].includes((payload.role || '').toUpperCase())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const invoiceId = params.id
        const body = await request.json()
        const data = updateSchema.parse(body)

        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Prevent edits after payment
        if (invoice.status?.toUpperCase() === 'PAID') {
            return NextResponse.json({ error: 'Invoice is paid and cannot be edited.' }, { status: 403 })
        }

        const updated = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                ...data
            }
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Update invoice error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: params.id },
            include: {
                contact: true,
                booking: true
            }
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json(invoice)
    } catch (error) {
        console.error('Fetch invoice error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
