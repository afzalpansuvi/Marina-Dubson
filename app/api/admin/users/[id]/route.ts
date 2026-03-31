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
            include: {
                assignedTasks: {
                    orderBy: { createdAt: 'desc' }
                },
                createdTasks: {
                    orderBy: { createdAt: 'desc' }
                },
                contact: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Fetch user error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const body = await request.json()
        const {
            firstName, lastName, email, avatar, certification, company, bio,
            portfolio, availability, basePageRate, baseAppearanceFee,
            baseMinimumFee, paymentPreference, taxId
        } = body

        const updateData: any = {
            firstName,
            lastName,
            email,
            avatar,
            certification,
            company,
            bio,
            portfolio,
            availability,
            basePageRate: basePageRate ? parseFloat(basePageRate) : undefined,
            baseAppearanceFee: baseAppearanceFee ? parseFloat(baseAppearanceFee) : undefined,
            baseMinimumFee: baseMinimumFee ? parseFloat(baseMinimumFee) : undefined,
            paymentPreference,
            taxId
        }

        if (body.contact) {
            updateData.contact = {
                update: {
                    rating: body.contact.rating ? parseInt(body.contact.rating) : undefined,
                    isBlacklisted: body.contact.isBlacklisted !== undefined ? body.contact.isBlacklisted : undefined,
                    blacklistReason: body.contact.blacklistReason,
                    internalStaffNotes: body.contact.internalStaffNotes,
                    customPricingEnabled: body.contact.customPricingEnabled,
                    pricingNotes: body.contact.pricingNotes
                }
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                assignedTasks: {
                    orderBy: { createdAt: 'desc' }
                },
                createdTasks: {
                    orderBy: { createdAt: 'desc' }
                },
                contact: true
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        await prisma.user.delete({ where: { id } })
        return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
