import { prisma } from './prisma'

// Data access logging for NY SHIELD Act compliance
export async function logDataAccess({
    userId,
    resource,
    resourceId,
    action,
    ipAddress,
    userAgent,
    success = true,
    failureReason
}: {
    userId: string
    resource: string
    resourceId: string
    action: 'VIEW' | 'EDIT' | 'DELETE' | 'EXPORT' | 'CREATE'
    ipAddress?: string
    userAgent?: string
    success?: boolean
    failureReason?: string
}) {
    try {
        await prisma.dataAccessLog.create({
            data: {
                userId,
                resource,
                resourceId,
                action,
                ipAddress,
                userAgent,
                success,
                failureReason
            }
        })
    } catch (error) {
        console.error('Failed to log data access:', error)
        // Don't throw - logging failures shouldn't break functionality
    }
}

// Initialize default data retention policies
export async function initializeDataRetentionPolicies() {
    const policies = [
        {
            dataCategory: 'CLIENT_DATA',
            retentionPeriod: '7_YEARS',
            description: 'Client contact information and account details',
            legalBasis: 'IRS_REQUIREMENT',
            autoDelete: false
        },
        {
            dataCategory: 'BOOKING_RECORDS',
            retentionPeriod: '10_YEARS',
            description: 'Case bookings, proceedings, and related metadata',
            legalBasis: 'LEGAL_PROCEEDING',
            autoDelete: false
        },
        {
            dataCategory: 'FINANCIAL_RECORDS',
            retentionPeriod: '7_YEARS',
            description: 'Invoices, payments, and billing records',
            legalBasis: 'IRS_REQUIREMENT',
            autoDelete: false
        },
        {
            dataCategory: 'MEDICAL_DATA',
            retentionPeriod: '7_YEARS',
            description: 'Medical records and health information from EUOs',
            legalBasis: 'NY_SHIELD_ACT',
            autoDelete: false
        },
        {
            dataCategory: 'WEBSITE_ANALYTICS',
            retentionPeriod: '26_MONTHS',
            description: 'Website usage logs and analytics data',
            legalBasis: 'DATA_MINIMIZATION',
            autoDelete: true
        },
        {
            dataCategory: 'INACTIVE_ACCOUNTS',
            retentionPeriod: '2_YEARS',
            description: 'Data from inactive user accounts',
            legalBasis: 'DATA_MINIMIZATION',
            autoDelete: true
        }
    ]

    for (const policy of policies) {
        await prisma.dataRetentionPolicy.upsert({
            where: { dataCategory: policy.dataCategory },
            update: {},
            create: policy
        })
    }

    console.log('Data retention policies initialized')
}

// Check if data should be retained based on policy
export async function shouldRetainData(dataCategory: string, createdAt: Date): Promise<boolean> {
    const policy = await prisma.dataRetentionPolicy.findUnique({
        where: { dataCategory }
    })

    if (!policy) return true // Default to retain if no policy

    const retentionDays = parseRetentionPeriod(policy.retentionPeriod)
    const retentionEnd = new Date(createdAt)
    retentionEnd.setDate(retentionEnd.getDate() + retentionDays)

    return new Date() <= retentionEnd
}

function parseRetentionPeriod(period: string): number {
    const match = period.match(/(\d+)_(YEAR|MONTH|DAY)S?/)
    if (!match) return 365 * 7 // Default 7 years

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
        case 'YEAR':
            return value * 365
        case 'MONTH':
            return value * 30
        case 'DAY':
            return value
        default:
            return 365 * 7
    }
}

// Report a security incident
export async function reportSecurityIncident({
    incidentType,
    severity,
    description,
    affectedData,
    affectedUsers = 0
}: {
    incidentType: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    description: string
    affectedData?: string[]
    affectedUsers?: number
}) {
    const incident = await prisma.securityIncident.create({
        data: {
            incidentType,
            severity,
            description,
            affectedData: affectedData ? JSON.stringify(affectedData) : null,
            affectedUsers,
            status: 'OPEN'
        }
    })

    // TODO: Send immediate notification to DPO and management
    // await sendSecurityAlert(incident)

    return incident
}

// Get data retention report
export async function getDataRetentionReport() {
    const policies = await prisma.dataRetentionPolicy.findMany({
        orderBy: { dataCategory: 'asc' }
    })

    // Get counts for each data category
    const stats = await Promise.all([
        { category: 'CLIENT_DATA', count: await prisma.contact.count() },
        { category: 'BOOKING_RECORDS', count: await prisma.booking.count() },
        { category: 'FINANCIAL_RECORDS', count: await prisma.invoice.count() },
        { category: 'MEDICAL_DATA', count: 0 }, // Would need to identify EUO bookings with medical data
        { category: 'WEBSITE_ANALYTICS', count: await prisma.dataAccessLog.count() },
    ])

    return policies.map(policy => ({
        ...policy,
        currentRecords: stats.find(s => s.category === policy.dataCategory)?.count || 0
    }))
}

// Get access audit report for a specific user or resource
export async function getAccessAuditReport({
    userId,
    resource,
    resourceId,
    startDate,
    endDate
}: {
    userId?: string
    resource?: string
    resourceId?: string
    startDate?: Date
    endDate?: Date
}) {
    const where: any = {}

    if (userId) where.userId = userId
    if (resource) where.resource = resource
    if (resourceId) where.resourceId = resourceId
    if (startDate || endDate) {
        where.accessedAt = {}
        if (startDate) where.accessedAt.gte = startDate
        if (endDate) where.accessedAt.lte = endDate
    }

    const logs = await prisma.dataAccessLog.findMany({
        where,
        orderBy: { accessedAt: 'desc' },
        take: 1000
    })

    return logs
}

// Get pending data subject requests
export async function getPendingDataRequests() {
    return await prisma.dataSubjectRequest.findMany({
        where: {
            status: {
                in: ['PENDING', 'IN_PROGRESS']
            }
        },
        orderBy: { requestedAt: 'asc' }
    })
}

// Calculate days until response deadline (30 days from request)
export function getResponseDeadline(requestedAt: Date): number {
    const deadline = new Date(requestedAt)
    deadline.setDate(deadline.getDate() + 30)
    const daysRemaining = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysRemaining
}
