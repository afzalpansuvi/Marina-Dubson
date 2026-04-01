const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Creating test bookings...');

    const markUser = await prisma.user.findUnique({ where: { email: 'mark.lewis@example.com' } });
    const sannUser = await prisma.user.findUnique({ where: { email: 'sann.lewis@example.com' } });
    const service = await prisma.service.findFirst();

    if (!markUser || !sannUser || !service) {
        console.error('Missing required seed data (User or Service)');
        return;
    }

    const booking1 = await prisma.booking.create({
        data: {
            bookingNumber: 'BK-001',
            contactId: markUser.contactId,
            reporterId: sannUser.id,
            serviceId: service.id,
            userId: markUser.id, // Creator
            bookingDate: new Date(),
            bookingTime: '10:00 AM',
            location: 'Remote Zoom',
            appearanceType: 'REMOTE',
            proceedingType: 'Deposition',
            bookingStatus: 'ASSIGNED',
            notes: 'Smith vs Johnson'
        }
    });
    console.log('Booking 1 created:', booking1.bookingNumber);

    const booking2 = await prisma.booking.create({
        data: {
            bookingNumber: 'BK-002',
            contactId: markUser.contactId,
            reporterId: sannUser.id,
            serviceId: service.id,
            userId: markUser.id, // Creator
            bookingDate: new Date(Date.now() + 86400000 * 2), // 2 days later
            bookingTime: '02:00 PM',
            location: '123 Law St, New York',
            appearanceType: 'IN_PERSON',
            proceedingType: 'Arbitration/Hearings',
            bookingStatus: 'CONFIRMED',
            notes: 'City of New York vs Construction Corp'
        }
    });
    console.log('Booking 2 created:', booking2.bookingNumber);

    console.log('Test bookings created successfully!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
