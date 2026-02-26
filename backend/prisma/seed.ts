import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create a Demo Tenant
    const tenant = await prisma.tenant.upsert({
        where: { subdomain: 'demo' },
        update: {},
        create: {
            name: 'QQX Demo Logistik',
            subdomain: 'demo',
        },
    });

    // Add Vercel Subdomain for Testing
    await prisma.tenant.upsert({
        where: { subdomain: 'qqx-blond' },
        update: {},
        create: {
            name: 'QQX Vercel Preview',
            subdomain: 'qqx-blond',
        },
    });

    console.log(`Tenant created: ${tenant.name}`);

    // 2. Create a Super Admin User
    await prisma.user.upsert({
        where: { email: 'admin@qqx.de' },
        update: {},
        create: {
            email: 'admin@qqx.de',
            clerkId: 'super-admin-1',
            role: 'SUPER_ADMIN',
        },
    });

    // 3. Create a Customer Admin for the Demo Tenant
    const customerAdmin = await prisma.user.upsert({
        where: { email: 'demo@qqx.de' },
        update: {},
        create: {
            email: 'demo@qqx.de',
            clerkId: 'demo-admin-1',
            role: 'CUSTOMER_ADMIN',
            tenantId: tenant.id,
        },
    });

    // 4. Create a Demo Driver
    const driverUser = await prisma.user.upsert({
        where: { email: 'driver@qqx.de' },
        update: {},
        create: {
            email: 'driver@qqx.de',
            clerkId: 'demo-driver-1',
            role: 'DRIVER',
            tenantId: tenant.id,
        },
    });

    const driver = await prisma.driver.upsert({
        where: { userId: driverUser.id },
        update: {},
        create: {
            userId: driverUser.id,
            tenantId: tenant.id,
            firstName: 'Max',
            lastName: 'Mustermann',
            phone: '+49 123 456789',
            status: 'ACTIVE',
        },
    });

    // 5. Create some vehicles
    await prisma.vehicle.createMany({
        data: [
            {
                tenantId: tenant.id,
                make: 'Mercedes-Benz',
                model: 'Sprinter',
                licensePlate: 'B-QX 101',
                milage: 45000,
                status: 'AVAILABLE',
            },
            {
                tenantId: tenant.id,
                make: 'VW',
                model: 'Crafter',
                licensePlate: 'B-QX 102',
                milage: 82000,
                status: 'MAINTENANCE',
            },
        ],
        skipDuplicates: true,
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
