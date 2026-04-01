export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const segment = searchParams.get('segment') // 'CLIENT', 'REPORTER', 'TEAM', 'ALL'

        let recipients: { email: string; name: string; type: string }[] = []

        if (segment === 'CLIENT' || segment === 'ALL') {
            const clients = await prisma.contact.findMany({
                where: { status: 'Active' },
                select: { email: true, firstName: true, lastName: true }
            })
            recipients = [...recipients, ...clients.map(c => ({
                email: c.email,
                name: `${c.firstName} ${c.lastName}`,
                type: 'CLIENT'
            }))]
        }

        if (segment === 'REPORTER' || segment === 'ALL') {
            const reporters = await prisma.user.findMany({
                where: { role: 'REPORTER' },
                select: { email: true, firstName: true, lastName: true }
            })
            recipients = [...recipients, ...reporters.map(r => ({
                email: r.email,
                name: `${r.firstName} ${r.lastName}`,
                type: 'REPORTER'
            }))]
        }

        if (segment === 'TEAM' || segment === 'ALL') {
            const team = await prisma.teamMember.findMany({
                where: { status: 'ACTIVE' },
                select: { email: true, firstName: true, lastName: true }
            })
            recipients = [...recipients, ...team.map(t => ({
                email: t.email,
                name: `${t.firstName} ${t.lastName}`,
                type: 'TEAM_MEMBER'
            }))]
        }

        return NextResponse.json({ recipients })
    } catch (error) {
        console.error('Fetch recipients error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
