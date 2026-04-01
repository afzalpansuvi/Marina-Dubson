export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { sendEmail, emailTemplates } from '@/lib/email'

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'REPORTER', 'CLIENT', 'AGENCY']).default('CLIENT'),
    clientType: z.enum(['PRIVATE', 'AGENCY']).optional(),
    company: z.string().optional(),
    certification: z.string().optional()
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const data = registerSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Identity already exists under this email.' }, { status: 409 })
        }

        const hashedPassword = await hashPassword(data.password)

        // Create user first
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                company: data.company,
                certification: data.certification
            }
        })

        // Also create or link a Contact for clients/agencies to enable CRM features
        if (data.role === 'CLIENT' || data.role === 'AGENCY') {
            try {
                const existingContact = await prisma.contact.findUnique({
                    where: { email: data.email }
                })

                const contact = existingContact || await prisma.contact.create({
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        companyName: data.company,
                        clientType: data.clientType || (data.role === 'AGENCY' ? 'AGENCY' : 'PRIVATE'),
                        status: 'Active'
                    }
                })

                // Link user -> contact for clientType filtering
                await prisma.user.update({
                    where: { id: user.id },
                    data: { contactId: contact.id }
                })
            } catch (contactError) {
                console.error('Failed to create contact for new user:', contactError)
                // We don't fail the registration if contact creation fails, just log it
            }
        }

        // Send Welcome Email
        try {
            const loginLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://marina-dubson.vercel.app'}/login`
            const emailTemplate = emailTemplates.welcomeEmail(user.firstName, user.role, loginLink)

            await sendEmail({
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            })
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError)
            // Log but don't fail registration
        }

        // Notify admin of new signup
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@marinadubson.com'
            await sendEmail({
                to: adminEmail,
                subject: `New ${data.role === 'AGENCY' ? 'agency' : (data.clientType || 'PRIVATE')} signup: ${user.firstName} ${user.lastName}`,
                html: `<p>A new ${data.role === 'AGENCY' ? 'agency contact' : 'client'} has registered.</p>
                       <ul>
                         <li>Name: ${user.firstName} ${user.lastName}</li>
                         <li>Email: ${user.email}</li>
                         <li>Client Type: ${data.clientType || (data.role === 'AGENCY' ? 'AGENCY' : 'PRIVATE')}</li>
                         <li>Company: ${data.company || '—'}</li>
                       </ul>`
            })
        } catch (notifyError) {
            console.error('Admin notification failed:', notifyError)
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }, { status: 201 })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Input validation failed.', details: error.errors }, { status: 400 })
        }
        console.error('Registration error details:', error)
        // Return actual error for debugging
        return NextResponse.json({
            error: 'System synchronization error.',
            debug: error?.message || 'Unknown error',
            stack: error?.stack
        }, { status: 500 })
    }
}
