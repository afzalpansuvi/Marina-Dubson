const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // 1. Create Contact first (User depends on it via email)
    const adminContact = await prisma.contact.upsert({
        where: { email: 'admin@marinadubson.com' },
        update: {},
        create: {
            firstName: 'Marina',
            lastName: 'Dubson',
            email: 'admin@marinadubson.com',
            companyName: 'Marina Dubson Stenographic Services',
            phone: '555-0100',
            notes: 'System Admin Contact',
            clientType: 'LAW_FIRM'
        },
    });
    console.log('Admin contact created:', adminContact.email);

    // 2. Create Admin User
    const hashedPassword = await bcrypt.hash('SecurePassword123!', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@marinadubson.com' },
        update: {},
        create: {
            email: 'admin@marinadubson.com',
            password: hashedPassword,
            firstName: 'Marina',
            lastName: 'Dubson',
            role: 'ADMIN',
        },
    });
    console.log('Admin user created:', admin.email);

    // 3. Seed Services
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
    ];

    for (const s of services) {
        const res = await prisma.service.upsert({
            where: { id: 'seed-' + s.subService.toLowerCase() },
            update: {},
            create: {
                id: 'seed-' + s.subService.toLowerCase(),
                ...s
            }
        });
        console.log('Service created:', res.serviceName);
    }

    // 4. Seed some initial contacts/clients
    const markContact = await prisma.contact.upsert({
        where: { email: 'mark.lewis@example.com' },
        update: {},
        create: {
            firstName: 'Mark',
            lastName: 'Lewis',
            email: 'mark.lewis@example.com',
            companyName: 'Lewis & Associates',
            phone: '555-0200',
            notes: 'Test Client',
            clientType: 'LAW_FIRM'
        }
    });
    console.log('Mark Lewis contact created:', markContact.email);

    const markUser = await prisma.user.upsert({
        where: { email: 'mark.lewis@example.com' },
        update: {},
        create: {
            email: 'mark.lewis@example.com',
            password: hashedPassword,
            firstName: 'Mark',
            lastName: 'Lewis',
            role: 'CLIENT',
            contactId: markContact.id
        }
    });
    console.log('Mark Lewis user created:', markUser.email);

    const sannContact = await prisma.contact.upsert({
        where: { email: 'sann.lewis@example.com' },
        update: {},
        create: {
            firstName: 'Sann',
            lastName: 'Lewis',
            email: 'sann.lewis@example.com',
            phone: '555-0300',
            notes: 'Test Reporter',
            clientType: 'REPORTER'
        }
    });
    console.log('Sann Lewis contact created:', sannContact.email);

    const sannUser = await prisma.user.upsert({
        where: { email: 'sann.lewis@example.com' },
        update: {},
        create: {
            email: 'sann.lewis@example.com',
            password: hashedPassword,
            firstName: 'Sann',
            lastName: 'Lewis',
            role: 'REPORTER',
            contactId: sannContact.id
        }
    });
    console.log('Sann Lewis user created:', sannUser.email);

    console.log('Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
