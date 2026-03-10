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

    // 5. Create some plans
    const starterPlan = await prisma.plan.upsert({
        where: { id: 'plan-starter' },
        update: {},
        create: {
            id: 'plan-starter',
            name: 'Starter',
            maxVehicles: 5,
            maxUsers: 10,
            maxLocations: 1,
            priceMonthly: 89.90,
            priceYearly: 899.90,
        },
    });

    const proPlan = await prisma.plan.upsert({
        where: { id: 'plan-pro' },
        update: {},
        create: {
            id: 'plan-pro',
            name: 'Pro',
            maxVehicles: 50,
            maxUsers: 100,
            maxLocations: 10,
            priceMonthly: 149.90,
            priceYearly: 1499.90,
        },
    });

    // 6. Create features
    await prisma.feature.upsert({
        where: { key: 'LIVE_TRACKING' },
        update: {},
        create: { key: 'LIVE_TRACKING', description: 'Real-time GPS tracking of vehicles' },
    });
    await prisma.feature.upsert({
        where: { key: 'DRIVER_WALLET' },
        update: {},
        create: { key: 'DRIVER_WALLET', description: 'Internal wallet for driver spending' },
    });

    // Link demo tenant to pro plan
    await prisma.tenant.update({
        where: { id: tenant.id },
        data: { planId: proPlan.id },
    });

    // 7. Create some vehicles
    const vehiclesCount = await prisma.vehicle.count({ where: { tenantId: tenant.id } });
    if (vehiclesCount === 0) {
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
        });
    }

    // 8. Create some dummy locations
    await prisma.location.upsert({
        where: { id: 'demo-loc-1' },
        update: {},
        create: {
            id: 'demo-loc-1',
            tenantId: tenant.id,
            name: 'Wien Zentrale',
            address: 'Stephansplatz 1, 1010 Wien',
            status: 'ACTIVE'
        }
    });

    // 9. Create an active TimeEntry for the driver so they show up on the map
    await prisma.timeEntry.create({
        data: {
            driverId: driver.id,
            startTime: new Date(),
            currentLat: 48.2082,  // Vienna Center
            currentLng: 16.3738,
            status: 'RUNNING'
        }
    });

    // 10. Create some dummy orders
    await prisma.order.createMany({
        data: [
            {
                tenantId: tenant.id,
                customerName: 'Max Mustermann',
                amount: 45.90,
                status: 'DELIVERED',
                deliveredAt: new Date(),
                createdAt: new Date(Date.now() - 3600000)
            },
            {
                tenantId: tenant.id,
                customerName: 'Anna Schmidt',
                amount: 129.00,
                status: 'PENDING',
                createdAt: new Date()
            }
        ]
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
