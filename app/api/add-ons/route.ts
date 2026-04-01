import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
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
    const defaultExpediteOptions = [
      { label: 'Immediate', value: '1.25', category: 'EXPEDITE' as any, active: true },
      { label: 'Next Day (Day 1)', value: '1.10', category: 'EXPEDITE' as any, active: true },
      { label: '2 Days', value: '1.00', category: 'EXPEDITE' as any, active: true },
      { label: '3 Days', value: '0.90', category: 'EXPEDITE' as any, active: true },
      { label: '4 Days', value: '0.80', category: 'EXPEDITE' as any, active: true },
      { label: '5 Days', value: '0.70', category: 'EXPEDITE' as any, active: true },
      { label: '6 Days', value: '0.60', category: 'EXPEDITE' as any, active: true },
      { label: '7 Days', value: '0.50', category: 'EXPEDITE' as any, active: true },
      { label: '8 Days', value: '0.40', category: 'EXPEDITE' as any, active: true },
      { label: '9 Days', value: '0.30', category: 'EXPEDITE' as any, active: true },
      { label: '10 Days (Regular Days)', value: '0.20', category: 'EXPEDITE' as any, active: true }
    ]

    let options = await prisma.addOnOption.findMany({
      orderBy: [{ category: 'asc' }, { label: 'asc' }]
    })

    const expediteOptionsFound = options.filter(o => o.category === 'EXPEDITE')
    const hasDuplicates = new Set(expediteOptionsFound.map(o => o.label)).size !== expediteOptionsFound.length || expediteOptionsFound.length !== defaultExpediteOptions.length

    if (options.length === 0 || hasDuplicates) {
      if (hasDuplicates) {
         await prisma.addOnOption.deleteMany({ where: { category: 'EXPEDITE' } })
      }

      const otherAddOns = [
        { label: 'Rough Draft', value: 'ROUGH_DRAFT', category: 'ADD_ON' as any, active: true },
        { label: 'Real-Time Streaming', value: 'REAL_TIME', category: 'ADD_ON' as any, active: true },
        { label: 'CART Services', value: 'CART_SERVICES', category: 'ADD_ON' as any, active: true },
      ]

      const allToSeed = [...otherAddOns, ...defaultExpediteOptions]

      for (const addon of allToSeed) {
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

    const uniqueOptions = options.reduce((acc: any[], current) => {
      const isDuplicate = acc.find(item => item.label === current.label && item.category === current.category);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);

    return NextResponse.json({ options: uniqueOptions })
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
