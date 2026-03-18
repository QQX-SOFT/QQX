import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const FASTROUTE_TENANT_ID = 'e5e1e871-bfc6-435c-a669-78ab76ecb195';

async function main() {
    console.log("Cleaning and Seeding Vorarlberg Customers... 🚀");

    const tenant = await prisma.tenant.findUnique({
        where: { id: FASTROUTE_TENANT_ID }
    });

    if (!tenant) {
        console.error("Fastroute Tenant not found in DB! Ensure the ID is correct.");
        return;
    }

    // 1. Delete all existing customers for this tenant
    console.log(" - Deleting existing customers to avoid duplicates");
    await prisma.customer.deleteMany({
        where: { tenantId: FASTROUTE_TENANT_ID }
    });

    // 2. Add Vorarlberg businesses
    console.log(" - Seeding Vorarlberg businesses");
    const customersData = [
        {
            name: 'Bäckerei Mangold Bregenz',
            contactPerson: 'Erich Mangold',
            email: 'bregenz@mangold.at',
            phone: '+43 5574 4110',
            address: 'Kaiserstraße 23, 6900 Bregenz, Austria'
        },
        {
            name: 'Pizzeria Bella Napoli Dornbirn',
            contactPerson: 'Luigi Rossi',
            email: 'info@bellanapoli.at',
            phone: '+43 5572 20130',
            address: 'Marktplatz 5, 6850 Dornbirn, Austria'
        },
        {
            name: 'Stadtapotheke Feldkirch',
            contactPerson: 'Dr. Anna Müller',
            email: 'feldkirch@apotheke.at',
            phone: '+43 5522 72011',
            address: 'Neustadt 2, 6800 Feldkirch, Austria'
        },
        {
            name: 'Spar Markt Bludenz',
            contactPerson: 'Hans Huber',
            email: 'bludenz@spar.at',
            phone: '+43 5552 61110',
            address: 'Wichnerstraße 4, 6700 Bludenz, Austria'
        },
        {
            name: 'Gasthof Krone Lustenau',
            contactPerson: 'Stefan Hämmerle',
            email: 'krone@lustenau.at',
            phone: '+43 5577 82110',
            address: 'Maria-Theresien-Straße 9, 6890 Lustenau, Austria'
        }
    ];

    for (const cust of customersData) {
        await prisma.customer.create({
            data: {
                name: cust.name,
                contactPerson: cust.contactPerson,
                email: cust.email,
                phone: cust.phone,
                address: cust.address,
                tenantId: FASTROUTE_TENANT_ID
            }
        });
    }

    console.log("Vorarlberg Seeding Completed Successfully! ✅");
}

main().catch(console.error).finally(() => prisma.$disconnect());
