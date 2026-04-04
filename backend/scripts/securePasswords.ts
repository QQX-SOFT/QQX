import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function secureTable(tableName: 'user' | 'customer') {
  console.log(`\n--- Securing ${tableName} table ---`);
  
  // Fetch all records with a password
  const records = await (prisma as any)[tableName].findMany({
    where: {
      password: { not: null }
    }
  });

  console.log(`Found ${records.length} records in ${tableName} table.`);

  let updatedCount = 0;

  for (const record of records) {
    const password = record.password as string;

    // Check if it's already a bcrypt hash (starts with $2a$ or $2b$)
    const isAlreadyHashed = password.startsWith('$2a$') || password.startsWith('$2b$');

    if (!isAlreadyHashed && password.length > 0) {
      console.log(`Hashing password for: ${record.email || record.id}`);
      
      const hashedPassword = bcrypt.hashSync(password, 10);

      await (prisma as any)[tableName].update({
        where: { id: record.id },
        data: { password: hashedPassword }
      });

      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} ${tableName} records.`);
}

async function main() {
  try {
    await secureTable('user');
    await secureTable('customer');
    console.log('\nAll passwords are now SECURED and HASHED.');
  } catch (error) {
    console.error('Error during password security migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
