const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const options = await prisma.addOnOption.findMany({
    orderBy: { category: 'asc' }
  });
  console.log(JSON.stringify(options, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
