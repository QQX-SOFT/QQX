import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://qqx_admin:PJ4XgAYRjKnO0WEJsSvnPMVHatM1lA5E@dpg-d6fgqnjuibrs73ens5fg-a.frankfurt-postgres.render.com/qqx"
    }
  }
});

async function main() {
  console.log('Starting data dump from Render...');
  const data: any = {};

  // List of models to dump
  const models = [
    'tenant', 'user', 'driver', 'document', 'vehicle', 'timeEntry', 
    'order', 'complaint', 'invoice', 'payout', 'walletHistory', 
    'rating', 'report', 'location', 'plan', 'feature', 'planFeature', 
    'subscription', 'auditLog', 'supportTicket', 'customer', 
    'contract', 'contractTemplate', 'saasInvoice', 'message'
  ];

  for (const model of models) {
    try {
      console.log(`Dumping ${model}...`);
      const records = await (prisma as any)[model].findMany();
      data[model] = records;
      console.log(`Dumped ${records.length} records from ${model}.`);
    } catch (error) {
      console.error(`Error dumping ${model}:`, error);
    }
  }

  const outputPath = path.join(__dirname, 'render_dump.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\nData dump complete! Saved to ${outputPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
