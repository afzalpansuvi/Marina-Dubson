export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const documentSchema = z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    category: z.enum(['RATE_SHEET', 'CONTRACT', 'INVOICE', 'CLIENT_UPLOAD', 'TRANSCRIPT', 'DOCUMENT']),
    contactId: z.string().optional(),
    bookingId: z.string().optional(),
})

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const bookingId = searchParams.get('bookingId')

        const where: any = {}

        // Clients only see their own docs or general ones like rate sheets
        if (payload.role === 'CLIENT') {
            // Find contact associated with client
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
                include: { contact: true }
            })

            if (user?.contact) {
                where.OR = [
                    { contactId: user.contact.id },
                    { category: 'RATE_SHEET' } // General rate sheets
                ]
            } else {
                where.category = 'RATE_SHEET'
            }
        }

        if (category) where.category = category
        if (bookingId) where.bookingId = bookingId

        const documents = await prisma.document.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                booking: {
                    select: {
                        id: true,
                        bookingNumber: true,
                        proceedingType: true,
                    }
                }
            }
        })

        return NextResponse.json({ documents })
    } catch (error) {
        console.error('Fetch documents error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const category = formData.get('category') as string
        const bookingId = formData.get('bookingId') as string
        const contactId = formData.get('contactId') as string

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) { }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const fileName = `${Date.now()}-${file.name}`
        const path = join(uploadDir, fileName)
        await writeFile(path, buffer)

        const fileUrl = `/uploads/${fileName}`

        const document = await prisma.document.create({
            data: {
                fileName: file.name,
                fileType: file.type,
                fileUrl,
                category: category as any,
                bookingId: bookingId || null,
                contactId: contactId || null,
                uploadedBy: payload.id
            }
        })

        return NextResponse.json(document, { status: 201 })
    } catch (error) {
        console.error('Upload document error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
