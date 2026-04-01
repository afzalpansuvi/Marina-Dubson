/**
 * Stripe Checkout Payment Link Generator
 * Generates a per-invoice Stripe Checkout session and stores the link
 */

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16' as any,
        })

        const invoice = await prisma.invoice.findUnique({
            where: { id: params.id },
            include: {
                contact: true,
                booking: { include: { service: true } },
            },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        if (invoice.status === 'PAID') {
            return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://marina-dubson.vercel.app'

        // Build line items from the invoice
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

        const pages = invoice.pages || 0

        // Original transcript
        if (invoice.originalCopies > 0 && pages > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Court Reporter Transcript (Original)`,
                        description: `${pages} pages × $${invoice.pageRate.toFixed(2)}/pg × ${invoice.originalCopies} original(s)`,
                    },
                    unit_amount: Math.round(pages * invoice.pageRate * invoice.originalCopies * 100),
                },
                quantity: 1,
            })
        }

        // Copy rate
        if (invoice.additionalCopies > 0 && pages > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Transcript Copy`,
                        description: `${pages} pages × $${invoice.copyRate.toFixed(2)}/pg × ${invoice.additionalCopies} copy/copies`,
                    },
                    unit_amount: Math.round(pages * invoice.copyRate * invoice.additionalCopies * 100),
                },
                quantity: 1,
            })
        }

        // Appearance fee
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `Appearance Fee`,
                    description: `${invoice.booking?.proceedingType || 'Court appearance'} (includes $${invoice.congestionFee.toFixed(2)} congestion fee)`,
                },
                unit_amount: Math.round((invoice.appearanceFee + invoice.congestionFee) * 100),
            },
            quantity: 1,
        })

        // Realtime
        if (invoice.realtimeFee && invoice.realtimeFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Realtime Feed (${invoice.realtimeDevices || 1} device(s))` },
                    unit_amount: Math.round(invoice.realtimeFee * 100),
                },
                quantity: 1,
            })
        }

        // Rough draft
        if (invoice.roughFee && invoice.roughFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Rough Draft`, description: `$1.25/page` },
                    unit_amount: Math.round(invoice.roughFee * 100),
                },
                quantity: 1,
            })
        }

        // Videographer
        if (invoice.videographerFee && invoice.videographerFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Videographer Fee`, description: `$0.30/page` },
                    unit_amount: Math.round(invoice.videographerFee * 100),
                },
                quantity: 1,
            })
        }

        // Interpreter
        if (invoice.interpreterFee && invoice.interpreterFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Interpreter Fee`, description: `$0.30/page` },
                    unit_amount: Math.round(invoice.interpreterFee * 100),
                },
                quantity: 1,
            })
        }

        // Expert/Medical/Technical
        if (invoice.expertFee && invoice.expertFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Expert / Medical / Technical Surcharge`, description: `$0.50/page` },
                    unit_amount: Math.round(invoice.expertFee * 100),
                },
                quantity: 1,
            })
        }

        // After-hours
        if (invoice.afterHoursFee && invoice.afterHoursFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `After-Hours Fee`, description: `$100/hr after 5:30 PM (${invoice.afterHoursCount} hr(s))` },
                    unit_amount: Math.round(invoice.afterHoursFee * 100),
                },
                quantity: 1,
            })
        }

        // Wait time
        if (invoice.waitTimeFee && invoice.waitTimeFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Wait Time Fee`, description: `$100/hr after 30 minutes` },
                    unit_amount: Math.round(invoice.waitTimeFee * 100),
                },
                quantity: 1,
            })
        }

        // Cancellation fee
        if (invoice.cancellationFee && invoice.cancellationFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Cancellation Fee`, description: `Late cancellation — minimum booking fee applies` },
                    unit_amount: Math.round(invoice.cancellationFee * 100),
                },
                quantity: 1,
            })
        }

        // If total would be less than minimum, add a minimum fee adjustment
        const computedTotal = lineItems.reduce((sum, item) => {
            const amount = item.price_data?.unit_amount || 0
            return sum + (amount / 100) * (item.quantity || 1)
        }, 0)

        if (computedTotal < invoice.minimumFee && lineItems.length > 0) {
            const diff = invoice.minimumFee - computedTotal
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Minimum Booking Fee Adjustment`,
                        description: `Applied to meet the $${invoice.minimumFee.toFixed(2)} minimum`,
                    },
                    unit_amount: Math.round(diff * 100),
                },
                quantity: 1,
            })
        }

        // Fallback: if no line items (e.g. zero-page draft), use total
        if (lineItems.length === 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Invoice ${invoice.invoiceNumber}`, description: `Court Reporting Services — Marina Dubson Stenographic Services` },
                    unit_amount: Math.round(invoice.total * 100),
                },
                quantity: 1,
            })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: invoice.contact.email,
            metadata: {
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                bookingId: invoice.bookingId,
                contactId: invoice.contactId,
            },
            success_url: `${appUrl}/client/portal?tab=financials&paid=1&invoice=${invoice.invoiceNumber}`,
            cancel_url: `${appUrl}/client/portal?tab=financials`,
            payment_intent_data: {
                metadata: {
                    bookingId: invoice.bookingId,
                    invoiceId: invoice.id,
                },
            },
        })

        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
        })

    } catch (error: any) {
        console.error('Stripe checkout session error:', error)
        return NextResponse.json({ error: error.message || 'Failed to create payment link' }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Return existing payment URL if already stored
    try {
        const invoice = await prisma.invoice.findUnique({ where: { id: params.id } })
        if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ status: invoice.status, total: invoice.total })
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
