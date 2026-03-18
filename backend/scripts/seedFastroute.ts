import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const FASTROUTE_TENANT_ID = 'e5e1e871-bfc6-435c-a669-78ab76ecb195';

async function main() {
    console.log("Seeding demo data for Fastroute... 🚀");

    const tenant = await prisma.tenant.findUnique({
        where: { id: FASTROUTE_TENANT_ID }
    });

    if (!tenant) {
        console.error("Fastroute Tenant not found in DB! Ensure the ID is correct.");
        return;
    }

    // 1. Create SaaSInvoices
    console.log(" - Adding SaaS invoices");
    const saasInvoicesData = [
        {
            invoiceNumber: `RE-SAAS-2601-${Math.floor(Math.random()*10000)}`,
            amount: 149.90,
            status: 'PAID',
            period: 'Januar 2026',
            dueDate: new Date('2026-01-28')
        },
        {
            invoiceNumber: `RE-SAAS-2602-${Math.floor(Math.random()*10000)}`,
            amount: 149.90,
            status: 'PAID',
            period: 'Februar 2026',
            dueDate: new Date('2026-02-28')
        },
        {
            invoiceNumber: `RE-SAAS-2603-${Math.floor(Math.random()*10000)}`,
            amount: 149.90,
            status: 'UNPAID',
            period: 'März 2026',
            dueDate: new Date('2026-03-28')
        }
    ];

    for (const inv of saasInvoicesData) {
        await prisma.saaSInvoice.upsert({
            where: { invoiceNumber: inv.invoiceNumber },
            update: {},
            create: {
                invoiceNumber: inv.invoiceNumber,
                amount: inv.amount,
                status: inv.status as any,
                period: inv.period,
                dueDate: inv.dueDate,
                tenantId: FASTROUTE_TENANT_ID
            }
        });
    }

    // 2. Create Vehicles
    console.log(" - Adding Vehicles");
    const vehiclesData = [
        {
            licensePlate: 'B-MW 1024',
            make: 'BMW',
            model: '530d',
            milage: 45000,
            status: 'AVAILABLE'
        },
        {
            licensePlate: 'HH-XP 330',
            make: 'Mercedes-Benz',
            model: 'E-Class 220d',
            milage: 78200,
            status: 'AVAILABLE'
        },
        {
            licensePlate: 'M-FA 4402',
            make: 'Volkswagen',
            model: 'Passat Variant',
            milage: 12000,
            status: 'AVAILABLE'
        }
    ];

    for (const veh of vehiclesData) {
        await prisma.vehicle.create({
            data: {
                licensePlate: veh.licensePlate,
                make: veh.make,
                model: veh.model,
                milage: veh.milage,
                status: veh.status as any,
                tenantId: FASTROUTE_TENANT_ID
            }
        });
    }

    // 3. Create Drivers / Users
    console.log(" - Adding Drivers");
    const driversData = [
        {
            email: 'h.bauer@fastroute.de',
            firstName: 'Hans',
            lastName: 'Bauer',
            phone: '+49 157 3920193'
        },
        {
            email: 'm.scholz@fastroute.de',
            firstName: 'Michael',
            lastName: 'Scholz',
            phone: '+49 157 3840292'
        },
        {
            email: 'j.neumann@fastroute.de',
            firstName: 'Julia',
            lastName: 'Neumann',
            phone: '+49 157 1039482'
        }
    ];

    for (const drv of driversData) {
        const user = await prisma.user.create({
            data: {
                clerkId: `demo_clerk_${Math.random().toString(36).substring(7)}`,
                email: drv.email,
                role: 'DRIVER',
                tenantId: FASTROUTE_TENANT_ID
            }
        });

        await prisma.driver.create({
            data: {
                userId: user.id,
                tenantId: FASTROUTE_TENANT_ID,
                firstName: drv.firstName,
                lastName: drv.lastName,
                phone: drv.phone,
                type: 'EMPLOYED',
                status: 'ACTIVE'
            }
        });
    }

    console.log("Seeding Completed Successfully! ✅");
}

main().catch(console.error).finally(() => prisma.$disconnect());
