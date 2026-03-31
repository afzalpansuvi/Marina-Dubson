import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const addOnSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  category: z.enum(['ADD_ON', 'EXPEDITE']).default('ADD_ON'),
  description: z.string().optional(),
  allowCustom: z.boolean().optional(),
  active: z.boolean().optional()
})

export async function GET() {
  try {
    let options = await prisma.addOnOption.findMany({
      orderBy: [{ category: 'asc' }, { label: 'asc' }]
    })

    // Auto-seed if empty
    if (options.length === 0) {
      const defaultAddOns = [
        { label: 'Rough Draft', value: 'ROUGH_DRAFT', category: 'ADD_ON' as any, active: true },
        { label: 'Real-Time Streaming', value: 'REAL_TIME', category: 'ADD_ON' as any, active: true },
        { label: 'CART Services', value: 'CART_SERVICES', category: 'ADD_ON' as any, active: true },
        { label: 'Immediate', value: '1.25', category: 'EXPEDITE' as any, active: true, description: '125% of Original Rate' },
        { label: 'Next Day (1 Day)', value: '1.10', category: 'EXPEDITE' as any, active: true, description: '110% of Original Rate' },
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

      for (const addon of defaultAddOns) {
        await prisma.addOnOption.upsert({
          where: { value: addon.value },
          update: addon,
          create: addon
        })
      }

      options = await prisma.addOnOption.findMany({
        orderBy: [{ category: 'asc' }, { label: 'asc' }]
      })
    }

    return NextResponse.json({ options })
  } catch (error) {
    console.error('Fetch add-on options error:', error)
    return NextResponse.json({ error: 'Unable to load add-on options' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'))
    const payload = token ? verifyToken(token) : null
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = addOnSchema.parse(body)

    const existing = await prisma.addOnOption.findUnique({ where: { value: data.value } })
    if (existing) {
      return NextResponse.json({ error: 'Add-on option already exists' }, { status: 409 })
    }

    const option = await prisma.addOnOption.create({ data })
    return NextResponse.json(option, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.errors }, { status: 400 })
    }
    console.error('Create add-on option error:', error)
    return NextResponse.json({ error: 'Unable to create add-on option' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'))
    const payload = token ? verifyToken(token) : null
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const id = body.id
    if (!id) {
      return NextResponse.json({ error: 'Add-on ID required' }, { status: 400 })
    }

    const data = addOnSchema.partial().parse(body)

    const option = await prisma.addOnOption.update({
      where: { id },
      data
    })

    return NextResponse.json(option)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.errors }, { status: 400 })
    }
    console.error('Update add-on option error:', error)
    return NextResponse.json({ error: 'Unable to update add-on option' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'))
    const payload = token ? verifyToken(token) : null
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Add-on ID required' }, { status: 400 })
    }

    await prisma.addOnOption.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete add-on option error:', error)
    return NextResponse.json({ error: 'Unable to delete add-on option' }, { status: 500 })
  }
}
