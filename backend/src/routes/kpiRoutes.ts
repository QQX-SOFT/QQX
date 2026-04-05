import { Router, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const safeFloat = (val: any) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(',', '.').replace(/[^0-9.]/g, '');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
};

const safeInt = (val: any) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return Math.round(val);
    const clean = String(val).replace(/[^0-9]/g, '');
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? 0 : parsed;
};

const safeDate = (val: any) => {
    if (!val) return null;
    try {
        if (typeof val === 'number') {
            return new Date(Math.round((val - 25569) * 86400 * 1000));
        }
        const d = new Date(val);
        if (isNaN(d.getTime())) return null;
        return d;
    } catch {
        return null;
    }
};

router.post('/upload', upload.single('file'), async (req: TenantRequest, res: Response) => {
    console.log(`[KPI-Upload] Received file: ${req.file?.originalname} for tenant: ${req.tenantId}`);
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        if (!req.tenantId) return res.status(401).json({ error: 'Tenant context missing' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data: any[] = XLSX.utils.sheet_to_json(sheet);

        console.log(`[KPI-Upload] Read ${data.length} rows from sheet: ${sheetName}`);

        let recordCount = 0;
        let mainIsoweek = 0;

        // Create the upload record FIRST to get its ID
        const uploadRecord = await prisma.kpiUpload.create({
            data: {
                tenantId: req.tenantId!,
                filename: req.file!.originalname,
                isoweek: mainIsoweek,
                recordCount: 0, // Will update after loop
                status: 'PROCESSING'
            }
        });

        // Optimized: Fetch all drivers for this tenant once to match in-memory
        const allDrivers = await prisma.driver.findMany({
            where: { tenantId: req.tenantId! },
            select: { id: true, driverNumber: true, secondaryDriverNumber: true, firstName: true, lastName: true }
        });

        // Process rows individually to avoid long-running transaction timeouts
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Normalize keys
                const normalizedRow: any = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[String(key).toLowerCase().replace(/[^a-z0-9]/g, '_')] = row[key];
                });

                // Flexible Column Mapping
                const riderId = String(
                    normalizedRow['rider_id'] || 
                    normalizedRow['id'] || 
                    normalizedRow['fahrer_nr'] || 
                    normalizedRow['riderid'] || 
                    normalizedRow['id_rider'] || ''
                ).trim();

                const riderName = String(
                    normalizedRow['rider_name'] || 
                    normalizedRow['name'] || 
                    normalizedRow['fahrer_name'] || 
                    normalizedRow['full_name'] || ''
                ).trim();

                const delivered = safeInt(
                    normalizedRow['actual_delivered_orders'] || 
                    normalizedRow['completed_orders'] || 
                    normalizedRow['delivered_orders'] || 
                    normalizedRow['orders'] || 
                    normalizedRow['zustellungen'] || 
                    normalizedRow['bestellungen']
                );

                const total = safeInt(normalizedRow['total_orders'] || normalizedRow['total'] || delivered);
                
                const hours = safeFloat(
                    normalizedRow['hours_worked'] || 
                    normalizedRow['online_hours'] || 
                    normalizedRow['hours'] || 
                    normalizedRow['stunden'] || 
                    normalizedRow['arbeitszeit']
                );

                const week = safeInt(
                    normalizedRow['isoweek'] || 
                    normalizedRow['week'] || 
                    normalizedRow['kw'] || 
                    normalizedRow['kalenderwoche']
                );
                
                if (week > 0 && !mainIsoweek) mainIsoweek = week;

                const cityName = String(normalizedRow['city_name'] || normalizedRow['city'] || normalizedRow['stadt'] || '').trim();
                const dateLocal = safeDate(normalizedRow['created_date_local'] || normalizedRow['date'] || normalizedRow['datum']);

                if (!riderId && !riderName) continue;

                // IN-MEMORY LOOKUP (Extremely fast)
                let driver = null;
                if (riderId) {
                    driver = allDrivers.find(d => 
                        d.driverNumber === riderId || 
                        d.secondaryDriverNumber === riderId
                    );
                }

                if (!driver && riderName) {
                    const nameParts = riderName.split(' ');
                    const lastName = (nameParts[nameParts.length - 1] || '').toLowerCase();
                    const firstName = (nameParts[0] || '').toLowerCase();
                    
                    driver = allDrivers.find(d => 
                        (d.lastName?.toLowerCase().includes(lastName)) ||
                        (d.firstName?.toLowerCase().includes(firstName))
                    );
                }

                const finalRiderId = riderId || `anon-${Date.now()}-${i}`;
                
                const uniqueDate = dateLocal || new Date(2000, 0, week); 

                await (prisma as any).riderKpi.upsert({
                    where: {
                        tenantId_riderId_isoweek_dateLocal: {
                            tenantId: req.tenantId!,
                            riderId: finalRiderId,
                            isoweek: week,
                            dateLocal: uniqueDate
                        }
                    },
                    create: {
                        tenantId: req.tenantId!,
                        riderId: finalRiderId,
                        riderName,
                        deliveredOrders: delivered,
                        totalOrders: total,
                        hoursWorked: hours,
                        isoweek: week,
                        cityName,
                        dateLocal: uniqueDate,
                        uploadId: uploadRecord.id,
                        driverId: driver?.id,
                        acceptanceRate: safeFloat(normalizedRow['acceptance_rate_'] || normalizedRow['acceptance_rate'] || normalizedRow['akzeptanz']),
                        utr: safeFloat(normalizedRow['utr'] || (hours > 0 ? delivered / hours : 0)),
                        avgDeliveryTime: safeFloat(normalizedRow['avg_delivery_time_mins'] || normalizedRow['avg_delivery_time'] || normalizedRow['avg_delivery']),
                    },
                    update: {
                        deliveredOrders: delivered,
                        totalOrders: total,
                        hoursWorked: hours,
                        driverId: driver?.id ?? undefined,
                        riderName,
                        cityName,
                        dateLocal: uniqueDate,
                        uploadId: uploadRecord.id,
                        acceptanceRate: safeFloat(normalizedRow['acceptance_rate_'] || normalizedRow['acceptance_rate'] || normalizedRow['akzeptanz']),
                        utr: safeFloat(normalizedRow['utr'] || (hours > 0 ? delivered / hours : 0)),
                        avgDeliveryTime: safeFloat(normalizedRow['avg_delivery_time_mins'] || normalizedRow['avg_delivery_time'] || normalizedRow['avg_delivery']),
                    }
                });
                recordCount++;
            } catch (rowError) {
                console.error(`[KPI-Upload] Error in row ${i + 1}:`, rowError);
                throw new Error(`Fehler in Zeile ${i + 1} der Excel-Datei: ${(rowError as Error).message}`);
            }
        }

        console.log(`[KPI-Upload] Upserted ${recordCount} KPIs. Main ISO Week: ${mainIsoweek}`);

        // Update the upload record with final count
        await prisma.kpiUpload.update({
            where: { id: uploadRecord.id },
            data: {
                recordCount,
                isoweek: mainIsoweek,
                status: 'SUCCESS'
            }
        });

        res.json({ success: true, recordCount, isoweek: mainIsoweek });
    } catch (error) {
        console.error('[KPI-Upload] Final Error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

router.delete('/uploads/:id', async (req: TenantRequest, res: Response) => {
    try {
        await prisma.kpiUpload.delete({
            where: { id: req.params.id, tenantId: req.tenantId! }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

router.delete('/clear', async (req: TenantRequest, res: Response) => {
    try {
        await prisma.riderKpi.deleteMany({
            where: { tenantId: req.tenantId! }
        });
        await prisma.kpiUpload.deleteMany({
            where: { tenantId: req.tenantId! }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to clear data' });
    }
});

router.post('/validate', upload.single('file'), async (req: TenantRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        if (!req.tenantId) return res.status(401).json({ error: 'Tenant context missing' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(sheet);

        const results = [];

        for (const row of data) {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
                normalizedRow[String(key).toLowerCase().replace(/[^a-z0-9]/g, '_')] = row[key];
            });

            const riderId = String(normalizedRow['rider_id'] || normalizedRow['id'] || normalizedRow['fahrer_nr'] || normalizedRow['riderid'] || '').trim();
            const riderName = String(normalizedRow['rider_name'] || normalizedRow['name'] || normalizedRow['fahrer_name'] || '').trim();

            let driver = null;
            let matchType = 'NONE';

            if (riderId) {
                driver = await prisma.driver.findFirst({
                    where: { tenantId: req.tenantId!, driverNumber: riderId },
                    select: { id: true, firstName: true, lastName: true, driverNumber: true }
                });
                if (driver) matchType = 'PRIMARY_ID';
                
                if (!driver) {
                    driver = await prisma.driver.findFirst({
                        where: { tenantId: req.tenantId!, secondaryDriverNumber: riderId },
                        select: { id: true, firstName: true, lastName: true, driverNumber: true, secondaryDriverNumber: true }
                    });
                    if (driver) matchType = 'SECONDARY_ID';
                }
            }

            if (!driver && riderName) {
                const nameParts = riderName.split(' ');
                const lastName = nameParts[nameParts.length - 1];
                driver = await prisma.driver.findFirst({
                    where: {
                        tenantId: req.tenantId!,
                        OR: [
                            { lastName: { contains: lastName, mode: 'insensitive' } },
                            { firstName: { contains: nameParts[0], mode: 'insensitive' } }
                        ]
                    },
                    select: { id: true, firstName: true, lastName: true, driverNumber: true }
                });
                if (driver) matchType = 'FUZZY_NAME';
            }

            const cityName = String(normalizedRow['city_name'] || normalizedRow['city'] || normalizedRow['stadt'] || '').trim();
            const dateLocal = safeDate(normalizedRow['created_date_local'] || normalizedRow['date'] || normalizedRow['datum']);

            results.push({
                excelRow: row,
                riderId,
                riderName,
                cityName,
                dateLocal,
                matchType,
                matchedDriver: driver ? `${driver.firstName} ${driver.lastName} (#${driver.driverNumber})` : null
            });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/', async (req: TenantRequest, res: Response) => {
    const { week, month, year } = req.query;
    try {
        const where: any = { tenantId: req.tenantId! };
        
        if (week) where.isoweek = Number(week);
        
        if (month && year) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 1);
            where.dateLocal = {
                gte: startDate,
                lt: endDate
            };
        }

        const kpis = await prisma.riderKpi.findMany({
            where,
            include: {
                driver: true
            },
            orderBy: {
                deliveredOrders: 'desc'
            }
        });
        res.json(kpis);
    } catch (e) {
        console.error("[KPI-List] Error:", e);
        res.status(500).json({ error: (e as Error).message });
    }
});

router.get('/uploads', async (req: TenantRequest, res: Response) => {
    try {
        const uploads = await prisma.kpiUpload.findMany({
            where: { tenantId: req.tenantId! },
            orderBy: { createdAt: 'desc' }
        });
        res.json(uploads);
    } catch (e) {
        console.error("[KPI-Uploads-List] Error:", e);
        res.status(500).json({ error: (e as Error).message });
    }
});

export default router;
