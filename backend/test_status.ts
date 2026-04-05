import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
    const r = await p.driver.groupBy({ by: ['status'], _count: { status: true } });
    console.log(JSON.stringify(r, null, 2));
}
main().catch(console.error).finally(() => p.$disconnect());
