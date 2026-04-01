const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Reporter and Jobs...');

    const hashedPassword = await bcrypt.hash('Reporter123!', 12);

    // Create Reporter User
    const reporter = await prisma.user.upsert({
        where: { email: 'reporter@mariadubson.com' },
        update: {},
        create: {
            email: 'reporter@mariadubson.com',
            password: hashedPassword,
            firstName: 'Sarah',
            lastName: 'Stenograph',
            role: 'REPORTER',
            certification: 'CSR-90210',
            company: 'Sarah Reporting Inc'
        },
    });
    console.log('Reporter created:', reporter.email);

    // Ensure contact exists for reporter
    await prisma.contact.upsert({
        where: { email: reporter.email },
        update: {},
        create: {
            email: reporter.email,
            firstName: reporter.firstName,
            lastName: reporter.lastName,
            clientType: 'INTERNAL',
            status: 'Active'
        }
    });

    // Create a Client Contact for the jobs
    const client = await prisma.contact.upsert({
        where: { email: 'attorney@lawhouse.com' },
        update: {},
        create: {
            firstName: 'Harvey',
            lastName: 'Specter',
            email: 'attorney@lawhouse.com',
            companyName: 'Pearson Hardman',
            clientType: 'LAW_FIRM'
        }
    });

    // Get a service and an admin
    const service = await prisma.service.findFirst();
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminId = admin ? admin.id : reporter.id; // Fallback to reporter if no admin

    // Create 3 Assigned Jobs for this reporter
    for (let i = 1; i <= 3; i++) {
        const bookingNumber = `BK-REP-${String(i).padStart(3, '0')}`;
        await prisma.booking.upsert({
            where: { bookingNumber },
            update: {},
            create: {
                bookingNumber,
                contactId: client.id,
                serviceId: service.id,
                userId: adminId,
                proceedingType: i === 1 ? 'Deposition' : i === 2 ? 'Arbitration/Hearings' : 'Hearing',
                bookingDate: new Date(Date.now() + (i * 86400000)),
                bookingTime: '09:00 AM',
                location: i === 1 ? 'Zoom' : '123 Legal Way, NY',
                appearanceType: i === 1 ? 'REMOTE' : 'IN_PERSON',
                bookingStatus: i === 3 ? 'COMPLETED' : 'ACCEPTED',
                reporterId: reporter.id,
                lockedPageRate: 4.5,
                lockedAppearanceFee: 400,
                lockedMinimumFee: 500
            }
        });
    }

    // Create 2 Marketplace Jobs
    for (let i = 1; i <= 2; i++) {
        const bookingNumber = `BK-MARKET-${String(i).padStart(3, '0')}`;
        await prisma.booking.upsert({
            where: { bookingNumber },
            update: {},
            create: {
                bookingNumber,
                contactId: client.id,
                serviceId: service.id,
                userId: adminId,
                proceedingType: 'Open Deposition',
                bookingDate: new Date(Date.now() + (5 * 86400000)),
                bookingTime: '10:00 AM',
                location: 'Remote Node',
                appearanceType: 'REMOTE',
                bookingStatus: 'SUBMITTED',
                isMarketplace: true,
                lockedPageRate: 4.5,
                lockedAppearanceFee: 350,
                lockedMinimumFee: 500
            }
        });
    }

    console.log('Reporter seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
