export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { z } from 'zod'
import { integrationOrchestrator } from '@/lib/integration-orchestrator'

const invoiceSchema = z.object({
    bookingId: z.string(),
    pages: z.number().optional(),
    originalCopies: z.number().default(1),
    additionalCopies: z.number().default(0),
    realtimeDevices: z.number().optional(),
    afterHoursCount: z.number().optional(),
    waitTimeCount: z.number().optional(),
    hasRough: z.boolean().optional(),
    hasPaperDelivery: z.boolean().optional(),
    isOnRecordBust: z.boolean().optional(),
    hasVideographer: z.boolean().optional(),
    hasInterpreter: z.boolean().optional(),
    hasExpert: z.boolean().optional(),
    notes: z.string().optional(),
    sendNow: z.boolean().optional(),
    locationBaseFee: z.number().optional(),
    hasPreBilledReview: z.boolean().optional()
})

// GET all invoices
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const contactId = searchParams.get('contactId')
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        const where: any = {}
        if (contactId) where.contactId = contactId
        if (status) where.status = status

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: {
                    contact: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            companyName: true,
                        },
                    },
                    booking: {
                        select: {
                            id: true,
                            bookingNumber: true,
                            bookingDate: true,
                            proceedingType: true,
                            service: {
                                select: {
                                    serviceName: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { invoiceDate: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.invoice.count({ where }),
        ])

        return NextResponse.json({
            invoices,
            total,
            limit,
            offset,
        })
    } catch (error) {
        console.error('Get invoices error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST create new invoice
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const data = invoiceSchema.parse(body)

        // Load booking to check client type (skip invoicing for agency)
        const booking = await prisma.booking.findUnique({
            where: { id: data.bookingId },
            include: { contact: true }
        })

        if (booking?.contact?.clientType?.toUpperCase() === 'AGENCY') {
            return NextResponse.json(
                { message: 'Agency payment handled via direct deposit. No invoice generated.' },
                { status: 200 }
            )
        }

        // Use the centralized IntegrationOrchestrator to ensure consistency
        // with pricing, Zoho Books sync, and Mailchimp updates.
        const result = await integrationOrchestrator.generateFinalInvoice(data.bookingId, {
            pages: data.pages || 0,
            originalCopies: data.originalCopies,
            additionalCopies: data.additionalCopies,
            realtimeDevices: data.realtimeDevices,
            hasRough: data.hasRough,
            hasPaperDelivery: data.hasPaperDelivery,
            isOnRecordBust: data.isOnRecordBust,
            hasVideographer: data.hasVideographer,
            hasInterpreter: data.hasInterpreter,
            hasExpert: data.hasExpert,
            afterHoursCount: data.afterHoursCount,
            waitTimeCount: data.waitTimeCount,
            locationBaseFee: data.locationBaseFee,
            hasPreBilledReview: data.hasPreBilledReview,
            notes: data.notes
        }, { sendNow: data.sendNow ?? false })

        // Build Stripe checkout session (Optional addition to standard flow)
        let stripePaymentUrl: string | null = null
        try {
            const stripeRes = await fetch(
                `${process.env.NEXT_PUBLIC_APP_URL}/api/invoices/${result.localInvoice.id}/payment-link`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ invoiceId: result.localInvoice.id }),
                }
            )
            if (stripeRes.ok) {
                const stripeData = await stripeRes.json()
                stripePaymentUrl = stripeData.url
            }
        } catch (e) {
            console.warn('Stripe link generation skipped:', e)
        }

        return NextResponse.json({
            ...result.localInvoice,
            zohoInvoiceId: result.zohoInvoiceId,
            stripePaymentUrl
        }, { status: 201 })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Create invoice error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
