import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
    // Delete all drivers. 
    // Note: Due to foreign keys, we might need to delete related data or rely on cascades.
    // In our schema, many relations (ShiftAssignment, etc) might not be cascade.
    
    console.log("Deleting all riders/drivers...");
    
    // We'll delete Users with role DRIVER which should cascade to Drivers 
    // OR we delete Drivers directly.
    
    const drivers = await p.driver.findMany();
    console.log(`Found ${drivers.length} drivers to delete.`);
    
    // Deleting drivers 
    // To be safe, we'll delete them one by one if they have many relations, 
    // or just try deleteMany.
    
    try {
        const result = await p.driver.deleteMany();
        console.log(`Deleted ${result.count} drivers.`);
    } catch (e) {
        console.error("Error deleting multiple drivers, trying one by one...", e);
        for (const d of drivers) {
            try {
                await p.driver.delete({ where: { id: d.id } });
                console.log(`Deleted driver ${d.id}`);
            } catch (err) {
                console.error(`Failed to delete driver ${d.id}:`, err);
            }
        }
    }
}
main().catch(console.error).finally(() => p.$disconnect());
