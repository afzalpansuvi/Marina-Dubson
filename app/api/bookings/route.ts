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
    proceedingType: z.string(),
    jurisdiction: z.string().optional(),
    state: z.string().optional(),
    bookingDate: z.string(),
    bookingTime: z.string(),
    location: z.string().optional(),
    venue: z.string().optional(),
    appearanceType: z.enum(['REMOTE', 'IN_PERSON']),
    turnaroundTime: z.string().optional(),
    specialRequirements: z.string().optional(),
})

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

        const rates = await PricingEngine.getApplicableRates(contactId, data.serviceId)

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

        try {
            await integrationOrchestrator.syncToZohoCRM({
                bookingId: booking.id,
                contactEmail: booking.contact.email,
                contactFirstName: booking.contact.firstName,
                contactLastName: booking.contact.lastName,
                contactPhone: booking.contact.phone || undefined,
                companyName: booking.contact.companyName || undefined,
                serviceName: booking.service.serviceName,
                serviceAmount: booking.lockedAppearanceFee || rates.minimumFee,
                bookingDate: format(bookingDate, 'yyyy-MM-dd'),
                bookingNumber: booking.bookingNumber,
                proceedingType: booking.proceedingType,
            })
        } catch (syncError) {
            console.error('Integration sync failed:', syncError)
        }

        const emailTemplate = emailTemplates.bookingPending(
            bookingNumber,
            `${booking.contact.firstName} ${booking.contact.lastName}`
        )

        await sendEmail({
            to: booking.contact.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        })

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
