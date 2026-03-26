import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://c37d970a03b68bc52327d45254b74cc5e9625cad5be956ab00e632920519c120:sk_-rmFdh-rbLhc2S9Xg2BZY@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function main() {
  console.log('Starting data restore to Vercel/Prisma Data Platform...');
  const dumpPath = path.join(__dirname, 'render_dump.json');
  if (!fs.existsSync(dumpPath)) {
    console.error('No dump file found at', dumpPath);
    return;
  }

  const data = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

  // Define insertion order to respect foreign key constraints
  const orderedModels = [
    'plan', 'feature', 'planFeature', 'tenant', 'user', 'driver', 
    'customer', 'location', 'vehicle', 'order', 'timeEntry', 
    'complaint', 'invoice', 'payout', 'walletHistory', 'rating', 
    'report', 'subscription', 'auditLog', 'supportTicket', 
    'contractTemplate', 'contract', 'saaSInvoice', 'message'
  ];

  for (const modelKey of orderedModels) {
    const rawModelKey = modelKey === 'saaSInvoice' ? 'saasInvoice' : modelKey;
    const records = data[rawModelKey] || [];
    if (records.length === 0) {
      console.log(`Skipping ${modelKey} (no data).`);
      continue;
    }

    console.log(`Restoring ${records.length} records to ${modelKey}...`);
    
    // We use createMany for speed if possible, otherwise iterate
    try {
      // Need to handle Date strings from JSON
      const formattedRecords = records.map((r: any) => {
        const nr: any = { ...r };
        for (const k in nr) {
          if (typeof nr[k] === 'string' && nr[k].match(/^\d{4}-\d{2}-\d{2}T/)) {
            nr[k] = new Date(nr[k]);
          }
        }
        return nr;
      });

      // Break into chunks to prevent payload size issues
      const chunkSize = 50;
      for (let i = 0; i < formattedRecords.length; i += chunkSize) {
        const chunk = formattedRecords.slice(i, i + chunkSize);
        await (prisma as any)[modelKey].createMany({
          data: chunk,
          skipDuplicates: true,
        });
      }
      console.log(`Successfully restored ${modelKey}.`);
    } catch (error) {
      console.error(`Error restoring ${modelKey}:`, error);
    }
  }

  console.log('\nData restoration complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
