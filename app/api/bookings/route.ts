export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { integrationOrchestrator } from '@/lib/integration-orchestrator'
import { BookingRulesService } from '@/lib/booking-rules'
import { PricingEngine } from '@/lib/pricing-engine'

const bookingSchema = z.object({
    contactId: z.string().optional(),
    serviceId: z.string(),
    proceedingType: z.string().optional(), // derived server-side from service name
    jurisdiction: z.string().optional(),
    state: z.string().optional(),
    bookingDate: z.string(),
    bookingTime: z.string(),
    location: z.string().optional(),
    venue: z.string().optional(),
    appearanceType: z.enum(['REMOTE', 'IN_PERSON']),
    turnaroundTime: z.string().optional(),
    specialRequirements: z.string().optional(),
    hasRough: z.boolean().optional(),
    hasRealtime: z.boolean().optional(),
    hasCart: z.boolean().optional(),
    hasVideographer: z.boolean().optional(),
    hasInterpreter: z.boolean().optional(),
    hasExpert: z.boolean().optional(),
}).passthrough() // allow extra client fields like addOns, selectedAddOns (they are ignored)

// GET all bookings
export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const contactIdParam = searchParams.get('contactId')
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        const where: any = {}

        // Role-based filtering
        const userRole = payload.role?.toUpperCase() || 'CLIENT' 

        if (['ADMIN', 'MANAGER', 'SUPER_ADMIN', 'STAFF'].includes(userRole)) {
            if (contactIdParam) where.contactId = contactIdParam
        } else if (userRole === 'REPORTER') {
            where.reporterId = payload.userId
        } else {
            if (!payload.email) {
                return NextResponse.json({ bookings: [], total: 0, limit, offset, message: 'No email in token.' })
            }
            const contact = await prisma.contact.findUnique({
                where: { email: payload.email }
            })

            if (!contact) {
                return NextResponse.json({
                    bookings: [],
                    total: 0,
                    limit,
                    offset,
                    message: "No associated contact record found."
                })
            }
            where.contactId = contact.id
        }

        if (status) where.bookingStatus = status

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
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
                    service: {
                        select: {
                            id: true,
                            serviceName: true,
                            category: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    reporter: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            certification: true,
                        },
                    },
                    invoice: {
                        select: {
                            id: true,
                            invoiceNumber: true,
                            status: true,
                            total: true,
                        }
                    }
                },
                orderBy: { bookingDate: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.booking.count({ where }),
        ])

        return NextResponse.json({
            bookings,
            total,
            limit,
            offset,
        })
    } catch (error) {
        console.error('Get bookings error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST create new booking
export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        const body = await request.json()
        const data = bookingSchema.parse(body)

        let contactId = data.contactId
        let userId = payload?.userId || 'system'

        if (!contactId && payload?.email) {
            const contact = await prisma.contact.findUnique({
                where: { email: payload.email }
            })
            if (contact) {
                contactId = contact.id
            }
        }

        if (!contactId) {
            return NextResponse.json({ error: 'Contact identity required' }, { status: 400 })
        }

        // Task 15: Blacklist Enforcement
        const contact = await prisma.contact.findUnique({
            where: { id: contactId }
        })

        if (contact?.isBlacklisted) {
            return NextResponse.json({
                error: 'Security Alert: This account has been flagged for administrative review. New booking clearance denied.',
                reason: contact.blacklistReason
            }, { status: 403 })
        }

        const serviceExists = await prisma.service.findUnique({
            where: { id: data.serviceId }
        })
        if (!serviceExists) {
            return NextResponse.json({ error: 'Invalid service selected' }, { status: 400 })
        }

        let validUserId = userId
        if (userId === 'system' || userId === 'dev-admin-id') {
            const firstAdmin = await prisma.user.findFirst({
                where: { role: 'ADMIN' }
            })
            if (firstAdmin) {
                validUserId = firstAdmin.id
            }
        } else {
            const userExists = await prisma.user.findUnique({
                where: { id: userId }
            })
            if (!userExists) {
                const firstAdmin = await prisma.user.findFirst({
                    where: { role: 'ADMIN' }
                })
                if (firstAdmin) {
                    validUserId = firstAdmin.id
                } else {
                    return NextResponse.json({ error: 'Invalid user identity' }, { status: 400 })
                }
            }
        }

        const count = await prisma.booking.count()
        const bookingNumber = `BK${String(count + 1).padStart(6, '0')}`

        const bookingDate = new Date(data.bookingDate)
        const cancellationDeadline = BookingRulesService.calculateCancellationDeadline(bookingDate)

        let rates
        try {
            rates = await PricingEngine.getApplicableRates(contactId, data.serviceId)
        } catch (rateError: any) {
            console.error('PricingEngine error:', rateError)
            return NextResponse.json({ error: rateError.message || 'Could not resolve pricing for this service.' }, { status: 400 })
        }

        const booking = await prisma.booking.create({
            data: {
                bookingNumber,
                contactId: contactId,
                serviceId: data.serviceId,
                userId: validUserId,
                proceedingType: serviceExists.serviceName,
                jurisdiction: data.jurisdiction,
                state: data.state,
                bookingDate: new Date(data.bookingDate),
                bookingTime: data.bookingTime,
                location: data.location,
                venue: data.venue,
                appearanceType: data.appearanceType,
                turnaroundTime: data.turnaroundTime,
                specialRequirements: data.specialRequirements,
                hasRough: data.hasRough || false,
                hasRealtime: data.hasRealtime || false,
                hasCart: data.hasCart || false,
                hasVideographer: data.hasVideographer || false,
                hasInterpreter: data.hasInterpreter || false,
                hasExpert: data.hasExpert || false,
                bookingStatus: 'SUBMITTED',
                cancellationDeadline,
                lockedPageRate: rates.pageRate,
                lockedAppearanceFee: data.appearanceType === 'REMOTE'
                    ? rates.appearanceFeeRemote
                    : rates.appearanceFeeInPerson,
                lockedMinimumFee: rates.minimumFee,
                lockedRealtimeFee: rates.realtimeFee,
            },
            include: {
                contact: true,
                service: true,
            },
        })

        const b = booking as any
        try {
            await integrationOrchestrator.syncToZohoCRM({
                bookingId: b.id,
                contactEmail: b.contact.email,
                contactFirstName: b.contact.firstName,
                contactLastName: b.contact.lastName,
                contactPhone: b.contact.phone || undefined,
                companyName: b.contact.companyName || undefined,
                serviceName: b.service.serviceName,
                serviceAmount: b.lockedAppearanceFee || rates.minimumFee,
                bookingDate: format(bookingDate, 'yyyy-MM-dd'),
                bookingNumber: booking.bookingNumber,
                proceedingType: booking.proceedingType,
            })
        } catch (syncError) {
            console.error('Integration sync failed:', syncError)
        }

        const emailTemplate = emailTemplates.bookingPending(
            bookingNumber,
            `${b.contact.firstName} ${b.contact.lastName}`
        )

        await sendEmail({
            to: b.contact.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        })

        // Notify Admin of New Booking
        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL || 'admin@marinadubson.com',
                subject: `ALERT: New booking ${bookingNumber} (${b.contact?.companyName || (b.contact ? b.contact.firstName + ' ' + b.contact.lastName : 'Unknown')})`,
                html: `
                    <div style="font-family: sans-serif;">
                        <h2>New Booking Strategy Detected</h2>
                        <p><strong>Booking Number:</strong> ${bookingNumber}</p>
                        <p><strong>Service:</strong> ${booking.proceedingType}</p>
                        <p><strong>Client:</strong> ${b.contact.firstName} ${b.contact.lastName} (${b.contact.email})</p>
                        <p><strong>Company:</strong> ${b.contact.companyName || 'Private Client'}</p>
                        <p><strong>Date:</strong> ${format(new Date(data.bookingDate), 'PPPP')} at ${data.bookingTime}</p>
                        <p><strong>Location:</strong> ${data.location || 'Remote'}</p>
                        <hr />
                        <p><strong>Add-ons Flagged:</strong></p>
                        <ul>
                            <li>Rough Draft: ${data.hasRough ? 'YES' : 'NO'}</li>
                            <li>Real-time: ${data.hasRealtime ? 'YES' : 'NO'}</li>
                            <li>CART Services: ${data.hasCart ? 'YES' : 'NO'}</li>
                            <li>Videographer: ${data.hasVideographer ? 'YES' : 'NO'}</li>
                            <li>Interpreter: ${data.hasInterpreter ? 'YES' : 'NO'}</li>
                        </ul>
                        <p><strong>Special Requirements:</strong></p>
                        <pre>${data.specialRequirements || 'None'}</pre>
                        <br />
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings?id=${booking.id}" style="background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Portal</a>
                    </div>
                `
            })
        } catch (adminNotifyErr) {
            console.error('New booking admin notification failed:', adminNotifyErr)
        }

        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Create booking error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE a booking
export async function DELETE(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
        }

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { contact: true }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        const isOwner = booking.contact?.email === payload.email || booking.userId === payload.userId || booking.reporterId === payload.userId
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(payload.role?.toUpperCase() || '')

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (booking.bookingStatus === 'COMPLETED' && !isAdmin) {
            return NextResponse.json({ error: 'Cannot delete completed bookings' }, { status: 400 })
        }

        await prisma.booking.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Booking deleted successfully' })
    } catch (error) {
        console.error('Delete booking error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
