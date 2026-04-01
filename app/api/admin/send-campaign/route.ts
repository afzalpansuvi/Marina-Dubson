export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { subject, body, recipients, campaignName, segment = 'ALL' } = await request.json()

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients selected' }, { status: 400 })
        }

        // Create the Campaign record first
        const campaign = await prisma.campaign.create({
            data: {
                name: campaignName,
                subject: subject,
                body: body,
                segment: segment,
                reach: recipients.length,
                status: 'SENT'
            }
        })

        // Send emails
        // For now, we'll iterate and log
        const results = await Promise.allSettled(
            recipients.map(async (r: { email: string; name: string }) => {
                await sendEmail({
                    to: r.email,
                    subject: subject,
                    text: body,
                    html: `<div style="font-family: sans-serif; padding: 20px;">
                            <h2>Hello ${r.name},</h2>
                            <div style="line-height: 1.6; color: #333;">
                                ${body.replace(/\n/g, '<br/>')}
                            </div>
                            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888;">
                                You are receiving this email as part of the Marina Dubson Stenographic Services outreach.
                            </div>
                           </div>`
                })

                // Log the email
                await prisma.emailLog.create({
                    data: {
                        recipient: r.email,
                        subject: subject,
                        body: body,
                        emailType: 'CAMPAIGN',
                        status: 'SENT'
                    }
                })
            })
        )

        return NextResponse.json({
            success: true,
            sentCount: results.filter(r => r.status === 'fulfilled').length,
            failedCount: results.filter(r => r.status === 'rejected').length
        })
    } catch (error) {
        console.error('Send campaign error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
