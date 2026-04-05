
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const driver = await prisma.driver.findFirst({
        where: {
            OR: [
                { id: '219fc062-65c5-4b7e-b807-286a993a7e31' },
                { driverNumber: '4437517' }
            ]
        }
    });
    console.log(JSON.stringify(driver, null, 2));
}

main().finally(() => prisma.$disconnect());
