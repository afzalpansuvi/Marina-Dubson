const { PrismaClient } = require('@prisma/client')

// Connect directly using the local connection string
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://marina:3S!wK7zqP8^tRe5V@localhost:5432/maria_dubson?schema=public"
    }
  }
})

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
      description: 'Certified reporters with realtime delivery, drawing on a team of editors who verify transcripts before they hit your inbox. PROCEEDINGS: Depositions, Arbitration/Hearings, Trials. Realtime revisions, secure upload, verified transcripts.',
      active: true,
    },
    {
      serviceName: 'CART & Live Captioning',
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
      description: 'Communication Access Real-Time Translation engineered for ADA compliance with secure viewer links and glossary-backed captioners. Remote, Hybrid, On-site. Caption + transcript delivery, Captured metadata, Glossary support.',
      active: true,
    }
  ]

  console.log('Seeding website services...')
  for (const service of services) {
    const created = await prisma.service.create({
      data: service
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
