import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getResponseDeadline } from '@/lib/compliance'

// Get all data subject requests
export async function GET(request: NextRequest) {
    try {
        const requests = await prisma.dataSubjectRequest.findMany({
            orderBy: { requestedAt: 'desc' },
            take: 100
        })

        // Add days remaining for response
        const requestsWithDeadline = requests.map(req => ({
            ...req,
            daysRemaining: getResponseDeadline(new Date(req.requestedAt))
        }))

        return NextResponse.json(requestsWithDeadline)
    } catch (error) {
        console.error('Error fetching data requests:', error)
        return NextResponse.json(
            { error: 'Failed to fetch data requests' },
            { status: 500 }
        )
    }
}
