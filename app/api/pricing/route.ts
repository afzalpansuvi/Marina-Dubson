import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { PricingEngine } from '@/lib/pricing-engine'

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('Authorization'))
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const contactId = searchParams.get('contactId')
        const serviceId = searchParams.get('serviceId')
        const rateTier = searchParams.get('rateTier') || 'STANDARD'

        if (!contactId || !serviceId) {
            return NextResponse.json({ error: 'Missing contactId or serviceId' }, { status: 400 })
        }

        const rates = await PricingEngine.getApplicableRates(contactId, serviceId, rateTier)
        return NextResponse.json({ rates })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
