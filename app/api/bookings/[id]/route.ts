import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const updateSchema = z.object({
    specialRequirements: z.string().optional(),
    reporterId: z.string().optional(),
    bookingStatus: z.string().optional(),
    isMarketplace: z.boolean().optional(),
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

        // Lock edits once invoice is paid
        if (booking.invoice?.status?.toUpperCase() === 'PAID') {
            return NextResponse.json({ error: 'Add-ons can no longer be edited after payment.' }, { status: 403 })
        }

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
            updateData.reporterId = data.reporterId ?? booking.reporterId
            updateData.bookingStatus = data.bookingStatus ?? booking.bookingStatus
            updateData.isMarketplace = data.isMarketplace ?? booking.isMarketplace
            updateData.serviceId = data.serviceId ?? booking.serviceId
            updateData.proceedingType = data.proceedingType ?? booking.proceedingType
            updateData.lockedAppearanceFee = data.lockedAppearanceFee ?? booking.lockedAppearanceFee
            updateData.lockedPageRate = data.lockedPageRate ?? booking.lockedPageRate
            updateData.lockedMinimumFee = data.lockedMinimumFee ?? booking.lockedMinimumFee
            updateData.lockedRealtimeFee = data.lockedRealtimeFee ?? booking.lockedRealtimeFee
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
                        subject: `Add-on update for booking ${booking.bookingNumber}`,
                        html: `
                            <p>A client updated add-ons/special requirements.</p>
                            <p><strong>Booking:</strong> ${booking.bookingNumber}</p>
                            <p><strong>Client:</strong> ${booking.contact?.firstName || ''} ${booking.contact?.lastName || ''} (${booking.contact?.email || ''})</p>
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
