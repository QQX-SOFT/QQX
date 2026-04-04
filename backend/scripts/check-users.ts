import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      password: true,
      tenant: {
        select: {
          subdomain: true
        }
      }
    }
  });

  console.log('--- USER DATA ---');
  users.forEach(u => {
    const isHashed = u.password?.startsWith('$2') || false;
    console.log(`Email: ${u.email}`);
    console.log(`Role: ${u.role}`);
    console.log(`Subdomain: ${u.tenant?.subdomain || 'NONE'}`);
    console.log(`Password Hashed: ${isHashed}`);
    console.log('---');
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
