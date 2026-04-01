export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, hashPassword, extractTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = extractTokenFromHeader(req.headers.get('Authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const teamMembers = await prisma.teamMember.findMany({
            include: {
                assignedTasks: {
                    where: { status: { not: 'COMPLETED' } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(teamMembers);
    } catch (error: any) {
        console.error('Error fetching team members:', error);
        // Emergency logging to file
        try {
            const fs = require('fs');
            fs.appendFileSync('server_errors.log', `[${new Date().toISOString()}] GET /api/admin/team: ${error.message}\n${error.stack}\n\n`);
        } catch (e) { }

        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = extractTokenFromHeader(req.headers.get('Authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { firstName, lastName, email, phone, position, department, avatar, password } = body;

        console.log('[TEAM_API] Attempting to create team member:', email);

        if (!firstName || !lastName || !email || !position) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Check if email already exists in User table
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use by another account' }, { status: 400 });
        }

        // 2. Check if email already exists in TeamMember table
        const existingTeamMember = await prisma.teamMember.findUnique({ where: { email } });
        if (existingTeamMember) {
            return NextResponse.json({ error: 'Staff record already exists for this email' }, { status: 400 });
        }

        // 3. Create Login account if password provided
        let linkedUserId: string | null = null;
        if (password && password.length >= 6) {
            try {
                const hashed = await hashPassword(password);
                const newUser = await prisma.user.create({
                    data: {
                        email,
                        password: hashed,
                        firstName,
                        lastName,
                        role: 'STAFF',
                        avatar: avatar || null,
                    }
                });
                linkedUserId = newUser.id;
                console.log('[TEAM_API] User login account created:', linkedUserId);
            } catch (userErr) {
                console.error('[TEAM_API] Failed to create user account:', userErr);
                throw userErr; // Bubble up to 500 handler
            }
        }

        // 4. Create the main Staff (TeamMember) record
        try {
            const teamMember = await prisma.teamMember.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    phone: phone || null,
                    position,
                    department: department || 'Operations',
                    status: 'ACTIVE',
                    avatar: avatar || null,
                    bio: linkedUserId ? `userId:${linkedUserId}` : null,
                }
            });

            console.log('[TEAM_API] TeamMember record created successfully:', teamMember.id);

            return NextResponse.json({
                ...teamMember,
                hasLogin: !!linkedUserId,
            }, { status: 201 });
        } catch (tmErr) {
            console.error('[TEAM_API] Failed to create TeamMember record:', tmErr);
            // If we created a user but the team member failed, we have an inconsistency
            // but we'll let the 500 handler deal with it for now.
            throw tmErr;
        }

    } catch (error: any) {
        console.error('[TEAM_API] Major Error creating team member:', error);

        // Detailed error reporting
        if (error.code === 'P2002') {
            const target = error.meta?.target || 'unknown';
            return NextResponse.json({
                error: `Unique constraint failed on ${target}`,
                details: 'This email or identifier is already in use.'
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
            code: error.code,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

