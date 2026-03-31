const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const services = await prisma.service.findMany()
    console.log('Services in DB:', services.length)
    console.log(JSON.stringify(services, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
