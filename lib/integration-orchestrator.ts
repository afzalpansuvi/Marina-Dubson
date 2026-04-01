/**
 * Integration Orchestrator
 * Manages the complete flow: Client Portal → Zoho CRM → Zoho Books → Stripe/PayPal → Mailchimp
 */

import { zohoCRM } from './zoho-crm'
import { zohoBooks } from './zoho-books'
import { mailchimp } from './mailchimp'
import prisma from './prisma'
import { PricingEngine, BookingRates } from './pricing-engine'
import { sendEmail, emailTemplates } from './email'

interface BookingIntegrationData {
    bookingId: string
    contactEmail: string
    contactFirstName: string
    contactLastName: string
    contactPhone?: string
    companyName?: string
    serviceName: string
    serviceAmount: number
    bookingDate: string
    bookingNumber: string
    proceedingType: string
}

export class IntegrationOrchestrator {
    /**
     * Step 1: Sync booking to Zoho CRM
     */
    async syncToZohoCRM(data: BookingIntegrationData): Promise<{
        contactId: string
        dealId: string
    }> {
        try {
            const contactResult = await zohoCRM.upsertContact({
                First_Name: data.contactFirstName,
                Last_Name: data.contactLastName,
                Email: data.contactEmail,
                Phone: data.contactPhone,
                Account_Name: data.companyName,
                Description: `Client from Marina Dubson Portal - Booking ${data.bookingNumber}`
            })

            const dealResult = await zohoCRM.createDeal({
                Deal_Name: `${data.bookingNumber} - ${data.serviceName}`,
                Stage: 'Qualification',
                Amount: data.serviceAmount,
                Closing_Date: data.bookingDate,
                Contact_Name: { id: contactResult.id },
                Description: `${data.proceedingType} - Created from portal`,
                Type: 'Court Reporting Service'
            })

            await prisma.booking.update({
                where: { id: data.bookingId },
                data: {
                    notes: JSON.stringify({
                        zohoCRMContactId: contactResult.id,
                        zohoCRMDealId: dealResult.id
                    })
                }
            })

            await mailchimp.updateMemberForBookingStage(
                data.contactEmail,
                data.contactFirstName,
                data.contactLastName,
                'submitted'
            )

            return { contactId: contactResult.id, dealId: dealResult.id }
        } catch (error) {
            console.error('Zoho CRM sync failed:', error)
            throw error
        }
    }

    /**
     * Automated Flow: Triggered after Client Confirmation
     */
    async createInvoiceAfterApproval(data: BookingIntegrationData): Promise<void> {
        try {
            const existingInvoice = await prisma.invoice.findUnique({
                where: { bookingId: data.bookingId }
            })

            if (!existingInvoice) {
                const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`
                await prisma.invoice.create({
                    data: {
                        invoiceNumber,
                        jobNumber: data.bookingNumber,
                        contactId: (await prisma.booking.findUnique({ where: { id: data.bookingId } }))?.contactId || '',
                        bookingId: data.bookingId,
                        invoiceDate: new Date(),
                        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                        status: 'DRAFT',
                        pageRate: 0,
                        appearanceFee: data.serviceAmount,
                        subtotal: data.serviceAmount,
                        total: data.serviceAmount,
                        notes: `Automated invoice generated for ${data.serviceName} - ${data.proceedingType}`
                    }
                })
            }

            try {
                const customerResult = await zohoBooks.upsertCustomer({
                    contact_name: `${data.contactFirstName} ${data.contactLastName}`,
                    company_name: data.companyName,
                    email: data.contactEmail,
                    phone: data.contactPhone
                })

                await zohoBooks.createInvoice({
                    customer_id: customerResult.id,
                    date: new Date().toISOString().split('T')[0],
                    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    line_items: [{
                        name: data.serviceName,
                        description: `Initial booking for ${data.proceedingType}`,
                        rate: data.serviceAmount,
                        quantity: 1
                    }],
                    notes: `Booking confirmation for ${data.bookingNumber}`
                })
            } catch (zohoError) {
                console.error('Initial Zoho Books sync failed:', zohoError)
            }

            await mailchimp.updateMemberForBookingStage(
                data.contactEmail,
                data.contactFirstName,
                data.contactLastName,
                'approved'
            )
        } catch (error) {
            console.error('createInvoiceAfterApproval failed:', error)
            throw error
        }
    }

    /**
     * Step 2: Create final invoice
     */
    async generateFinalInvoice(bookingId: string, billingData: {
        pages: number,
        originalCopies: number,
        additionalCopies: number,
        turnaroundDays?: number,
        realtimeDevices?: number,
        hasRough?: boolean,
        hasVideographer?: boolean,
        hasInterpreter?: boolean,
        hasExpert?: boolean,
        hasReadAndSign?: boolean,
        hasMini?: boolean,
        hasIndex?: boolean,
        hasCart?: boolean,
        hasPaperDelivery?: boolean,
        isOnRecordBust?: boolean,
        hasPreBilledReview?: boolean,
        afterHoursCount?: number,
        waitTimeCount?: number,
        extraCertOriginals?: number,
        locationBaseFee?: number,
        notes?: string,
        rateTier?: string,
        overrides?: Partial<Record<keyof BookingRates, number>>
    }, options: { sendNow?: boolean } = {}): Promise<any> {
        try {
            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: { contact: true, service: true }
            })

            if (!booking) throw new Error('Booking not found')

            const baseRates = await PricingEngine.getApplicableRates(booking.contactId, booking.serviceId, billingData.rateTier || 'STANDARD')

            const rates = {
                ...baseRates,
                pageRate: (billingData as any).overrides?.pageRate ?? (booking as any).lockedPageRate ?? baseRates.pageRate,
                appearanceFeeRemote: (billingData as any).overrides?.appearanceFeeRemote ?? (booking as any).lockedAppearanceFee ?? baseRates.appearanceFeeRemote,
                appearanceFeeInPerson: (billingData as any).overrides?.appearanceFeeInPerson ?? (booking as any).lockedAppearanceFee ?? baseRates.appearanceFeeInPerson,
                minimumFee: (billingData as any).overrides?.minimumFee ?? (booking as any).lockedMinimumFee ?? baseRates.minimumFee,
                copyRate: (billingData as any).overrides?.copyRate ?? baseRates.copyRate,
                roughRate: (billingData as any).overrides?.roughRate ?? baseRates.roughRate,
                videographerRate: (billingData as any).overrides?.videographerRate ?? baseRates.videographerRate,
                interpreterRate: (billingData as any).overrides?.interpreterRate ?? baseRates.interpreterRate,
                expertRate: (billingData as any).overrides?.expertRate ?? baseRates.expertRate,
                readAndSignRate: (billingData as any).overrides?.readAndSignRate ?? baseRates.readAndSignRate,
                miniRate: (billingData as any).overrides?.miniRate ?? baseRates.miniRate,
                indexRate: (billingData as any).overrides?.indexRate ?? baseRates.indexRate,
                afterHoursRate: (billingData as any).overrides?.afterHoursRate ?? baseRates.afterHoursRate,
                waitTimeRate: (billingData as any).overrides?.waitTimeRate ?? baseRates.waitTimeRate,
                congestionFee: (billingData as any).overrides?.congestionFee ?? baseRates.congestionFee,
                cartRate: (billingData as any).overrides?.cartRate ?? baseRates.cartRate,
            } as any;

            const { subtotal, total } = PricingEngine.calculateTotal(rates, {
                ...billingData,
                isRemote: booking.appearanceType === 'REMOTE'
            })

            const invoiceData: any = {
                jobNumber: booking.bookingNumber,
                contactId: booking.contactId,
                bookingId: booking.id,
                invoiceDate: new Date(),
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: options.sendNow ? 'SENT' : 'DRAFT',
                pages: billingData.pages,
                originalCopies: billingData.originalCopies,
                additionalCopies: billingData.additionalCopies,
                pageRate: rates.pageRate,
                copyRate: rates.copyRate,
                appearanceFee: booking.location?.toLowerCase().includes('remote') ? rates.appearanceFeeRemote : rates.appearanceFeeInPerson,
                congestionFee: rates.rateTier === 'PRIVATE' ? 0 : rates.congestionFee,
                realtimeFee: billingData.realtimeDevices ? (billingData.pages * rates.privateRealtimeFee * billingData.realtimeDevices) : 0,
                realtimeDevices: billingData.realtimeDevices,
                roughFee: billingData.hasRough ? (billingData.pages * rates.roughRate) : 0,
                videographerFee: billingData.hasVideographer ? (billingData.pages * rates.videographerRate) : 0,
                interpreterFee: billingData.hasInterpreter ? (billingData.pages * rates.interpreterRate) : 0,
                expertFee: billingData.hasExpert ? (billingData.pages * rates.expertRate) : 0,
                readAndSignFee: billingData.hasReadAndSign ? (billingData.pages * rates.readAndSignRate) : 0,
                miniFee: billingData.hasMini ? (billingData.pages * rates.miniRate) : 0,
                indexFee: billingData.hasIndex ? (billingData.pages * rates.indexRate) : 0,
                extraCertOriginalFee: billingData.extraCertOriginals ? (billingData.pages * (rates.pageRate * 0.75) * billingData.extraCertOriginals) : 0,
                afterHoursFee: billingData.afterHoursCount ? (billingData.afterHoursCount * rates.afterHoursRate) : 0,
                afterHoursCount: billingData.afterHoursCount,
                waitTimeFee: billingData.waitTimeCount ? (billingData.waitTimeCount * rates.waitTimeRate) : 0,
                waitTimeCount: billingData.waitTimeCount ?? null,
                locationBaseFee: billingData.locationBaseFee ?? null,
                paperDeliveryFee: billingData.hasPaperDelivery ? 150 : 0,
                preBilledReviewFee: billingData.hasPreBilledReview ? (billingData.pages * 1.00) : 0,
                cartFee: billingData.hasCart ? (billingData.pages * rates.cartRate) : 0,
                subtotal,
                minimumFee: rates.minimumFee,
                total,
                rateTier: billingData.rateTier || 'STANDARD',
                notes: billingData.notes || `Job: ${booking.proceedingType}`
            }

            const existingInvoice = await prisma.invoice.findUnique({ where: { bookingId: booking.id } })
            const localInvoice = existingInvoice
                ? await prisma.invoice.update({ where: { id: existingInvoice.id }, data: invoiceData })
                : await prisma.invoice.create({ data: { invoiceNumber: `INV-${Date.now().toString().slice(-6)}`, ...invoiceData } })

            let zohoInvoiceId = null
            if (options.sendNow) {
                try {
                    const customerResult = await zohoBooks.upsertCustomer({
                        contact_name: `${booking.contact.firstName} ${booking.contact.lastName}`,
                        company_name: booking.contact.companyName ?? undefined,
                        email: booking.contact.email
                    })

                    const lineItems: any[] = [
                        {
                            name: 'Original Transcript',
                            description: `(${billingData.pages} pgs x $${rates.pageRate})`,
                            rate: rates.pageRate,
                            quantity: billingData.pages * billingData.originalCopies
                        }
                    ]

                    if (billingData.additionalCopies > 0) {
                        lineItems.push({
                            name: 'Transcript Copies',
                            description: `(${billingData.pages} pgs x $${rates.copyRate})`,
                            rate: rates.copyRate,
                            quantity: billingData.pages * billingData.additionalCopies
                        })
                    }

                    lineItems.push({
                        name: 'Appearance & Logistics',
                        description: 'Flat Fee coverage',
                        rate: (booking.location?.toLowerCase().includes('remote') ? rates.appearanceFeeRemote : rates.appearanceFeeInPerson) + (rates.rateTier === 'PRIVATE' ? 0 : rates.congestionFee),
                        quantity: 1
                    })

                    if (billingData.hasRough) {
                        lineItems.push({ name: 'Rough Draft Access', description: `(+$${rates.roughRate} per page)`, rate: rates.roughRate, quantity: billingData.pages })
                    }
                    if (billingData.realtimeDevices && billingData.realtimeDevices > 0) {
                        lineItems.push({ name: 'Realtime Feed', description: `(+$${rates.realtimeFee} per page per device)`, rate: rates.realtimeFee, quantity: billingData.pages * billingData.realtimeDevices })
                    }
                    if (billingData.hasPaperDelivery) {
                        lineItems.push({ name: 'Paper Delivery / Production', description: 'Hard copy production and shipping costs', rate: 150, quantity: 1 })
                    }
                    if (billingData.hasVideographer) {
                        lineItems.push({ name: 'Videography Services', description: `(+$${rates.videographerRate} per page)`, rate: rates.videographerRate, quantity: billingData.pages })
                    }
                    if (billingData.hasInterpreter) {
                        lineItems.push({ name: 'Interpreter Services', description: `(+$${rates.interpreterRate} per page)`, rate: rates.interpreterRate, quantity: billingData.pages })
                    }
                    if (billingData.hasExpert) {
                        lineItems.push({ name: 'Expert Witness Services', description: `(+$${rates.expertRate} per page)`, rate: rates.expertRate, quantity: billingData.pages })
                    }
                    if (billingData.hasCart) {
                        lineItems.push({ name: 'CART Services (Accessibility)', description: `(+$${rates.cartRate} per page)`, rate: rates.cartRate, quantity: billingData.pages })
                    }
                    if (billingData.afterHoursCount && billingData.afterHoursCount > 0) {
                        const ahRate = rates.rateTier === 'PRIVATE' ? rates.afterHoursRate : rates.afterHoursRate
                        lineItems.push({ 
                            name: 'After-hours Surcharge', 
                            description: rates.rateTier === 'PRIVATE' ? `($${rates.afterHoursRate}/hr + 50% transcript surcharge)` : `(${billingData.afterHoursCount} hours)`, 
                            rate: ahRate + (rates.rateTier === 'PRIVATE' ? ((rates.pageRate * 0.5 * billingData.pages) / billingData.afterHoursCount) : 0), 
                            quantity: billingData.afterHoursCount 
                        })
                    }
                    if (billingData.waitTimeCount && billingData.waitTimeCount > 0) {
                        lineItems.push({ name: 'Wait Time Surcharge', description: `(${billingData.waitTimeCount} hours wait time)`, rate: rates.waitTimeRate, quantity: billingData.waitTimeCount })
                    }

                    const zohoInvoice = await zohoBooks.createInvoice({
                        customer_id: customerResult.id,
                        date: new Date().toISOString().split('T')[0],
                        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        line_items: lineItems,
                        notes: `Invoice for ${booking.proceedingType}. JOB: ${booking.bookingNumber}`
                    })
                    zohoInvoiceId = zohoInvoice.id
                } catch (zohoError) {
                    console.error('Zoho Books sync failed:', zohoError)
                }
            }

            const currentMetadata = JSON.parse(booking.notes || '{}')
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    bookingStatus: options.sendNow ? 'COMPLETED' : booking.bookingStatus,
                    invoiceStatus: options.sendNow ? 'SENT' : 'DRAFT',
                    notes: JSON.stringify({ ...currentMetadata, zohoBooksInvoiceId: zohoInvoiceId })
                }
            })

            if (options.sendNow) {
                try {
                    const clientEmailData = emailTemplates.invoiceGenerated(
                        booking.contact.firstName,
                        localInvoice.invoiceNumber,
                        localInvoice.total,
                        `${process.env.NEXT_PUBLIC_APP_URL}/client/invoices/${localInvoice.id}`,
                        `${process.env.NEXT_PUBLIC_APP_URL}/client/invoices/${localInvoice.id}`
                    )
                    await sendEmail({ to: booking.contact.email, ...clientEmailData })
                } catch (emailError) {
                    console.error('Notification dispatch failed:', emailError)
                }
            }

            return { localInvoice, zohoInvoiceId }
        } catch (error) {
            console.error('Final invoice generation failed:', error)
            throw error
        }
    }

    /**
     * Step 3: Record payment
     */
    async recordPayment(bookingId: string, paymentData: {
        amount: number
        paymentMethod: 'stripe' | 'paypal'
        transactionId: string
        paidAt: string
    }): Promise<void> {
        try {
            const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
            if (!booking) throw new Error('Booking not found')

            const metadata = JSON.parse(booking.notes || '{}')
            const invoiceId = metadata.zohoBooksInvoiceId

            if (!invoiceId) throw new Error('No Zoho Books invoice found')

            await zohoBooks.recordPayment(invoiceId, {
                amount: paymentData.amount,
                payment_mode: paymentData.paymentMethod === 'stripe' ? 'Credit Card' : 'PayPal',
                date: paymentData.paidAt.split('T')[0],
                reference_number: paymentData.transactionId,
                notes: `Payment via ${paymentData.paymentMethod}`
            })

            await prisma.booking.update({
                where: { id: bookingId },
                data: { invoiceStatus: 'PAID' }
            })

            if (metadata.zohoCRMDealId) {
                await zohoCRM.updateDealStage(metadata.zohoCRMDealId, 'Closed Won')
            }
        } catch (error) {
            console.error('Payment recording failed:', error)
            throw error
        }
    }

    /**
     * Complete the booking
     */
    async completeBooking(bookingId: string): Promise<void> {
        try {
            await prisma.booking.update({
                where: { id: bookingId },
                data: { bookingStatus: 'COMPLETED' }
            })
        } catch (error) {
            console.error('Booking completion failed:', error)
            throw error
        }
    }
}

export const integrationOrchestrator = new IntegrationOrchestrator()
