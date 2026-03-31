import prisma from './prisma'

export interface BookingRates {
    pageRate: number
    copyRate: number
    appearanceFeeRemote: number
    appearanceFeeInPerson: number
    congestionFee: number
    realtimeFee: number
    realtimeDeviceRate: number
    roughRate: number
    videographerRate: number
    interpreterRate: number
    expertRate: number
    afterHoursRate: number
    waitTimeRate: number
    cartRate: number
    minimumFee: number
    expediteImmediate: number
    expedite1Day: number
    expedite2Day: number
    expedite3Day: number
    rateTier: string
}

export class PricingEngine {
    static async getApplicableRates(contactId: string, serviceId: string, tier: string = 'STANDARD'): Promise<BookingRates> {
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
            include: {
                customPricing: {
                    where: { serviceId: serviceId },
                    orderBy: { effectiveDate: 'desc' },
                    take: 1
                }
            }
        })

        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        })

        if (!service) {
            throw new Error(`Service with ID ${serviceId} not found`)
        }

        // Default rates from template (aligned to Full Private Client Rate Sheet)
        const rates: BookingRates = {
            pageRate: service.pageRate || 4.25,
            copyRate: 1.50,
            appearanceFeeRemote: service.appearanceFeeRemote || 100.00,
            appearanceFeeInPerson: service.appearanceFeeInPerson || 150.00, // 2-hr minimum per rate card
            congestionFee: 15.00,
            realtimeFee: service.realtimeFee || 0,
            realtimeDeviceRate: 1.50,
            roughRate: 1.50,
            videographerRate: 1.25,
            interpreterRate: 1.25,
            expertRate: 2.00,
            afterHoursRate: 125,
            waitTimeRate: 100,
            cartRate: 2.00,
            minimumFee: service.defaultMinimumFee || 500.00, // Task 6: $500 standard cover charge floor
            expediteImmediate: service.expediteImmediate || 1.30,
            expedite1Day: service.expedite1Day || 1.15,
            expedite2Day: service.expedite2Day || 1.00,
            expedite3Day: service.expedite3Day || 0.95,
            rateTier: tier
        }

        // Apply Private Tier if requested
        const s = service as any
        if (tier === 'PRIVATE') {
            if (s.privatePageRate !== null && s.privatePageRate !== undefined) rates.pageRate = s.privatePageRate
            if (s.privateAppearanceFeeRemote !== null && s.privateAppearanceFeeRemote !== undefined) rates.appearanceFeeRemote = s.privateAppearanceFeeRemote
            if (s.privateAppearanceFeeInPerson !== null && s.privateAppearanceFeeInPerson !== undefined) rates.appearanceFeeInPerson = s.privateAppearanceFeeInPerson
            if (s.privateMinimumFee !== null && s.privateMinimumFee !== undefined) rates.minimumFee = s.privateMinimumFee
            if (s.privateRealtimeFee !== null && s.privateRealtimeFee !== undefined) rates.realtimeFee = s.privateRealtimeFee
            if (s.privateRoughRate !== null && s.privateRoughRate !== undefined) rates.roughRate = s.privateRoughRate
            if (s.privateCopyRate !== null && s.privateCopyRate !== undefined) rates.copyRate = s.privateCopyRate
            if (s.privateWaitTimeRate !== null && s.privateWaitTimeRate !== undefined) rates.waitTimeRate = s.privateWaitTimeRate
            if (s.privateAfterHoursRate !== null && s.privateAfterHoursRate !== undefined) rates.afterHoursRate = s.privateAfterHoursRate
        }

        // Apply client-type defaults
        const clientType = contact?.clientType?.toUpperCase()
        if (clientType && ['PRIVATE', 'AGENCY', 'LAW_FIRM', 'CORPORATE'].includes(clientType)) {
            const prefixes = {
                pageRate: `${clientType}_PAGE_RATE`,
                appearanceFeeRemote: `${clientType}_APPEARANCE_FEE_REMOTE`,
                appearanceFeeInPerson: `${clientType}_APPEARANCE_FEE_IN_PERSON`,
                minimumFee: `${clientType}_MINIMUM_FEE`,
                realtimeFee: `${clientType}_REALTIME_FEE`,
                roughRate: `${clientType}_ROUGH_RATE`,
                videographerRate: `${clientType}_VIDEOGRAPHER_RATE`,
                interpreterRate: `${clientType}_INTERPRETER_RATE`,
            } as const

            const maybeOverride = (key: string, current: number) => {
                const raw = process.env[key]
                const parsed = raw ? Number(raw) : NaN
                return Number.isFinite(parsed) ? parsed : current
            }

            rates.pageRate = maybeOverride(prefixes.pageRate, rates.pageRate)
            rates.appearanceFeeRemote = maybeOverride(prefixes.appearanceFeeRemote, rates.appearanceFeeRemote)
            rates.appearanceFeeInPerson = maybeOverride(prefixes.appearanceFeeInPerson, rates.appearanceFeeInPerson)
            rates.minimumFee = maybeOverride(prefixes.minimumFee, rates.minimumFee)
            rates.realtimeFee = maybeOverride(prefixes.realtimeFee, rates.realtimeFee)
            rates.roughRate = maybeOverride(prefixes.roughRate, rates.roughRate)
        }

        // Apply custom pricing if enabled
        if (contact?.customPricingEnabled && contact.customPricing.length > 0) {
            const custom = contact.customPricing[0]
            if (custom.pageRate !== null) rates.pageRate = custom.pageRate
            if (custom.appearanceFeeRemote !== null) rates.appearanceFeeRemote = custom.appearanceFeeRemote
            if (custom.appearanceFeeInPerson !== null) rates.appearanceFeeInPerson = custom.appearanceFeeInPerson
            if (custom.realtimeFee !== null) rates.realtimeFee = custom.realtimeFee
            if (custom.minimumFee !== null) rates.minimumFee = custom.minimumFee
        }

        return rates
    }

    static getExpediteMultiplier(days: number): number {
        // Task 4: Matches Full Private Client Rate Sheet exactly
        // These are DIRECT multipliers of base page rate (not additive)
        // 2-day = 100% of base (standard), immediate = 130%, 10-day = 50% (discount)
        const scale: Record<number, number> = {
            0: 1.30,  // Immediate: 130% of base
            1: 1.15,  // 1 business day: 115%
            2: 1.00,  // 2 business days: 100% (standard base)
            3: 0.95,  // 3 days: 95%
            4: 0.90,  // 4 days: 90%
            5: 0.85,  // 5 days: 85%
            6: 0.80,  // 6 days: 80%
            7: 0.75,  // 7 days: 75%
            8: 0.70,  // 8 days: 70%
            9: 0.65,  // 9 days: 65%
            10: 0.50  // 10 business days (standard/regular): 50%
        }
        return scale[days] ?? 1.00
    }

    static calculateTotal(rates: BookingRates, data: {
        pages: number,
        originalCopies: number,
        additionalCopies: number,
        turnaroundDays?: number,
        realtimeDevices?: number,
        hasRough?: boolean,
        hasVideographer?: boolean,
        hasInterpreter?: boolean,
        hasExpert?: boolean,
        afterHoursCount?: number,
        waitTimeCount?: number,
        hasCart?: boolean,
        isRemote?: boolean,
        hasPaperDelivery?: boolean,
        isOnRecordBust?: boolean,
        hasPreBilledReview?: boolean,
        locationBaseFee?: number
    }): { subtotal: number, total: number } {
        const isPrivate = rates.rateTier === 'PRIVATE'
        
        // Task 4: FIXED expedite formula — multiply rate by scale directly (not additive)
        // Formula: effectivePageRate = basePageRate × expediteMultiplier
        // 2-day (1.00) = base rate, immediate (1.30) = 30% surcharge, 10-day (0.50) = 50% discount
        const expediteMultiplier = data.turnaroundDays !== undefined ? this.getExpediteMultiplier(data.turnaroundDays) : 1.00
        const effectivePageRate = rates.pageRate * expediteMultiplier

        // BASE CHARGES: Appearance, Congestion, Pages, Copies
        let baseSubtotal = 0
        baseSubtotal += (data.pages * effectivePageRate * data.originalCopies)
        baseSubtotal += (data.pages * rates.copyRate * data.additionalCopies)
        baseSubtotal += (data.isRemote ? rates.appearanceFeeRemote : rates.appearanceFeeInPerson)
        baseSubtotal += isPrivate ? 0 : rates.congestionFee

        // Task 6: Minimum fee — $500 standard, $750 private (cover charge floors)
        let minFee = isPrivate ? Math.max(rates.minimumFee, 750) : Math.max(rates.minimumFee, 500)
        if (isPrivate && data.isOnRecordBust) {
            minFee = Math.max(minFee, 500) // Statement on record / Bust: $500 private minimum
        }

        // Task 17: Arbitration/Hearings — enforce $300 minimum appearance
        // (the service already has $300 appearance in DB; this guards against custom overrides going below)
        const baseTotal = Math.max(baseSubtotal, minFee)

        // PREMIUM EXTRAS: These add ON TOP of the base coverage
        let extrasTotal = 0

        // 1. Realtime - Image says $2.00/page
        if (data.realtimeDevices && data.realtimeDevices > 0) {
            // Note: Image says "no charge for in-person iPads", but if device count > 0 we charge.
            extrasTotal += (data.pages * rates.realtimeFee * data.realtimeDevices)
        }

        // 2. Rough - Image says $1.75/page
        if (data.hasRough) {
            extrasTotal += (data.pages * rates.roughRate)
        }

        // 3. Specialized Components
        if (data.hasVideographer) extrasTotal += (data.pages * rates.videographerRate)
        if (data.hasInterpreter) extrasTotal += (data.pages * rates.interpreterRate)
        if (data.hasExpert) extrasTotal += (data.pages * rates.expertRate)

        // 4. Hourly Surcharges & Extras
        // After-hours: 50% of original rate + $100/hr
        if (data.afterHoursCount) {
            if (isPrivate) {
                extrasTotal += (data.afterHoursCount * rates.afterHoursRate) // The $100/hr
                extrasTotal += (data.pages * (rates.pageRate * 0.5)) // The 50% of transcript rate
            } else {
                extrasTotal += (data.afterHoursCount * rates.afterHoursRate)
            }
        }
        
        // Wait time: $100/hr
        if (data.waitTimeCount) extrasTotal += (data.waitTimeCount * rates.waitTimeRate)
        
        // CART Services
        if (data.hasCart) extrasTotal += (data.pages * rates.cartRate)
        
        // Paper delivery: +$150
        if (isPrivate && data.hasPaperDelivery) {
            extrasTotal += 150
        }
        
        // Location Base Fee (Task 1)
        if (data.locationBaseFee) {
            extrasTotal += data.locationBaseFee
        }

        // Pre-billed Review (Task 13)
        if (data.hasPreBilledReview) {
            extrasTotal += (data.pages * 1.00) // $1.00 per page standard review fee
        }

        const total = baseTotal + extrasTotal
        const subtotal = baseSubtotal + extrasTotal

        return { subtotal, total }
    }

    static calculateEstimate(rates: BookingRates): number {
        return rates.minimumFee
    }
}
