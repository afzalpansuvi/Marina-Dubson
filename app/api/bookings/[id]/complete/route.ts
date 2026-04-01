export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { integrationOrchestrator } from '@/lib/integration-orchestrator'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Authenticate admin
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            console.error('Auth failed: No valid token payload')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userRole = payload.role?.toUpperCase() || ''
        if (userRole !== 'ADMIN' && userRole !== 'MANAGER' && userRole !== 'SUPER_ADMIN') {
            console.error(`Auth failed: Insufficient role '${userRole}'`)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = params.id
        const billingData = await request.json()

        // Load booking to check client type
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { contact: true }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // If agency, skip invoice generation (direct deposit handling)
        if (booking.contact?.clientType?.toUpperCase() === 'AGENCY') {
            // Still mark the booking as completed
            await prisma.booking.update({
                where: { id },
                data: { bookingStatus: 'COMPLETED' }
            })
            return NextResponse.json({
                success: true,
                message: 'Agency booking completed. Direct deposit handled outside invoicing.',
                invoiceId: null
            })
        }

        // Trigger the Final Automation Flow (draft by default)
        const result = await integrationOrchestrator.generateFinalInvoice(id, billingData, { sendNow: false })

        // Explicitly mark booking as COMPLETED and invoice as DRAFT
        // (generateFinalInvoice only does this when sendNow: true)
        await prisma.booking.update({
            where: { id },
            data: {
                bookingStatus: 'COMPLETED',
                invoiceStatus: 'DRAFT',
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Job completed and invoice draft generated successfully.',
            invoiceId: result.localInvoice.id
        })
    } catch (error: any) {
        console.error('Job completion error:', error)
        return NextResponse.json({ error: error.message || 'Failed to complete job' }, { status: 500 })
    }
}
