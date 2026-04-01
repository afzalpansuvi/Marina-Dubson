export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const blogs = await prisma.blogPost.findMany({
            where: { published: true },
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(blogs);
    } catch (error: any) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
