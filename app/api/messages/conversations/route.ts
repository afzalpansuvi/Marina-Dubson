export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = payload.userId || payload.id
        if (!userId) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return NextResponse.json({ error: 'Authenticated user not found' }, { status: 404 })
        }

        // Build user-to-user conversation list
        const sentTo = await prisma.message.findMany({
            where: { senderId: userId },
            select: { recipientId: true },
            distinct: ['recipientId']
        })

        const receivedFrom = await prisma.message.findMany({
            where: { recipientId: userId },
            select: { senderId: true },
            distinct: ['senderId']
        })

        const userIds = Array.from(new Set([
            ...sentTo.map(m => m.recipientId),
            ...receivedFrom.map(m => m.senderId)
        ]))

        const contactConversations = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                receivedMessages: {
                    where: { senderId: userId },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                sentMessages: {
                    where: { recipientId: userId },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        })

        const formattedContacts = contactConversations.map(c => {
            const lastSent = c.receivedMessages[0]
            const lastReceived = c.sentMessages[0]
            const lastMsg = (!lastSent || (lastReceived && lastReceived.createdAt > lastSent.createdAt))
                ? lastReceived : lastSent

            return {
                id: c.id,
                name: `${c.firstName} ${c.lastName}`,
                email: c.email,
                role: c.role,
                lastMsg: lastMsg?.content || 'No messages yet',
                time: lastMsg ? lastMsg.createdAt : null,
                type: 'user',
                recipientId: c.id
            }
        }).sort((a, b) => (b.time?.getTime() || 0) - (a.time?.getTime() || 0))

        // Build claim-specific threads
        const adminNode = await prisma.user.findFirst({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'] } },
            orderBy: { createdAt: 'asc' }
        })

        const claimFilter = user.role === 'REPORTER'
            ? { reporterId: userId }
            : {}

        const claims = await prisma.jobClaim.findMany({
            where: claimFilter,
            include: {
                booking: {
                    select: {
                        bookingNumber: true,
                        proceedingType: true,
                        bookingDate: true
                    }
                },
                reporter: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        certification: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: { firstName: true, lastName: true, role: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        const claimThreads = claims.map(claim => {
            const lastMessage = claim.messages[0]
            const displayName = user.role === 'REPORTER'
                ? `Job #${claim.booking.bookingNumber} • ${claim.booking.proceedingType}`
                : `${claim.reporter.firstName} ${claim.reporter.lastName} • ${claim.booking.proceedingType}`
            const otherPartyId = user.role === 'REPORTER'
                ? (adminNode?.id ?? claim.reporterId)
                : claim.reporterId
            return {
                id: `claim:${claim.id}`,
                claimId: claim.id,
                bookingId: claim.bookingId,
                bookingNumber: claim.booking.bookingNumber,
                proceedingType: claim.booking.proceedingType,
                bookingDate: claim.booking.bookingDate,
                reporterName: `${claim.reporter.firstName} ${claim.reporter.lastName}`,
                name: displayName,
                role: `${claim.status} Claim`,
                status: claim.status,
                type: 'claim',
                recipientId: otherPartyId,
                lastMsg: lastMessage?.content || `Claim ${claim.status.toLowerCase()}`,
                time: lastMessage?.createdAt || claim.updatedAt
            }
        })

        const combined = [...claimThreads, ...formattedContacts]

        return NextResponse.json({ conversations: combined })
    } catch (error) {
        console.error('Fetch conversations error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
