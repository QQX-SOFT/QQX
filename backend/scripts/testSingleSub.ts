import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const subscriptions = await prisma.subscription.findMany();
    if (subscriptions.length === 0) {
        console.log("No subscriptions found in DB.");
        return;
    }

    const testId = subscriptions[0].id;
    console.log(`Testing with subscription ID: ${testId}`);

    const sub = await prisma.subscription.findUnique({
        where: { id: testId },
        include: { tenant: true }
    });

    console.log("Result:", sub);
}

main().catch(console.error).finally(() => prisma.$disconnect());
