import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log("Total Orders Count:", await prisma.order.count());
}
main().finally(() => prisma.$disconnect());
