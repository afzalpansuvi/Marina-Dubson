export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const defaultPassword = process.env.DEFAULT_PASSWORD || 'MarinaAdmin@123##!'
        const hashedPassword = await hashPassword(defaultPassword)

        const usersToCreate = [
            {
                email: 'admin@marinadubson.com',
                firstName: 'Marina',
                lastName: 'Dubson',
                role: 'ADMIN'
            },
            {
                email: 'agency@marinadubson.com',
                firstName: 'Agency',
                lastName: 'User',
                role: 'CLIENT',
                clientType: 'AGENCY'
            },
            {
                email: 'privateclient@marinadubson.com',
                firstName: 'Private',
                lastName: 'Client',
                role: 'CLIENT',
                clientType: 'PRIVATE'
            },
            {
                email: 'reporter@marinadubson.com',
                firstName: 'Certified',
                lastName: 'Reporter',
                role: 'REPORTER'
            },
            {
                email: 'team@marinadubson.com',
                firstName: 'Team',
                lastName: 'Member',
                role: 'STAFF'
            }
        ]

        const results = []

        for (const userData of usersToCreate) {
            const { clientType, ...userFields } = userData
            
            let existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            })

            if (!existingUser) {
                const data: any = {
                    ...userFields,
                    password: hashedPassword,
                }

                // If it's a client, we need to create a Contact as well
                if (userData.role === 'CLIENT') {
                    const contact = await prisma.contact.create({
                        data: {
                            email: userData.email,
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            clientType: clientType || 'PRIVATE'
                        }
                    })
                    data.contactId = contact.id
                }

                existingUser = await prisma.user.create({ data })
                results.push({ email: userData.email, status: 'created' })
            } else {
                // Update password for existing default users if needed, or just skip
                results.push({ email: userData.email, status: 'exists' })
            }
        }

        return NextResponse.json({ 
            message: 'Bootstrap process completed.', 
            results 
        })
    } catch (error) {
        console.error('Setup error:', error)
        return NextResponse.json({ error: 'System busy.', details: String(error) }, { status: 500 })
    }
}
