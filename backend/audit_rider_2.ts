
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const riderId = '4530788';
    const kpi = await prisma.riderKpi.findFirst({
        where: { riderId: riderId }
    });
    
    if (kpi) {
        console.log("Found record for 4530788:");
        console.log("- deliveredOrders: " + kpi.deliveredOrders);
        console.log("- totalOrders: " + kpi.totalOrders);
        console.log("- isoweek: " + kpi.isoweek);
        console.log("- dateLocal: " + kpi.dateLocal);
    } else {
        console.log("No record found for 4530788");
    }
}

main().finally(() => prisma.$disconnect());
