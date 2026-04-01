export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { integrationOrchestrator } from '@/lib/integration-orchestrator'
import prisma from '@/lib/prisma'

/**
 * PayPal Webhook Handler
 * Requirement 7.2: Update Invoice -> Paid, Booking -> Confirmed on payment
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // In production, you would verify the PayPal webhook signature here
        // For now, we process the standard checkout event

        if (body.event_type === 'CHECKOUT.ORDER.APPROVED' || body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const resource = body.resource
            // Extract booking ID from custom field or metadata
            const bookingId = resource.custom_id || (resource.purchase_units && resource.purchase_units[0].custom_id)

            if (bookingId) {
                const amount = resource.amount?.value || (resource.purchase_units && resource.purchase_units[0].amount.value)

                try {
                    // Step 3 of Integration Flow: Record payment in Zoho Books
                    await integrationOrchestrator.recordPayment(bookingId, {
                        amount: parseFloat(amount),
                        paymentMethod: 'paypal',
                        transactionId: resource.id,
                        paidAt: new Date().toISOString()
                    })

                    // Requirement 7.2: Booking -> Confirmed (if not already)
                    // We update the status to signify the booking is fully paid and confirmed for execution
                    await prisma.booking.update({
                        where: { id: bookingId },
                        data: {
                            bookingStatus: 'CONFIRMED'
                        }
                    })

                    console.log(`PayPal payment recorded for booking ${bookingId}`)
                } catch (error) {
                    console.error(`Failed to record PayPal payment for booking ${bookingId}:`, error)
                }
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('PayPal webhook error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
