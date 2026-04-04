import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Robustly restoring real users...');

    // Delete in order to satisfy FK constraints
    await prisma.timeEntry.deleteMany({});
    await prisma.planFeature.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.complaint.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.payout.deleteMany({});
    await prisma.walletHistory.deleteMany({});
    await prisma.rating.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.contract.deleteMany({});
    await prisma.contractTemplate.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});
    await prisma.plan.deleteMany({});
    await prisma.feature.deleteMany({});

    // Plans
    await prisma.plan.create({
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

    // Tenants
    const fastroute = await prisma.tenant.create({
        data: {
            id: 'e5e1e871-bfc6-435c-a669-78ab76ecb195',
            name: 'Fastroute',
            subdomain: 'fastroute',
            address: 'Achstraße 42, 6922 Wolfurt, Austria',
            city: 'Wolfurt',
            zipCode: '6922',
            uidNumber: 'ATU71572719',
            planId: 'plan-pro'
        }
    });

    // ... (rest same as before)
    await prisma.tenant.create({ data: { id: '450ea163-0850-4e6e-be8d-57023b5074bb', name: 'Ali Yilmaz GmbH', subdomain: 'aliyilmazgmbh', planId: 'plan-pro' } });
    await prisma.tenant.create({ data: { id: 'd2271964-deff-40db-b2ba-e143fb3e5e67', name: 'Transfero', subdomain: 'transfero', planId: 'plan-pro' } });
    await prisma.tenant.create({ data: { id: '25310e89-f5fa-40d1-a2eb-43bcdc903297', name: 'Arli´s Road House KG', subdomain: 'arlis', planId: 'plan-pro' } });
    await prisma.tenant.create({ data: { id: '94208fd1-3a68-49c5-84d6-ac27cfaa86a4', name: 'BMB Logistic GmbH', subdomain: 'bmb', planId: 'plan-pro' } });

    // Super Admins
    await prisma.user.create({ data: { email: 'office@qqxsoft.com', password: bcrypt.hashSync('Turkei.1453', 10), clerkId: 's1', role: 'SUPER_ADMIN' } });
    await prisma.user.create({ data: { email: 'admin@beispiel.at', password: bcrypt.hashSync('admin123', 10), clerkId: 's2', role: 'SUPER_ADMIN' } });

    // Customer Admins
    const cas = [
        { email: 'office@fastroute.at', password: 'Turkei.1453', tenantId: 'e5e1e871-bfc6-435c-a669-78ab76ecb195' },
        { email: 'office@aliyilmaz.gmbh', password: 'QQXSoft2026#', tenantId: '450ea163-0850-4e6e-be8d-57023b5074bb' },
        { email: 'f.rahmani@transfero.at', password: 'QQXSoft2026#', tenantId: 'd2271964-deff-40db-b2ba-e143fb3e5e67' },
        { email: 'mnkgwels@gmail.com', password: 'QQXSoft2026#', tenantId: '25310e89-f5fa-40d1-a2eb-43bcdc903297' },
        { email: 'Office@bmblogistic.at', password: 'QQXSoft2026#', tenantId: '94208fd1-3a68-49c5-84d6-ac27cfaa86a4' }
    ];

    for (const ca of cas) {
        await prisma.user.create({ data: { email: ca.email, password: bcrypt.hashSync(ca.password, 10), clerkId: `c-${ca.email}`, role: 'CUSTOMER_ADMIN', tenantId: ca.tenantId } });
    }

    // Volkan
    const vUser = await prisma.user.create({ data: { id: 'd4feda5d-f26b-4490-8f5c-9af0c19d715d', email: 'volkanmeral@msn.com', password: bcrypt.hashSync('Turkei.1453', 10), clerkId: 'd-volkan', role: 'DRIVER', tenantId: 'e5e1e871-bfc6-435c-a669-78ab76ecb195' } });
    await prisma.driver.create({ data: { id: 'bd9ac762-335c-4895-a023-bcfdcdf5f67d', userId: vUser.id, tenantId: 'e5e1e871-bfc6-435c-a669-78ab76ecb195', firstName: 'Volkan', lastName: 'Meral', phone: '+43187561456', status: 'ACTIVE' } });

    console.log('Restoration succeeded Robustly.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
