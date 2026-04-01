export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const userCount = await prisma.user.count()
        const bookingCount = await prisma.booking.count()
        const contactCount = await prisma.contact.count()
        const firstUser = await prisma.user.findFirst()

        return NextResponse.json({
            message: "Database Debug Info",
            counts: {
                users: userCount,
                bookings: bookingCount,
                contacts: contactCount
            },
            firstUserEmail: firstUser?.email || "NONE",
            dbUrl: process.env.DATABASE_URL
        })
    } catch (error: any) {
        return NextResponse.json({
            error: error.message || "Unknown error",
            stack: error.stack
        }, { status: 500 })
    }
}
