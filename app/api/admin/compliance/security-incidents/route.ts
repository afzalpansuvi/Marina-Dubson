import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all security incidents
export async function GET(request: NextRequest) {
    try {
        const incidents = await prisma.securityIncident.findMany({
            orderBy: { detectedAt: 'desc' },
            take: 100
        })

        return NextResponse.json(incidents)
    } catch (error) {
        console.error('Error fetching security incidents:', error)
        return NextResponse.json(
            { error: 'Failed to fetch security incidents' },
            { status: 500 }
        )
    }
}

// Report a new security incident
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { incidentType, severity, description, affectedData, affectedUsers } = body

        const incident = await prisma.securityIncident.create({
            data: {
                incidentType,
                severity,
                description,
                affectedData: affectedData ? JSON.stringify(affectedData) : null,
                affectedUsers: affectedUsers || 0,
                status: 'OPEN'
            }
        })

        return NextResponse.json({
            success: true,
            incident
        })
    } catch (error) {
        console.error('Error creating security incident:', error)
        return NextResponse.json(
            { error: 'Failed to create security incident' },
            { status: 500 }
        )
    }
}
