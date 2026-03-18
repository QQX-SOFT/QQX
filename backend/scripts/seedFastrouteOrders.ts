import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const FASTROUTE_TENANT_ID = 'e5e1e871-bfc6-435c-a669-78ab76ecb195';

async function main() {
    console.log("Seeding Customer and Order data for Fastroute... 🚀");

    // 1. Fetch random driver for assignment
    const driver = await prisma.driver.findFirst({
        where: { tenantId: FASTROUTE_TENANT_ID }
    });

    if (!driver) {
        console.error("No driver found to assign orders to. Run step 1 list first.");
        // We can create one right here just in case if it's missing, but it was seeded previously
    }

    // 2. Create Customers
    console.log(" - Adding Customers");
    const customersData = [
        {
            name: "Müller Logistik GmbH",
            contactPerson: "Klaus Müller",
            email: "k.mueller@muellerlogistik.de",
            phone: "+49 211 4930211",
            address: "Königsallee 12, 40212 Düsseldorf"
        },
        {
            name: "Catering Express KG",
            contactPerson: "Sabine Fischer",
            email: "s.fischer@cateringexpress.de",
            phone: "+49 211 8820311",
            address: "Breite Str. 5, 40213 Düsseldorf"
        },
        {
            name: "Privat Paketdienst",
            contactPerson: "Peter Schmidt",
            email: "p.schmidt@gmail.com",
            phone: "+49 171 1139482",
            address: "Rathausplatz 1, 40213 Düsseldorf"
        }
    ];

    const seededCustomers = [];
    for (const cust of customersData) {
        const c = await prisma.customer.create({
            data: {
                name: cust.name,
                contactPerson: cust.contactPerson,
                email: cust.email,
                phone: cust.phone,
                address: cust.address,
                tenantId: FASTROUTE_TENANT_ID
            }
        });
        seededCustomers.push(c);
    }

    // 3. Create Orders Linked to Customers
    console.log(" - Adding Orders linked to Customers");
    const ordersData = [
        {
            customer: seededCustomers[0], // Müller Logistik
            amount: 85.50,
            senderName: "Müller Logistik",
            senderAddress: "Düsseldorf Königsallee 12",
            recipientName: "Bäckerei Klein",
            recipientAddress: "Essen Hauptstraße 140",
            status: "DELIVERED",
            notes: "Fracht vorsichtig entladen"
        },
        {
            customer: seededCustomers[0], // Müller Logistik
            amount: 110.00,
            senderName: "Bäckerei Klein",
            senderAddress: "Essen Hauptstraße 140",
            recipientName: "Müller Logistik",
            recipientAddress: "Düsseldorf Königsallee 12",
            status: "ON_THE_WAY",
            notes: "Terminlieferung"
        },
        {
            customer: seededCustomers[1], // Catering Express
            amount: 45.00,
            senderName: "Catering Express",
            senderAddress: "Breite Str. 5, Düsseldorf",
            recipientName: "Hotel Excelsior",
            recipientAddress: "Graf-Adolf-Platz 1, Düsseldorf",
            status: "PENDING",
            notes: "Kühlkette einhalten"
        },
        {
            customer: seededCustomers[2], // Privat Paketdienst
            amount: 22.90,
            senderName: "Peter Schmidt",
            senderAddress: "Rathausplatz 1, Düsseldorf",
            recipientName: "Maria Schmidt",
            recipientAddress: "Berliner Allee 20, Düsseldorf",
            status: "DELIVERED",
            notes: "Abgabe bei Nachbarn erlaubt"
        }
    ];

    for (const ord of ordersData) {
        await prisma.order.create({
            data: {
                tenantId: FASTROUTE_TENANT_ID,
                customerId: ord.customer.id,
                driverId: ord.status !== "PENDING" && driver ? driver.id : null,
                amount: ord.amount,
                senderName: ord.senderName,
                senderAddress: ord.senderAddress,
                recipientName: ord.recipientName,
                recipientAddress: ord.recipientAddress,
                status: ord.status as any,
                notes: ord.notes,
                source: "DIRECT"
            }
        });
    }

    console.log("Customer and Order Seeding Completed Successfully! ✅");
}

main().catch(console.error).finally(() => prisma.$disconnect());
