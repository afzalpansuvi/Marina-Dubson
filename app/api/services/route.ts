import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const serviceSchema = z.object({
    serviceName: z.string().min(1),
    category: z.enum(['COURT_REPORTING', 'ACCESSIBILITY']),
    subService: z.enum(['DEPOSITION', 'ARBITRATION_HEARINGS', 'HEARING', 'EUO', 'CART', 'OTHER']),
    defaultMinimumFee: z.number().default(400),
    pageRate: z.number(),
    appearanceFeeRemote: z.number(),
    appearanceFeeInPerson: z.number(),
    realtimeFee: z.number(),
    expediteImmediate: z.number(),
    expedite1Day: z.number(),
    expedite2Day: z.number(),
    expedite3Day: z.number(),
    description: z.string().optional(),
    active: z.boolean().default(true),
})

// Requirement 7 order
const confirmedOrder = [
    'Deposition',
    'Arbitration/Hearings',
    'Hearing',
    'Examinations Under Oath',
    'CART',
    'Other'
]

// GET all services
export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const active = searchParams.get('active')

        const where: any = {}
        if (category) where.category = category
        if (active !== null) where.active = active === 'true'

        let services = await prisma.service.findMany({
            where,
            orderBy: { serviceName: 'asc' },
        })

        // Auto-seed if empty (and no filters applied)
        if (services.length === 0 && !category && (active === null)) {
            const defaultServices = [
                {
                    serviceName: 'Deposition',
                    category: 'COURT_REPORTING' as any,
                    subService: 'DEPOSITION' as any,
                    defaultMinimumFee: 400,
                    pageRate: 4.25,
                    appearanceFeeRemote: 350,
                    appearanceFeeInPerson: 400,
                    realtimeFee: 1.5,
                    expediteImmediate: 1.25,
                    expedite1Day: 1.10,
                    expedite2Day: 1.00,
                    expedite3Day: 0.90,
                    description: 'Certified stenographic reporting for standard depositions.',
                    active: true,
                },
                {
                    serviceName: 'Arbitration/Hearings',
                    category: 'COURT_REPORTING' as any,
                    subService: 'ARBITRATION_HEARINGS' as any,
                    defaultMinimumFee: 500,
                    pageRate: 6.25,
                    appearanceFeeRemote: 300,
                    appearanceFeeInPerson: 300,
                    realtimeFee: 2.5,
                    expediteImmediate: 1.25,
                    expedite1Day: 1.10,
                    expedite2Day: 1.00,
                    expedite3Day: 0.90,
                    description: 'Specialized stenographic support for arbitrations and detailed hearings.',
                    active: true,
                }
            ]

            for (const s of defaultServices) {
                await prisma.service.upsert({
                    where: { id: 'seed-' + s.serviceName.toLowerCase().replace(/[\s\/]/g, '-') },
                    update: s,
                    create: {
                        id: 'seed-' + s.serviceName.toLowerCase().replace(/[\s\/]/g, '-'),
                        ...s
                    } as any
                })
            }

            services = await prisma.service.findMany({
                where,
                orderBy: { serviceName: 'asc' },
            })
        }

        // Apply mandatory sorting per Requirement 7
        services.sort((a, b) => {
            const indexA = confirmedOrder.indexOf(a.serviceName)
            const indexB = confirmedOrder.indexOf(b.serviceName)
            if (indexA === -1 && indexB === -1) return a.serviceName.localeCompare(b.serviceName)
            if (indexA === -1) return 1
            if (indexB === -1) return -1
            return indexA - indexB
        })

        // Redact pricing for non-admin/staff
        let resultServices = services as any[]
        if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'STAFF')) {
            resultServices = services.map((s: any) => ({
                id: s.id,
                serviceName: s.serviceName,
                category: s.category,
                subService: s.subService,
                description: s.description,
                active: s.active,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
                pageRate: 'REDACTED',
                appearanceFeeRemote: 'REDACTED',
                appearanceFeeInPerson: 'REDACTED',
                defaultMinimumFee: 'REDACTED'
            }))
        }

        return NextResponse.json({ services: resultServices })
    } catch (error) {
        console.error('Get services error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const data = serviceSchema.parse(body)

        const service = await prisma.service.create({
            data,
        })

        return NextResponse.json(service, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Create service error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
