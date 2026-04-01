import prisma from './prisma'
import { sendEmail, emailTemplates } from './email'
import { PricingEngine } from './pricing-engine'

export async function generateInvoiceForBooking(bookingId: string) {
    // 1. Get Booking details
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            contact: {
                include: {
                    customPricing: true,
                },
            },
            service: true,
        },
    })

    if (!booking) throw new Error('Booking not found')

    // 2. Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
        where: { bookingId },
    })
    if (existingInvoice) return existingInvoice

    // 3. Determine Pricing using Pricing Engine (MD Global Standards)
    const rates = await PricingEngine.getApplicableRates(
        booking.contactId, 
        booking.serviceId, 
        (booking.contact as any).rateTier || 'STANDARD'
    )

    // 4. Calculate Amounts using Pricing Engine
    const { subtotal, total } = PricingEngine.calculateTotal(rates, {
        pages: 0, // DRAFT status usually means pages are unknown yet
        originalCopies: 1,
        additionalCopies: 0,
        isRemote: (booking as any).lockedAppearanceFee ? ((booking as any).lockedAppearanceFee < 150) : (booking.appearanceType === 'REMOTE'),
    })

    const pages = 0
    const originalCopies = 1
    const additionalCopies = 0

    // 5. Generate Invoice Number
    const count = await prisma.invoice.count()
    const invoiceNumber = `INV${String(count + 1).padStart(6, '0')}`

    // 6. Create Invoice
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            bookingId: booking.id,
            contactId: booking.contactId,
            jobNumber: booking.bookingNumber,
            pages,
            originalCopies,
            additionalCopies,
            pageRate: rates.pageRate,
            copyRate: rates.copyRate,
            appearanceFee: (booking as any).lockedAppearanceFee ?? (booking.appearanceType === 'REMOTE' ? rates.appearanceFeeRemote : rates.appearanceFeeInPerson),
            congestionFee: (booking.contact as any).rateTier === 'PRIVATE' ? 0 : rates.congestionFee,
            minimumFee: rates.minimumFee,
            subtotal,
            total,
            status: 'DRAFT',
            rateTier: (booking.contact as any).rateTier || 'STANDARD',
        },
        include: {
            contact: true,
            booking: true,
        },
    })

    // 7. Update booking invoice status
    await prisma.booking.update({
        where: { id: bookingId },
        data: { invoiceStatus: 'DRAFT' },
    })

    // 8. Send Automation Triggered Email (to Admin or Client)
    const clientName = `${invoice.contact.firstName} ${invoice.contact.lastName}`
    const invoiceLink = `${process.env.NEXT_PUBLIC_APP_URL}/client/invoices/${invoice.id}`
    const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/client/invoices/${invoice.id}/pay`

    const template = emailTemplates.invoiceGenerated(
        clientName,
        invoiceNumber,
        total,
        invoiceLink,
        paymentLink
    )

    await sendEmail({
        to: invoice.contact.email,
        subject: template.subject,
        html: template.html,
    })

    return invoice
}
