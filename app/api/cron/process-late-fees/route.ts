export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { differenceInMonths } from 'date-fns'

export async function GET(request: Request) {
    // Only allow cron requests or manual admin runs (in real app add proper IP/token protection)
    try {
        const policy = await prisma.systemPolicy.findUnique({ where: { key: 'late_fee_percent' } })
        const lateFeePercent = parseFloat(policy?.value || '1.5') / 100

        // Find unpaid invoices that are past their due date
        const overdueInvoices = await prisma.invoice.findMany({
            where: {
                status: { in: ['SENT', 'OVERDUE'] },
                dueDate: { lt: new Date() }
            }
        })

        let updatedCount = 0

        for (const invoice of overdueInvoices) {
            if (!invoice.dueDate) continue
            const monthsOverdue = differenceInMonths(new Date(), new Date(invoice.dueDate))
            
            if (monthsOverdue > 0) {
                // Compound the 1.5% late fee per month based on subtotal.
                const originalPrincipal = invoice.subtotal + invoice.tax
                const calculatedLateFee = originalPrincipal * Math.pow(1 + lateFeePercent, monthsOverdue) - originalPrincipal

                // Only update if it grew
                // @ts-ignore
                if (calculatedLateFee > (invoice.lateFee || 0)) {
                    await prisma.invoice.update({
                        where: { id: invoice.id },
                        data: {
                            status: 'OVERDUE',
                            // @ts-ignore
                            lateFee: calculatedLateFee,
                            total: invoice.subtotal + invoice.tax + calculatedLateFee
                        }
                    })
                    updatedCount++
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Processed late fees. Updated ${updatedCount} overdue invoices.` 
        })
    } catch (error: any) {
        console.error('Failed to process late fees:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
