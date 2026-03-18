import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const FASTROUTE_TENANT_ID = 'e5e1e871-bfc6-435c-a669-78ab76ecb195';

async function main() {
    console.log("Deleteing all existing orders first... 🗑️");
    await prisma.order.deleteMany({
        where: { tenantId: FASTROUTE_TENANT_ID }
    });

    const customers = await prisma.customer.findMany({
        where: { tenantId: FASTROUTE_TENANT_ID }
    });

    console.log(`Found ${customers.length} customers. Seeding 3 new orders... 📦`);

    const orderConfigs = [
        {
            senderName: "Bäckerei Mangold Bregenz",
            senderAddress: "Kaiserstraße 23, 6900 Bregenz, Austria",
            recipientName: "Bregenz Hospital / Kantine",
            recipientAddress: "Carl-Pedenz-Straße 2, 6900 Bregenz, Austria",
            packageInfo: "Große Lunchbox & Getränke",
            serviceType: "standard",
            amount: 45.90
        },
        {
            senderName: "Stadtapotheke Feldkirch",
            senderAddress: "Neustadt 2, 6800 Feldkirch, Austria",
            recipientName: "Anna Steiner",
            recipientAddress: "Schloßgraben 8, 6800 Feldkirch, Austria",
            packageInfo: "Medikamenten-Paket (Dringend)",
            serviceType: "express",
            amount: 25.00
        },
        {
            senderName: "Stadtapotheke Feldkirch",
            senderAddress: "Neustadt 2, 6800 Feldkirch, Austria",
            recipientName: "Robert Koch",
            recipientAddress: "Heiligkreuz 12, 6800 Feldkirch, Austria",
            packageInfo: "Kleines Dokumentenpaket",
            serviceType: "standard",
            amount: 15.00
        }
    ];

    for (let i = 0; i < 3; i++) {
        const config = orderConfigs[i];
        const customer = customers[i % customers.length]; 

        await prisma.order.create({
            data: {
                tenantId: FASTROUTE_TENANT_ID,
                customerId: customer ? customer.id : null,
                senderName: config.senderName,
                senderAddress: config.senderAddress,
                recipientName: config.recipientName,
                recipientAddress: config.recipientAddress,
                customerName: config.recipientName, 
                address: config.recipientAddress,     
                packageInfo: config.packageInfo,
                serviceType: config.serviceType,
                amount: config.amount,
                status: "PENDING",
                driverId: null
            }
        });
    }

    console.log("3 unassigned active orders successfully seeded in Vorarlberg! 🚀");
}

main().catch(console.error).finally(() => prisma.$disconnect());
