export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = extractTokenFromHeader(req.headers.get('Authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const tasks = await prisma.task.findMany({
            include: {
                assignedToUser: true,
                assignedToTeam: true,
                createdBy: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = extractTokenFromHeader(req.headers.get('Authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        const userRole = (payload?.role || '').toUpperCase();

        // Broaden permissions: Allow ADMIN, SUPER_ADMIN, and potentially STAFF/MANAGER if they have portal access
        if (!payload || !['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'].includes(userRole)) {
            console.error('[TASK_API] Forbidden access attempt:', { userId: payload?.userId, role: userRole });
            return NextResponse.json({ error: 'Forbidden: Insufficient Clearance' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, priority, dueDate, assignedToId } = body;

        if (!title || !assignedToId) {
            return NextResponse.json({ error: 'Missing required fields (title, assignee)' }, { status: 400 });
        }

        // Determine if assignedToId is a TeamMember or User
        const [teamMember, user] = await Promise.all([
            prisma.teamMember.findUnique({ where: { id: assignedToId } }),
            prisma.user.findUnique({ where: { id: assignedToId } })
        ]);

        let assignedToType = user ? 'USER' : teamMember ? 'TEAM_MEMBER' : null;

        if (!assignedToType) {
            console.error(`[TASK_API] Assignee ${assignedToId} not found in User or TeamMember tables`);
            return NextResponse.json({ error: 'Assignee not found in protocol database' }, { status: 404 });
        }

        const createByUserId = payload.userId || payload.id;

        const task = await prisma.task.create({
            data: {
                title,
                description: description || null,
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
                assignedToUserId: user ? assignedToId : null,
                assignedToTeamId: teamMember ? assignedToId : null,
                assignedToType,
                createdById: createByUserId,
                status: 'PENDING'
            },
            include: {
                assignedToUser: true,
                assignedToTeam: true
            }
        });

        // 📧 NOTIFICATION LOGIC
        try {
            const recipientEmail = user?.email || teamMember?.email;
            const recipientName = user ? `${user.firstName} ${user.lastName}` : `${teamMember?.firstName} ${teamMember?.lastName}`;

            if (recipientEmail) {
                const { sendEmail, emailTemplates } = await import('@/lib/email');
                const template = emailTemplates.taskAssigned(
                    recipientName,
                    title,
                    priority || 'MEDIUM',
                    dueDate ? new Date(dueDate).toLocaleDateString() : 'TBD'
                );
                await sendEmail({
                    to: recipientEmail,
                    subject: template.subject,
                    html: template.html
                });
            }
        } catch (emailErr) {
            console.error('[TASK_API] Notification failed (non-fatal):', emailErr);
        }

        return NextResponse.json(task, { status: 201 });
    } catch (error: any) {
        console.error('Error creating task:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
