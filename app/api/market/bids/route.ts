export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const claimSchema = z.object({
    bookingId: z.string(),
    notes: z.string().optional(),
    notInterested: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || payload.role !== 'REPORTER') {
            return NextResponse.json({ error: 'Only reporters can claim jobs' }, { status: 403 })
        }

        const body = await request.json()
        const data = claimSchema.parse(body)

        // Check if job exists and is in marketplace
        const job = await prisma.booking.findUnique({
            where: { id: data.bookingId }
        })

        if (!job || !job.isMarketplace) {
            return NextResponse.json({ error: 'Job not available for claiming' }, { status: 400 })
        }

        // Check for existing claim
        const existingClaim = await prisma.jobClaim.findFirst({
            where: {
                bookingId: data.bookingId,
                reporterId: payload.userId
            }
        })

        if (existingClaim) {
            return NextResponse.json({ error: 'You have already claimed this job' }, { status: 409 })
        }

        const claim = await prisma.jobClaim.create({
            data: {
                bookingId: data.bookingId,
                reporterId: payload.userId,
                notes: data.notes,
                status: data.notInterested ? 'DECLINED' : 'PENDING'
            }
        })

        // Create a separate chat thread (initial message) between Admin and that reporter
        try {
            const reporter = await prisma.user.findUnique({
                where: { id: payload.userId }
            })
            const admin = await prisma.user.findFirst({
                where: { role: 'ADMIN' },
                orderBy: { createdAt: 'asc' }
            })

            if (admin && reporter) {
                const content = data.notInterested
                    ? `System Alert: Reporter ${reporter.firstName} ${reporter.lastName} marked Job #${job.bookingNumber} (${job.proceedingType}) as not interested.`
                    : `System Alert: Reporter ${reporter.firstName} ${reporter.lastName} has claimed Job #${job.bookingNumber} (${job.proceedingType}). Please review and assign.`
                await prisma.message.create({
                    data: {
                        senderId: reporter.id,
                        recipientId: admin.id,
                        content,
                        claimId: claim.id
                    }
                })
            }
        } catch (msgErr) {
            console.error('Failed to create auto-message for claim:', msgErr)
            // Non-critical failure, don't block the bid creation
        }

        return NextResponse.json(claim, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Submit bid error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const bookingId = searchParams.get('bookingId')

        if (payload.role === 'REPORTER') {
            const claims = await prisma.jobClaim.findMany({
                where: {
                    reporterId: payload.userId,
                    ...(bookingId ? { bookingId } : {})
                },
                include: {
                    booking: {
                        include: {
                            service: true,
                            contact: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
            return NextResponse.json({ claims })
        }

        if (payload.role !== 'ADMIN' && payload.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required for administrative view' }, { status: 400 })
        }

        const claims = await prisma.jobClaim.findMany({
            where: { bookingId },
            include: {
                reporter: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        certification: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json({ claims })
    } catch (error) {
        console.error('Fetch bids error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'MANAGER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { claimId, status } = await request.json()

        if (!claimId || !status) {
            return NextResponse.json({ error: 'Claim ID and status required' }, { status: 400 })
        }

        const claim = await prisma.jobClaim.findUnique({
            where: { id: claimId },
            include: { booking: true }
        })

        if (!claim) {
            return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
        }

        if (status === 'ACCEPTED') {
            // Accept this claim and decline others
            await prisma.$transaction([
                prisma.jobClaim.update({
                    where: { id: claimId },
                    data: { status: 'ACCEPTED' }
                }),
                prisma.jobClaim.updateMany({
                    where: {
                        bookingId: claim.bookingId,
                        id: { not: claimId }
                    },
                    data: { status: 'DECLINED' }
                }),
                prisma.booking.update({
                    where: { id: claim.bookingId },
                    data: {
                        reporterId: claim.reporterId,
                        bookingStatus: 'ASSIGNED',
                        isMarketplace: false // Close marketplace listing
                    }
                })
            ])
        } else {
            await prisma.jobClaim.update({
                where: { id: claimId },
                data: { status }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Update bid error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
