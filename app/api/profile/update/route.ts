export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { avatar, firstName, lastName } = body;

        // Update User model
        const updatedUser = await prisma.user.update({
            where: { id: payload.userId },
            data: {
                ...(avatar !== undefined && { avatar }),
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
            }
        });

        // Also update TeamMember if it exists with this email
        try {
            await prisma.teamMember.updateMany({
                where: { email: updatedUser.email },
                data: {
                    ...(avatar !== undefined && { avatar }),
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                }
            });
        } catch (tmError) {
            console.error('Failed to sync TeamMember profile:', tmError);
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
