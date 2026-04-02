export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'
const updateSchema = z.object({
    specialRequirements: z.string().optional(),
    reporterId: z.string().optional().nullable(),
    bookingStatus: z.string().optional(),
    isMarketplace: z.boolean().optional(),
    isOpened: z.boolean().optional(),
    serviceId: z.string().optional(),
    proceedingType: z.string().optional(),
    lockedAppearanceFee: z.number().optional(),
    lockedPageRate: z.number().optional(),
    lockedMinimumFee: z.number().optional(),
    lockedRealtimeFee: z.number().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const booking = await prisma.booking.findUnique({
            where: { id: params.id },
            include: {
                contact: true,
                service: true,
                reporter: true,
                invoice: true,
            }
        })

        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        return NextResponse.json(booking)
    } catch (error) {
        console.error('Get booking (id) error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const bookingId = params?.id
        if (!bookingId) return NextResponse.json({ error: 'Booking ID missing' }, { status: 400 })

        const body = await request.json()
        const data = updateSchema.parse(body)

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { invoice: true, contact: true }
        })
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

        // Removed restriction: Admin and client can add add-ons even after billing/payment
        /*
        if (booking.invoice?.status?.toUpperCase() === 'PAID') {
            return NextResponse.json({ error: 'Add-ons can no longer be edited after payment.' }, { status: 403 })
        }
        */

        // Authorization
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'MANAGER'].includes((payload.role || '').toUpperCase())
        const isOwner = booking.contact?.email === payload.email
        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const updateData: any = {
            specialRequirements: data.specialRequirements ?? booking.specialRequirements,
        }

        if (isAdmin) {
            if (data.reporterId !== undefined) updateData.reporterId = data.reporterId
            if (data.bookingStatus !== undefined) updateData.bookingStatus = data.bookingStatus
            if (data.isMarketplace !== undefined) updateData.isMarketplace = data.isMarketplace
            if (data.isOpened !== undefined) updateData.isOpened = data.isOpened
            if (data.serviceId !== undefined) updateData.serviceId = data.serviceId
            if (data.proceedingType !== undefined) updateData.proceedingType = data.proceedingType
            if (data.lockedAppearanceFee !== undefined) updateData.lockedAppearanceFee = data.lockedAppearanceFee
            if (data.lockedPageRate !== undefined) updateData.lockedPageRate = data.lockedPageRate
            if (data.lockedMinimumFee !== undefined) updateData.lockedMinimumFee = data.lockedMinimumFee
            if (data.lockedRealtimeFee !== undefined) updateData.lockedRealtimeFee = data.lockedRealtimeFee
        }

        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: updateData,
            include: { reporter: true, service: true, invoice: true }
        })

        // Notifications
        if (data.specialRequirements !== undefined) {
            // Client submitted add-ons -> notify admin
            if (!isAdmin) {
                try {
                    await sendEmail({
                        to: 'admin@marinadubson.com',
                        subject: `Add-on update for booking ${booking.bookingNumber} (${booking.contact?.companyName || (booking.contact ? `${booking.contact.firstName} ${booking.contact.lastName}` : 'Unknown')})`,
                        html: `
                            <p>A client updated add-ons/special requirements for their booking.</p>
                            <p><strong>Booking:</strong> ${booking.bookingNumber}</p>
                            <p><strong>Client:</strong> ${booking.contact?.firstName || ''} ${booking.contact?.lastName || ''} (${booking.contact?.email || ''})</p>
                            <p><strong>Company:</strong> ${booking.contact?.companyName || 'Private Client'}</p>
                            <p><strong>New Notes:</strong></p>
                            <pre>${(data.specialRequirements || '').replace(/</g, '&lt;')}</pre>
                        `
                    })
                } catch (notifyErr) {
                    console.error('Admin notification failed (non-fatal):', notifyErr)
                }
            } else if (booking.contact?.email) {
                // Admin accepted/updated add-ons -> notify client
                try {
                    await sendEmail({
                        to: booking.contact.email,
                        subject: `Add-ons accepted for booking ${booking.bookingNumber}`,
                        html: `
                            <p>Your add-on request has been accepted.</p>
                            <p><strong>Booking:</strong> ${booking.bookingNumber}</p>
                            <p><strong>Details:</strong></p>
                            <pre>${(data.specialRequirements || '').replace(/</g, '&lt;')}</pre>
                            <p>These items will be included on the upcoming invoice.</p>
                        `
                    })
                } catch (notifyErr) {
                    console.error('Client notification failed (non-fatal):', notifyErr)
                }
            }
        }

        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Update booking error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
