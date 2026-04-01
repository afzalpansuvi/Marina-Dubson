export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'MANAGER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const teamMembers = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'MANAGER', 'STAFF']
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
                assignedTasks: {
                    where: {
                        status: {
                            not: 'COMPLETED'
                        }
                    },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                }
            }
        })

        return NextResponse.json(teamMembers)
    } catch (error) {
        console.error('Fetch team members error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
