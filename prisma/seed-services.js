const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const services = [
        {
            serviceName: 'Premium Court Reporting',
            category: 'COURT_REPORTING',
            subService: 'DEPOSITION',
            defaultMinimumFee: 500,
            pageRate: 5.5,
            appearanceFeeRemote: 350,
            appearanceFeeInPerson: 400,
            realtimeFee: 2.0,
            expediteImmediate: 2.0,
            expedite1Day: 1.75,
            expedite2Day: 1.5,
            expedite3Day: 1.25,
            description: 'Proceedings: Deposition, Arbitration/Hearings, Examination Under Oath.',
            active: true,
        },
        {
            serviceName: 'CART Services (Communication Access Real-Time Translation)',
            category: 'ACCESSIBILITY',
            subService: 'CART',
            defaultMinimumFee: 400,
            pageRate: 0,
            appearanceFeeRemote: 250,
            appearanceFeeInPerson: 300,
            realtimeFee: 0,
            expediteImmediate: 0,
            expedite1Day: 0,
            expedite2Day: 0,
            expedite3Day: 0,
            description: 'Live verbatim captions for Deaf and hard-of-hearing participants; remote or on-site.',
            active: true,
        }
    ]

    console.log('Seeding services...')
    for (const service of services) {
        try {
            const created = await prisma.service.create({
                data: service
            })
            console.log(`Created service: ${created.serviceName}`)
        } catch (e) {
            console.log(`Service ${service.serviceName} might already exist or skipped: ${e.message}`)
        }
    }
    console.log('Seeding complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
