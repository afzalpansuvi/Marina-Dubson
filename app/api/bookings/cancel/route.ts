export const dynamic = 'force-dynamic'
/**
 * Booking Cancellation API
 * Handles booking cancellations with automatic fee enforcement
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import BookingRulesService, { MINIMUM_BOOKING_FEE } from '@/lib/booking-rules'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const body = await request.json()
        const { bookingId, reason } = body

        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                contact: true,
                service: true
            }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Verify access
        if (decoded.role === 'CLIENT' && booking.contact.email !== decoded.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if booking can be cancelled
        if (!['SUBMITTED', 'ACCEPTED', 'CONFIRMED'].includes(booking.bookingStatus)) {
            return NextResponse.json({
                error: 'Booking cannot be cancelled in current status',
                currentStatus: booking.bookingStatus
            }, { status: 400 })
        }

        // Check cancellation deadline
        const cancellationInfo = await BookingRulesService.canCancelWithoutFee(bookingId)
        const feeAmount = cancellationInfo.lateFeeAmount ?? ((booking as any).lockedMinimumFee || MINIMUM_BOOKING_FEE)

        let invoice = null
        let feeApplied = false

        // If past deadline and booking was confirmed, generate cancellation invoice
        if (!cancellationInfo.canCancel && booking.bookingStatus === 'CONFIRMED') {
            try {
                invoice = await BookingRulesService.generateCancellationInvoice(bookingId, { feeAmount })
                feeApplied = true
            } catch (error: any) {
                console.error('Failed to generate cancellation invoice:', error)
                // Continue with cancellation even if invoice generation fails
            }
        } else {
            // No fee - just cancel the booking
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    bookingStatus: 'CANCELLED',
                    notes: `${booking.notes || ''}\n\nCancelled: ${new Date().toLocaleString()}\nReason: ${reason || 'Not specified'}\nCancelled by: ${decoded.email}`
                }
            })
        }

        // Get updated booking
        const updatedBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                contact: true,
                service: true,
                invoice: true
            }
        })

        return NextResponse.json({
            success: true,
            message: feeApplied
                ? `Booking cancelled. Cancellation fee of $${feeAmount.toFixed(2)} has been applied and invoice generated.`
                : 'Booking cancelled successfully. No cancellation fee applied.',
            booking: updatedBooking,
            feeApplied,
            invoice,
            cancellationInfo
        })

    } catch (error: any) {
        console.error('Cancellation error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to cancel booking'
        }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const bookingId = searchParams.get('bookingId')

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
        }

        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { contact: true }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Verify access
        if (decoded.role === 'CLIENT' && booking.contact.email !== decoded.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Get cancellation info
        const cancellationInfo = await BookingRulesService.canCancelWithoutFee(bookingId)

        return NextResponse.json({
            booking,
            cancellationInfo,
            canCancel: ['SUBMITTED', 'ACCEPTED', 'CONFIRMED'].includes(booking.bookingStatus),
            currentStatus: booking.bookingStatus
        })

    } catch (error: any) {
        console.error('Get cancellation info error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to get cancellation information'
        }, { status: 500 })
    }
}
