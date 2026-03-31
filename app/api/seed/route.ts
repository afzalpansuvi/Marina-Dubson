import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Requirement 13: Standardize Appearance Fees ($150 2-hr min / $300 Full Day)
        // Exception: Arbitration/Hearings = $300 minimum.
        const services = [
            {
                serviceName: 'Deposition',
                category: 'COURT_REPORTING' as any,
                subService: 'DEPOSITION' as any,
                defaultMinimumFee: 500,
                pageRate: 4.25,
                appearanceFeeRemote: 150,
                appearanceFeeInPerson: 300,
                realtimeFee: 1.5,
                expediteImmediate: 1.30,
                expedite1Day: 1.15,
                expedite2Day: 1.00,
                expedite3Day: 0.95,
                privatePageRate: 8.50, // Matches rate card precisely
                privateCopyRate: 1.00, 
                privateAppearanceFeeRemote: 150,
                privateAppearanceFeeInPerson: 300,
                privateMinimumFee: 500,
                privateRealtimeFee: 2.0,
                privateRoughRate: 1.50,
                privateWaitTimeRate: 100,
                privateAfterHoursRate: 100,
                description: 'Certified stenographic reporting for standard depositions.',
                active: true
            },
            {
                serviceName: 'Arbitration/Hearings',
                category: 'COURT_REPORTING' as any,
                subService: 'ARBITRATION_HEARINGS' as any,
                defaultMinimumFee: 300, // Matches Arb/Hearing specific baseline
                pageRate: 6.25,
                appearanceFeeRemote: 300,
                appearanceFeeInPerson: 300,
                realtimeFee: 2.5,
                expediteImmediate: 1.30,
                expedite1Day: 1.15,
                expedite2Day: 1.00,
                expedite3Day: 0.95,
                privatePageRate: 8.50,
                privateCopyRate: 1.00,
                privateAppearanceFeeRemote: 300,
                privateAppearanceFeeInPerson: 300,
                privateMinimumFee: 500, // Bust / Minimum (job cancelled / no-go)
                privateRealtimeFee: 2.0,
                privateRoughRate: 1.50,
                privateWaitTimeRate: 100,
                privateAfterHoursRate: 100,
                description: 'Specialized stenographic support for Arbitration/Hearings and detailed hearings.',
                active: true
            },
            {
                serviceName: 'Hearing',
                category: 'COURT_REPORTING' as any,
                subService: 'HEARING' as any,
                defaultMinimumFee: 500,
                pageRate: 5.5,
                appearanceFeeRemote: 150,
                appearanceFeeInPerson: 300,
                realtimeFee: 2.0,
                expediteImmediate: 1.30,
                expedite1Day: 1.15,
                expedite2Day: 1.00,
                expedite3Day: 0.95,
                privatePageRate: 8.50,
                privateAppearanceFeeRemote: 150,
                privateAppearanceFeeInPerson: 300,
                privateMinimumFee: 500,
                description: 'Stenographic recording services for court hearings and legal proceedings.',
                active: true
            },
            {
                serviceName: 'Examinations Under Oath',
                category: 'COURT_REPORTING' as any,
                subService: 'EXAMINATION' as any,
                defaultMinimumFee: 500,
                pageRate: 5.5,
                appearanceFeeRemote: 150,
                appearanceFeeInPerson: 300,
                realtimeFee: 2.0,
                expediteImmediate: 1.30,
                expedite1Day: 1.15,
                expedite2Day: 1.00,
                expedite3Day: 0.95,
                privatePageRate: 8.50,
                description: 'Professional recording for Examinations Under Oath.',
                active: true
            },
            {
                serviceName: 'CART',
                category: 'ACCESSIBILITY' as any,
                subService: 'CART' as any,
                defaultMinimumFee: 500,
                pageRate: 0,
                appearanceFeeRemote: 150,
                appearanceFeeInPerson: 300,
                realtimeFee: 0,
                expediteImmediate: 0,
                expedite1Day: 0,
                expedite2Day: 0,
                expedite3Day: 0,
                description: 'Communication Access Real-Time Translation for ADA accessibility.',
                active: true
            },
            {
                serviceName: 'Other',
                category: 'COURT_REPORTING' as any,
                subService: 'OTHER' as any,
                defaultMinimumFee: 500,
                pageRate: 5.5,
                appearanceFeeRemote: 150,
                appearanceFeeInPerson: 300,
                realtimeFee: 2.0,
                expediteImmediate: 1.30,
                expedite1Day: 1.15,
                expedite2Day: 1.00,
                expedite3Day: 0.95,
                description: 'Miscellaneous stenographic services.',
                active: true
            }
        ]

        for (const s of services) {
            await prisma.service.upsert({
                where: { id: 'seed-' + s.serviceName.toLowerCase().replace(/[\s\/]/g, '-') },
                update: s as any,
                create: {
                    id: 'seed-' + s.serviceName.toLowerCase().replace(/[\s\/]/g, '-'),
                    ...s
                } as any
            })
        }

        // Seed Add-Ons per Requirement 14 & 13 (Expedite Scale)
        const addOns = [
            { label: 'Rough Draft', value: 'ROUGH_DRAFT', category: 'ADD_ON' as any, active: true },
            { label: 'Real-Time', value: 'REALTIME', category: 'ADD_ON' as any, active: true },
            { label: 'CART Services', value: 'CART_SERVICES', category: 'ADD_ON' as any, active: true },
            { label: 'Immediate', value: '1.30', category: 'EXPEDITE' as any, active: true, description: '130% of Base Rate' },
            { label: '1 Day', value: '1.15', category: 'EXPEDITE' as any, active: true, description: '115% of Base Rate' },
            { label: '2 Days', value: '1.00', category: 'EXPEDITE' as any, active: true, description: '100% of Base Rate' },
            { label: '3 Days', value: '0.95', category: 'EXPEDITE' as any, active: true, description: '95% of Base Rate' },
            { label: '4 Days', value: '0.90', category: 'EXPEDITE' as any, active: true, description: '90% of Base Rate' },
            { label: '5 Days', value: '0.85', category: 'EXPEDITE' as any, active: true, description: '85% of Base Rate' },
            { label: '6 Days', value: '0.80', category: 'EXPEDITE' as any, active: true, description: '80% of Base Rate' },
            { label: '7 Days', value: '0.75', category: 'EXPEDITE' as any, active: true, description: '75% of Base Rate' },
            { label: '8 Days', value: '0.70', category: 'EXPEDITE' as any, active: true, description: '70% of Base Rate' },
            { label: '9 Days', value: '0.65', category: 'EXPEDITE' as any, active: true, description: '65% of Base Rate' },
            { label: '10 Days (Regular)', value: '0.50', category: 'EXPEDITE' as any, active: true, description: '50% of Base Rate' }
        ]

        for (const addon of addOns) {
            await prisma.addOnOption.upsert({
                where: { value: addon.value },
                update: addon,
                create: addon
            })
        }

        return NextResponse.json({ success: true, message: 'Services standardized with Appearance Fees in Requirement 13 and CART add-on in Requirement 11.' })
    } catch (error) {
        console.error('Seed error:', error)
        return NextResponse.json({ success: false, error: 'Failed to seed data' }, { status: 500 })
    }
}
