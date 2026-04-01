export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const contactSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    companyName: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    clientType: z.enum(['AGENCY', 'LAW_FIRM', 'CORPORATE', 'PRIVATE']),
    billingContactName: z.string().optional(),
    billingContactEmail: z.string().email().optional(),
    customPricingEnabled: z.boolean().default(false),
    pricingNotes: z.string().optional(),
    notes: z.string().optional(),
    rateTier: z.enum(['STANDARD', 'PRIVATE']).default('STANDARD'),
})

// GET all contacts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const clientType = searchParams.get('clientType')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        const where: any = {}

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (clientType) {
            where.clientType = clientType
        }

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            bookings: true,
                            invoices: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.contact.count({ where }),
        ])

        return NextResponse.json({
            contacts,
            total,
            limit,
            offset,
        })
    } catch (error) {
        console.error('Get contacts error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST create new contact
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const data = contactSchema.parse(body)

        // Check if contact already exists
        const existingContact = await prisma.contact.findUnique({
            where: { email: data.email },
        })

        if (existingContact) {
            return NextResponse.json(
                { error: 'Contact with this email already exists' },
                { status: 409 }
            )
        }

        const contact = await prisma.contact.create({
            data,
        })

        return NextResponse.json(contact, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Create contact error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
