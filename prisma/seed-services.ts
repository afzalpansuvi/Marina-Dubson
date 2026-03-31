import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const services = [
        {
            serviceName: 'Premium Court Reporting',
            category: 'COURT_REPORTING',
            subService: 'DEPOSITION',
            defaultMinimumFee: 400,
            pageRate: 4.75,
            appearanceFeeRemote: 100,
            appearanceFeeInPerson: 200,
            realtimeFee: 2.0,
            expediteImmediate: 1.25,
            expedite1Day: 1.10,
            expedite2Day: 1.0,
            expedite3Day: 0.9,
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
        const created = await prisma.service.upsert({
            where: { id: 'seed-' + service.subService.toLowerCase() },
            update: {},
            create: {
                id: 'seed-' + service.subService.toLowerCase(),
                ...service,
            },
        })
        console.log(`Created service: ${created.serviceName}`)
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
