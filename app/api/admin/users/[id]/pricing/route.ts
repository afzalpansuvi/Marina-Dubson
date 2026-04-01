import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const user = await prisma.user.findUnique({
            where: { id },
            select: { contactId: true }
        })

        if (!user || !user.contactId) {
            return NextResponse.json({ error: 'Client contact not found' }, { status: 404 })
        }

        const pricing = await prisma.customPricing.findMany({
            where: { contactId: user.contactId },
            include: {
                contact: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(pricing)
    } catch (error) {
        console.error('Fetch custom pricing error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const body = await request.json()
        const { serviceId, pageRate, appearanceFeeRemote, appearanceFeeInPerson, realtimeFee, minimumFee, notes } = body

        if (!serviceId) {
            return NextResponse.json({ error: 'Service selection required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: { contactId: true }
        })

        if (!user || !user.contactId) {
            return NextResponse.json({ error: 'Client contact not found' }, { status: 404 })
        }

        // Upsert custom pricing for this contact and service
        // Since schema doesn't have unique constraint on [contactId, serviceId], 
        // we manually check for existing record for that service.
        const existing = await prisma.customPricing.findFirst({
            where: {
                contactId: user.contactId,
                serviceId: serviceId
            }
        })

        let result
        if (existing) {
            result = await prisma.customPricing.update({
                where: { id: existing.id },
                data: {
                    pageRate: pageRate ? parseFloat(pageRate) : null,
                    appearanceFeeRemote: appearanceFeeRemote ? parseFloat(appearanceFeeRemote) : null,
                    appearanceFeeInPerson: appearanceFeeInPerson ? parseFloat(appearanceFeeInPerson) : null,
                    realtimeFee: realtimeFee ? parseFloat(realtimeFee) : null,
                    minimumFee: minimumFee ? parseFloat(minimumFee) : null,
                    notes,
                    updatedAt: new Date()
                }
            })
        } else {
            result = await prisma.customPricing.create({
                data: {
                    contactId: user.contactId,
                    serviceId,
                    pageRate: pageRate ? parseFloat(pageRate) : null,
                    appearanceFeeRemote: appearanceFeeRemote ? parseFloat(appearanceFeeRemote) : null,
                    appearanceFeeInPerson: appearanceFeeInPerson ? parseFloat(appearanceFeeInPerson) : null,
                    realtimeFee: realtimeFee ? parseFloat(realtimeFee) : null,
                    minimumFee: minimumFee ? parseFloat(minimumFee) : null,
                    notes
                }
            })
        }

        // Ensure customPricingEnabled is set to true on the contact
        await prisma.contact.update({
            where: { id: user.contactId },
            data: { customPricingEnabled: true }
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Update custom pricing error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url)
        const pricingId = searchParams.get('pricingId')

        if (!pricingId) {
            return NextResponse.json({ error: 'Pricing ID required' }, { status: 400 })
        }

        await prisma.customPricing.delete({
            where: { id: pricingId }
        })

        return NextResponse.json({ message: 'Custom pricing removed' })
    } catch (error) {
        console.error('Delete custom pricing error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
