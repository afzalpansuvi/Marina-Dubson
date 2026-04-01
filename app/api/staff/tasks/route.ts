export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyToken(token);

        if (!payload || (payload.role !== 'STAFF' && payload.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch tasks assigned directly to the User OR assigned to the TeamMember linked to this User email
        const tasks = await prisma.task.findMany({
            where: {
                OR: [
                    { assignedToUserId: payload.userId },
                    {
                        assignedToTeam: {
                            email: payload.email
                        }
                    }
                ]
            },
            include: {
                createdBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true
                    }
                },
                booking: {
                    select: {
                        bookingNumber: true,
                        appearanceType: true,
                        bookingDate: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching staff tasks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyToken(token);

        if (!payload || payload.role !== 'STAFF') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { taskId, status } = body;

        if (!taskId || !status) {
            return NextResponse.json({ error: 'Missing taskId or status' }, { status: 400 });
        }

        // Update task status
        const updatedTask = await prisma.task.update({
            where: {
                id: taskId,
                OR: [
                    { assignedToUserId: payload.userId },
                    {
                        assignedToTeam: {
                            email: payload.email
                        }
                    }
                ]
            },
            data: {
                status,
                completedAt: status === 'COMPLETED' ? new Date() : null
            }
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
