import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const drivers = await prisma.driver.findMany({ take: 10 });
    console.log(drivers.map(d => `${d.firstName} ${d.lastName}`));
}
main().finally(() => prisma.$disconnect());
