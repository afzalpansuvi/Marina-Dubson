export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { z } from 'zod'
const serviceSchema = z.object({
    serviceName: z.string().min(1).optional(),
    category: z.enum(['COURT_REPORTING', 'ACCESSIBILITY']).optional(),
    subService: z.enum(['DEPOSITION', 'ARBITRATION_HEARINGS', 'HEARING', 'EUO', 'CART', 'OTHER']).optional(),
    defaultMinimumFee: z.number().optional(),
    pageRate: z.number().optional(),
    appearanceFeeRemote: z.number().optional(),
    appearanceFeeInPerson: z.number().optional(),
    realtimeFee: z.number().optional(),
    expediteImmediate: z.number().optional(),
    expedite1Day: z.number().optional(),
    expedite2Day: z.number().optional(),
    expedite3Day: z.number().optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
    isTemplate: z.boolean().optional(),
})

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const data = serviceSchema.parse(body)

        const service = await prisma.service.update({
            where: { id: params.id },
            data,
        })

        return NextResponse.json(service)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Update service error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.service.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ message: 'Service successfully removed' })
    } catch (error) {
        console.error('Delete service error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
