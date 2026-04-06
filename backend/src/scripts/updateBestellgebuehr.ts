import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();
const EXCEL_PATH = 'c:\\Users\\IT Admin\\Downloads\\QQX\\Mitarbeiter Datenbank (4).xlsx';
const FASTROUTE_TENANT_ID = 'e5e1e871-bfc6-435c-a669-78ab76ecb195';

async function main() {
    console.log("Starting Bestellgebühr Update... 🚀");
    
    try {
        const workbook = XLSX.readFile(EXCEL_PATH);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length < 2) {
            console.log("No data found in Excel.");
            return;
        }

        const headers = data[0];
        const riderIdIndex = 2; // Column C
        const bestellgebuehrIndex = 22; // Column W

        console.log(`Processing ${data.length - 1} rows...`);

        let updatedCount = 0;
        let notFoundCount = 0;
        let skipCount = 0;

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const rawRiderId = row[riderIdIndex];
            const rawFee = row[bestellgebuehrIndex];

            if (!rawRiderId) {
                skipCount++;
                continue;
            }

            const riderIdStr = rawRiderId.toString().trim();
            const idParts = riderIdStr.split(/[-,\s]+/).filter((id: string) => id.trim().length > 0);
            const driverNumber = idParts.length > 0 ? idParts[0] : null;

            if (!driverNumber) {
                skipCount++;
                continue;
            }

            const orderFeeStr = (rawFee?.toString() || "0").replace(',', '.');
            const orderFee = parseFloat(orderFeeStr);

            if (isNaN(orderFee) || orderFee === 0) {
                skipCount++;
                continue;
            }

            // Find driver by driverNumber and tenantId
            const driver = await prisma.driver.findFirst({
                where: {
                    driverNumber: driverNumber,
                    tenantId: FASTROUTE_TENANT_ID
                }
            });

            if (driver) {
                await prisma.driver.update({
                    where: { id: driver.id },
                    data: { orderFee: orderFee }
                });
                updatedCount++;
                if (updatedCount % 20 === 0) console.log(`Progress: ${updatedCount} drivers updated...`);
            } else {
                notFoundCount++;
                // console.log(`Driver not found: ${driverNumber}`);
            }
        }

        console.log(`\nUpdate Completed! ✅`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Not Found: ${notFoundCount}`);
        console.log(`Skipped (0 or Empty): ${skipCount}`);

    } catch (error) {
        console.error("Error during update:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
