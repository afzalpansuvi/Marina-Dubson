import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initializeDataRetentionPolicies, getDataRetentionReport } from '@/lib/compliance'

// Get all retention policies with stats
export async function GET(request: NextRequest) {
    try {
        // Initialize default policies if none exist
        const existingCount = await prisma.dataRetentionPolicy.count()
        if (existingCount === 0) {
            await initializeDataRetentionPolicies()
        }

        const policies = await getDataRetentionReport()
        return NextResponse.json(policies)
    } catch (error) {
        console.error('Error fetching retention policies:', error)
        return NextResponse.json(
            { error: 'Failed to fetch retention policies' },
            { status: 500 }
        )
    }
}
