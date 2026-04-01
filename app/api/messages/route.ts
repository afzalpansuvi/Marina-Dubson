export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const messageSchema = z.object({
    content: z.string().min(1),
    recipientId: z.string().optional(),
    bookingId: z.string().optional(),
    contactId: z.string().optional(),
    claimId: z.string().optional()
})

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

        // Verify the current user actually exists in DB
        const currentUser = await prisma.user.findUnique({ where: { id: userId } })
        if (!currentUser) {
            return NextResponse.json({ error: 'Authenticated user not found in database', code: 'USER_NOT_FOUND' }, { status: 404 })
        }

        const { searchParams } = new URL(request.url)
        const claimId = searchParams.get('claimId')
        const recipientId = claimId ? null : searchParams.get('recipientId')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let where: any
        if (claimId) {
            const claim = await prisma.jobClaim.findUnique({ where: { id: claimId } })
            if (!claim) {
                return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
            }

            const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes((payload.role || '').toUpperCase())
            if (!isAdmin && claim.reporterId !== userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }

            where = {
                claimId,
                OR: [
                    { senderId: userId },
                    { recipientId: userId }
                ]
            }
        } else {
            // Build the where clause: get the conversation thread between two users
            where = recipientId
                ? {
                    OR: [
                        { senderId: userId, recipientId: recipientId },
                        { senderId: recipientId, recipientId: userId },
                    ]
                }
                : {
                    OR: [
                        { senderId: userId },
                        { recipientId: userId }
                    ]
                }
        }

        const messages = await prisma.message.findMany({
            where,
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, role: true }
                },
                recipient: {
                    select: { id: true, firstName: true, lastName: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        })

        return NextResponse.json({ messages })
    } catch (error) {
        console.error('Fetch messages error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = payload.userId || payload.id
        const userRole = (payload.role || '').toUpperCase()

        if (!userId) {
            return NextResponse.json({ error: 'Invalid token: no user ID' }, { status: 400 })
        }

        // ✅ CRITICAL FIX: Verify sender actually exists before creating a message
        const senderUser = await prisma.user.findUnique({ where: { id: userId } })
        if (!senderUser) {
            console.error(`[MSG-POST] Sender ${userId} not found in DB. Token role: ${userRole}`)
            return NextResponse.json({
                error: 'Your account could not be verified. Please log out and log in again.',
                code: 'SENDER_NOT_FOUND'
            }, { status: 403 })
        }

        const body = await request.json()
        const data = messageSchema.parse(body)

        // Find recipient: use provided ID or default to an admin node for client/reporter/staff.
        let recipientId = data.recipientId
        let claimRecord = null
        const defaultAdmin = await prisma.user.findFirst({
            where: {
                role: { in: ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'] }
            },
            orderBy: { createdAt: 'asc' }
        })

        if (data.claimId) {
            claimRecord = await prisma.jobClaim.findUnique({ where: { id: data.claimId } })
            if (!claimRecord) {
                return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
            }

            const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(userRole)
            if (!isAdmin && claimRecord.reporterId !== senderUser.id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        if (!recipientId && (userRole === 'CLIENT' || userRole === 'REPORTER' || userRole === 'STAFF')) {
            recipientId = defaultAdmin?.id
        }

        if (claimRecord) {
            const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(userRole)
            const targetId = isAdmin ? claimRecord.reporterId : (defaultAdmin?.id ?? claimRecord.reporterId)
            recipientId = targetId
        }

        if (!recipientId) {
            console.error('[MSG-POST] No recipient could be identified. Payload:', { userId, userRole })
            return NextResponse.json({ error: 'Recipient not found. Please select a valid contact.' }, { status: 400 })
        }

        // Verify recipient also exists
        const recipientUser = await prisma.user.findUnique({ where: { id: recipientId } })
        if (!recipientUser) {
            return NextResponse.json({ error: 'Recipient user not found in database.' }, { status: 404 })
        }

        const message = await prisma.message.create({
            data: {
                senderId: senderUser.id,        // Use verified DB id
                recipientId: recipientUser.id,  // Use verified DB id
                content: data.content,
                contactId: data.contactId ?? null,
                claimId: claimRecord?.id ?? null,
            },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, role: true }
                },
                recipient: {
                    select: { id: true, firstName: true, lastName: true, role: true }
                }
            }
        })

        // Mark any unread incoming messages from this recipient as read
        await prisma.message.updateMany({
            where: {
                senderId: recipientUser.id,
                recipientId: senderUser.id,
                isRead: false
            },
            data: { isRead: true }
        })

        // Optional CRM logging - fire and forget, don't block response
        try {
            const contact = await prisma.contact.findUnique({ where: { email: senderUser.email } })
            if (contact?.notes) {
                const metadata = JSON.parse(contact.notes)
                if (metadata.zohoCRMContactId) {
                    const { zohoCRM } = await import('@/lib/zoho-crm')
                    await zohoCRM.addNote(metadata.zohoCRMContactId, 'Contacts', `[Portal Message] ${senderUser.firstName}: ${data.content}`)
                }
            }
        } catch (crmErr) {
            console.error('CRM Logging failed (non-fatal):', crmErr)
        }

        return NextResponse.json(message, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Send message error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
