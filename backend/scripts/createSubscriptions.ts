import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating subscriptions for tenants...');

    const tenants = await prisma.tenant.findMany({
        where: {
            planId: { not: null }
        }
    });

    for (const tenant of tenants) {
        // Check if subscription already exists
        const existingSub = await prisma.subscription.findUnique({
            where: { tenantId: tenant.id }
        });

        if (!existingSub) {
            await prisma.subscription.create({
                data: {
                    tenantId: tenant.id,
                    planId: tenant.planId!,
                    status: 'ACTIVE',
                    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Tage ab heute
                }
            });
            console.log(`Subscription für tenant ${tenant.name} (${tenant.subdomain}) erstellt.`);
        } else {
            // Update if status is anything else to ACTIVE
            await prisma.subscription.update({
                where: { tenantId: tenant.id },
                data: { status: 'ACTIVE' }
            });
            console.log(`Subscription für tenant ${tenant.name} auf ACTIVE aktualisiert.`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
