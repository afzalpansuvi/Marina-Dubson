export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const taskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('TODO'),
    assignedToId: z.string().optional(),
    bookingId: z.string().optional(),
    dueDate: z.string().optional(),
})

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const assigneeId = searchParams.get('assignedToId') // Keep param name for compat
        const status = searchParams.get('status')

        const where: any = {}
        if (status) where.status = status

        // Role-based filtering
        if (payload.role !== 'ADMIN' && payload.role !== 'MANAGER' && payload.role !== 'SUPER_ADMIN') {
            // Non-admins only see tasks assigned to them (User assignment)
            where.assignedToUserId = payload.userId
        } else if (assigneeId) {
            // Admins can filter by assignee
            where.OR = [
                { assignedToUserId: assigneeId },
                { assignedToTeamId: assigneeId }
            ]
        }

        const tasks = await prisma.task.findMany({
            where,
            include: {
                assignedToUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                assignedToTeam: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        position: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                booking: {
                    include: {
                        contact: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(tasks)
    } catch (error) {
        console.error('Fetch tasks error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'MANAGER' && payload.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const data = taskSchema.parse(body)

        // Determine if assignedToId is a TeamMember or User
        let assignedToUserId = null
        let assignedToTeamId = null
        let assignedToType = null

        if (data.assignedToId) {
            const [teamMember, user] = await Promise.all([
                prisma.teamMember.findUnique({ where: { id: data.assignedToId } }),
                prisma.user.findUnique({ where: { id: data.assignedToId } })
            ]);

            if (user) {
                assignedToUserId = data.assignedToId
                assignedToType = 'USER'
            } else if (teamMember) {
                assignedToTeamId = data.assignedToId
                assignedToType = 'TEAM_MEMBER'
            } else {
                return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
            }
        }

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: data.status,
                assignedToUserId,
                assignedToTeamId,
                assignedToType,
                bookingId: data.bookingId,
                createdById: payload.userId,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
            },
            include: {
                assignedToUser: true,
                assignedToTeam: true,
                booking: true
            }
        })

        return NextResponse.json(task, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Create task error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, ...updateData } = body

        if (!id) {
            return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
        }

        const existingTask = await prisma.task.findUnique({
            where: { id }
        })

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // Only allow assigned user or admin/manager to update status
        const isAdmin = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(payload.role)
        const isAssignedUser = existingTask.assignedToUserId === payload.userId

        if (!isAdmin && !isAssignedUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Handle dueDate conversion if present
        const data: any = { ...updateData }
        if (data.dueDate) data.dueDate = new Date(data.dueDate)
        if (data.completedAt) data.completedAt = new Date(data.completedAt)

        // Handle assignedToId update if present (Admins only)
        if (data.assignedToId && isAdmin) {
            const [teamMember, user] = await Promise.all([
                prisma.teamMember.findUnique({ where: { id: data.assignedToId } }),
                prisma.user.findUnique({ where: { id: data.assignedToId } })
            ]);

            if (user) {
                data.assignedToUserId = data.assignedToId
                data.assignedToTeamId = null
                data.assignedToType = 'USER'
            } else if (teamMember) {
                data.assignedToTeamId = data.assignedToId
                data.assignedToUserId = null
                data.assignedToType = 'TEAM_MEMBER'
            } else {
                return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
            }
            delete data.assignedToId
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data
        })

        return NextResponse.json(updatedTask)
    } catch (error) {
        console.error('Update task error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
