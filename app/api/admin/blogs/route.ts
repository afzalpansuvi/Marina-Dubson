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
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const blogs = await prisma.blogPost.findMany({
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(blogs);
    } catch (error: any) {
        console.error('Error fetching blogs:', error);
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
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const authorId = (payload as any).userId || (payload as any).id;
        if (!authorId) {
            return NextResponse.json({ error: 'Auth token is missing user ID.' }, { status: 401 });
        }

        // Verify user actually exists in DB to prevent P2003 Foreign Key Constraint errors
        const authorExists = await prisma.user.findUnique({ where: { id: authorId } });
        if (!authorExists) {
            return NextResponse.json({ error: 'Your user account could not be found in the database. Please sign out and log back in.' }, { status: 401 });
        }

        const body = await req.json();
        const { title, content, excerpt, coverImage, coverVideo, metaTitle, metaDesc, seoScore, published } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        // Simple slug generation
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() + '-' + Math.random().toString(36).substring(2, 7);

        const blog = await prisma.blogPost.create({
            data: {
                title,
                content,
                excerpt,
                coverImage: coverImage || null,
                metaTitle: metaTitle || null,
                metaDesc: metaDesc || null,
                seoScore: seoScore || 0,
                published: published || false,
                slug,
                authorId: authorId,
            }
        });

        return NextResponse.json(blog, { status: 201 });
    } catch (error: any) {
        console.error('Error creating blog:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}
