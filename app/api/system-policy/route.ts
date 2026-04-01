export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { getAllSystemPolicies, updateSystemPolicies } from '@/lib/system-policy'

const ADMIN_ROLES = new Set(['ADMIN', 'MANAGER', 'SUPER_ADMIN'])

function requireAuth(request: NextRequest) {
  const token = extractTokenFromHeader(request.headers.get('Authorization'))
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    throw new Error('Unauthorized')
  }
  return payload
}

export async function GET(request: NextRequest) {
  try {
    requireAuth(request)
    const policies = await getAllSystemPolicies()
    return NextResponse.json({ policies })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = requireAuth(request)
    if (!ADMIN_ROLES.has(payload.role?.toUpperCase() || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updates = body?.updates || {}
    if (typeof updates !== 'object' || Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const policies = await updateSystemPolicies(
      Object.entries(updates).reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = `${value ?? ''}`
        return acc
      }, {})
    )

    return NextResponse.json({ policies })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to update policies' }, { status: 400 })
  }
}
