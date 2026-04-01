export const dynamic = 'force-dynamic'
/**
 * Client Confirmation API
 * Handles legal confirmation of booking terms
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import BookingRulesService from '@/lib/booking-rules'
import prisma from '@/lib/prisma'
import { PricingEngine } from '@/lib/pricing-engine'

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
        const {
            bookingId,
            confirmedScheduling,
            confirmedCancellation,
            confirmedFinancial
        } = body

        // Get booking to verify ownership
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { contact: true }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Verify user owns this booking (for clients) or is admin
        if (decoded.role === 'CLIENT' && (booking.contact as any).email !== decoded.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if booking is in ACCEPTED status
        if (booking.bookingStatus !== 'ACCEPTED') {
            return NextResponse.json({
                error: 'Booking must be in ACCEPTED status to confirm',
                currentStatus: booking.bookingStatus
            }, { status: 400 })
        }

        // Get client IP and user agent
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'

        // Create confirmation
        const confirmation = await BookingRulesService.createConfirmation({
            bookingId,
            contactId: booking.contactId,
            confirmedScheduling,
            confirmedCancellation,
            confirmedFinancial,
            ipAddress,
            userAgent
        })

        // Get updated booking
        const updatedBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                contact: true,
                service: true,
                confirmation: true
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Booking confirmed successfully',
            confirmation,
            booking: updatedBooking
        })

    } catch (error: any) {
        console.error('Confirmation error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to confirm booking'
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

        // Get booking with confirmation
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                contact: true,
                service: true,
                confirmation: true
            }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Verify access
        if (decoded.role === 'CLIENT' && (booking.contact as any).email !== decoded.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Calculate estimated total using Pricing Logic
        // Requirement 13: Determine rate tier from clientType (PRIVATE vs STANDARD/AGENCY)
        const rateTier = booking.contact.clientType.toUpperCase() === 'PRIVATE' ? 'PRIVATE' : 'STANDARD'
        const rates = await PricingEngine.getApplicableRates(booking.contactId, booking.serviceId, rateTier)
        const estimatedTotal = PricingEngine.calculateEstimate(rates) // Minimum fee automatically applied

        // Get confirmation terms
        const terms = BookingRulesService.getConfirmationTerms({
            bookingNumber: booking.bookingNumber,
            bookingDate: booking.bookingDate,
            bookingTime: booking.bookingTime,
            serviceName: booking.service.serviceName,
            location: booking.location || undefined,
            appearanceType: booking.appearanceType,
            estimatedTotal
        })

        // Check cancellation status
        const cancellationInfo = await BookingRulesService.canCancelWithoutFee(bookingId)

        return NextResponse.json({
            booking,
            terms,
            cancellationInfo,
            confirmation: booking.confirmation,
            requiresConfirmation: booking.bookingStatus === 'ACCEPTED' && !booking.confirmation
        })

    } catch (error: any) {
        console.error('Get confirmation error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to get confirmation details'
        }, { status: 500 })
    }
}
