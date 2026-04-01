export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { integrationOrchestrator } from '@/lib/integration-orchestrator'
import prisma from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
            try {
                // Step 3 of Integration Flow: Record payment in Zoho Books
                await integrationOrchestrator.recordPayment(bookingId, {
                    amount: paymentIntent.amount / 100, // Convert from cents
                    paymentMethod: 'stripe',
                    transactionId: paymentIntent.id,
                    paidAt: new Date().toISOString()
                })

                // Requirement 7.2: Booking -> Confirmed
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: { bookingStatus: 'CONFIRMED' }
                })

                console.log(`Payment recorded for booking ${bookingId}`)
            } catch (error) {
                console.error(`Failed to record payment for booking ${bookingId}:`, error)
                // We should probably log this to a table for retry/manual intervention
            }
        }
    }

    return NextResponse.json({ received: true })
}
