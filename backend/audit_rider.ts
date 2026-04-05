
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const riderId = '4530788';
    
    const driver = await prisma.driver.findFirst({
        where: { driverNumber: riderId }
    });
    
    if (!driver) {
        console.log("No driver found with number " + riderId);
        // Maybe it's just a KPI record with no driver attached?
    }

    const kpis = await prisma.riderKpi.findMany({
        where: { riderId: riderId },
        include: { driver: true }
    });

    console.log("KPI Records for " + riderId + ":");
    kpis.forEach(k => {
        console.log(`- Date: ${k.dateLocal}, Orders: ${k.deliveredOrders}, KM: ${k.distanceTotal}, PayPerOrder: ${k.driver?.payPerOrder || k.driver?.orderFee || 0}, PayPerKm: ${k.driver?.payPerKm || 0}`);
    });

    if (driver) {
        console.log("\nDriver Settings:");
        console.log(`- OrderFee: ${driver.orderFee}`);
        console.log(`- PayPerOrder: ${driver.payPerOrder}`);
        console.log(`- PayPerKm: ${driver.payPerKm}`);
    }
}

main().finally(() => prisma.$disconnect());
