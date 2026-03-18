import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating all tenants to Pro plan...');

    // 1. Ensure Pro plan exists (it should from seed, but just in case)
    let proPlan = await prisma.plan.findUnique({
        where: { id: 'plan-pro' }
    });

    if (!proPlan) {
        console.log('Pro plan not found, creating it...');
        proPlan = await prisma.plan.create({
            data: {
                id: 'plan-pro',
                name: 'Pro',
                maxVehicles: 50,
                maxUsers: 100,
                maxLocations: 10,
                priceMonthly: 149.90,
                priceYearly: 1499.90,
            }
        });
    }

    // 2. Update all tenants
    const tenants = await prisma.tenant.findMany({
        where: {
            OR: [
                { planId: null },
                { planId: { not: 'plan-pro' } }
            ]
        }
    });

    for (const tenant of tenants) {
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: { planId: proPlan.id }
        });
        console.log(`Updated tenant ${tenant.name} (${tenant.subdomain}) to Pro Plan`);
    }

    console.log(`Finished updating ${tenants.length} tenants.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
