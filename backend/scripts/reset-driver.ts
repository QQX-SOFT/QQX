import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'volkanmeral@msn.com';
  const newPassword = '123'; // Basit bir test sifresi
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } }
  });

  if (!user) {
    console.error(`User ${email} not found!`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  console.log(`--- PASSWORD RESET SUCCESS ---`);
  console.log(`Email: ${email}`);
  console.log(`New Password: ${newPassword}`);
  console.log(`Hashed: true`);
  console.log('------------------------------');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
