import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Delete all existing EXPEDITE options to start fresh
    await prisma.addOnOption.deleteMany({
      where: { category: 'EXPEDITE' }
    })

    const cleanExpediteOptions = [
      { label: 'Immediate', value: '1.25', category: 'EXPEDITE' as any, active: true, description: '125% of Original Rate' },
      { label: 'Next Day (Day 1)', value: '1.10', category: 'EXPEDITE' as any, active: true, description: '110% of Original Rate' },
      { label: '2 Days', value: '1.00', category: 'EXPEDITE' as any, active: true, description: '100% of Original Rate' },
      { label: '3 Days', value: '0.90', category: 'EXPEDITE' as any, active: true, description: '90% of Original Rate' },
      { label: '4 Days', value: '0.80', category: 'EXPEDITE' as any, active: true, description: '80% of Original Rate' },
      { label: '5 Days', value: '0.70', category: 'EXPEDITE' as any, active: true, description: '70% of Original Rate' },
      { label: '6 Days', value: '0.60', category: 'EXPEDITE' as any, active: true, description: '60% of Original Rate' },
      { label: '7 Days', value: '0.50', category: 'EXPEDITE' as any, active: true, description: '50% of Original Rate' },
      { label: '8 Days', value: '0.40', category: 'EXPEDITE' as any, active: true, description: '40% of Original Rate' },
      { label: '9 Days', value: '0.30', category: 'EXPEDITE' as any, active: true, description: '30% of Original Rate' },
      { label: '10 Days (Regular)', value: '0.20', category: 'EXPEDITE' as any, active: true, description: '20% of Original Rate' }
    ]

    for (const addon of cleanExpediteOptions) {
      await prisma.addOnOption.create({
        data: addon
      })
    }

    return NextResponse.json({ message: "Expedite options cleaned and reset successfully." })
  } catch (error: any) {
    console.error('Fix add-ons error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
