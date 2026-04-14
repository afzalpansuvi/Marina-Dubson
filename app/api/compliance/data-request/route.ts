import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Submit a data subject request (GDPR/NY SHIELD Act rights)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { requestType, email, name, description } = body

        // Validate required fields
        if (!requestType || !email || !name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate request type
        const validTypes = ['ACCESS', 'RECTIFICATION', 'ERASURE', 'RESTRICT', 'PORTABILITY']
        if (!validTypes.includes(requestType)) {
            return NextResponse.json(
                { error: 'Invalid request type' },
                { status: 400 }
            )
        }

        // Check for recent duplicate requests
        const recentRequest = await prisma.dataSubjectRequest.findFirst({
            where: {
                email,
                requestType,
                requestedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        })

        if (recentRequest) {
            return NextResponse.json(
                { error: 'A similar request was submitted recently. Please wait 24 hours before submitting again.' },
                { status: 429 }
            )
        }

        // Create the request
        const dataRequest = await prisma.dataSubjectRequest.create({
            data: {
                requestType,
                email,
                name,
                description,
                status: 'PENDING'
            }
        })

        // TODO: Send notification email to DPO
        // await sendDataRequestNotification(dataRequest)

        return NextResponse.json({
            success: true,
            message: 'Your request has been received. We will respond within 30 days.',
            requestId: dataRequest.id
        })

    } catch (error) {
        console.error('Error submitting data request:', error)
        return NextResponse.json(
            { error: 'Failed to submit request' },
            { status: 500 }
        )
    }
}
