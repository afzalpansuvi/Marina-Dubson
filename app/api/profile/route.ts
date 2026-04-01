export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const targetId = payload.id || payload.userId
        console.log('[DEBUG] Profile update attempt for ID:', targetId, 'from payload:', payload)
        const { firstName, lastName, certification, company, avatar, bio, portfolio, availability } = body

        let updatedUser;
        try {
            updatedUser = await prisma.user.update({
                where: { id: targetId },
                data: {
                    firstName,
                    lastName,
                    certification,
                    company,
                    avatar,
                    bio,
                    portfolio,
                    availability
                }
            })
        } catch (updateError: any) {
            // Fallback: If record not found by ID, try finding by email from payload
            if (updateError.code === 'P2025' && payload.email) {
                console.log('[DEBUG] ID-based update failed, attempting Email-based update for:', payload.email)
                updatedUser = await prisma.user.update({
                    where: { email: payload.email },
                    data: {
                        firstName,
                        lastName,
                        certification,
                        company,
                        avatar,
                        bio,
                        portfolio,
                        availability
                    }
                })
            } else {
                throw updateError
            }
        }

        // Also update the linked contact if it exists
        try {
            await prisma.contact.update({
                where: { email: updatedUser.email },
                data: {
                    firstName,
                    lastName,
                    companyName: company
                }
            })
        } catch (contactError) {
            console.warn('Matching contact not found for profile update')
        }

        return NextResponse.json({ user: updatedUser })
    } catch (error: any) {
        console.error('Profile update error detail:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        })
        return NextResponse.json({
            error: 'Database update failed',
            details: error.message
        }, { status: 500 })
    }
}
