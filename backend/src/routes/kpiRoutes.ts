import { Router, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import prisma from '../lib/prisma';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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

        await prisma.$transaction(async (tx) => {
            for (const row of data) {
                // Normalize keys to lowercase for easier matching
                const normalizedRow: any = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[String(key).toLowerCase().replace(/[^a-z0-9]/g, '_')] = row[key];
                });

                // Pick values based on various possible column names
                const riderId = String(normalizedRow['rider_id'] || normalizedRow['id'] || '');
                const riderName = String(normalizedRow['rider_name'] || normalizedRow['name'] || '');
                const delivered = Number(normalizedRow['actual_delivered_orders'] || normalizedRow['delivered_orders'] || normalizedRow['orders'] || 0);
                const total = Number(normalizedRow['total_orders'] || 0);
                const hours = Number(normalizedRow['hours_worked'] || normalizedRow['online_hours'] || normalizedRow['hours'] || 0);
                const week = Number(normalizedRow['isoweek'] || normalizedRow['week'] || 0);
                
                if (week > 0) mainIsoweek = week;
                if (!riderId && !riderName) continue;

                // Try to find driver by driverNumber first (requested by user previously)
                let driver = null;
                if (riderId) {
                    driver = await tx.driver.findFirst({
                        where: {
                            tenantId: req.tenantId!,
                            driverNumber: riderId
                        }
                    });
                }

                // Fallback to fuzzy name matching if not found by ID
                if (!driver && riderName) {
                    const nameParts = riderName.split(' ');
                    const lastName = nameParts[nameParts.length - 1];
                    driver = await tx.driver.findFirst({
                        where: {
                            tenantId: req.tenantId!,
                            OR: [
                                { lastName: { contains: lastName, mode: 'insensitive' } },
                                { firstName: { contains: nameParts[0], mode: 'insensitive' } }
                            ]
                        }
                    });
                }

                // Ensure riderId is not null for the unique constraint
                const finalRiderId = riderId || `unknown-${Date.now()}-${recordCount}`;

                await tx.riderKpi.upsert({
                    where: {
                        tenantId_riderId_isoweek: {
                            tenantId: req.tenantId!,
                            riderId: finalRiderId,
                            isoweek: week
                        }
                    },
                    create: {
                        tenantId: req.tenantId!,
                        riderId: finalRiderId,
                        riderName,
                        deliveredOrders: delivered,
                        totalOrders: total || delivered,
                        hoursWorked: hours,
                        isoweek: week,
                        driverId: driver?.id,
                        acceptanceRate: parseFloat(normalizedRow['acceptance_rate_'] || normalizedRow['acceptance_rate'] || 0),
                        utr: parseFloat(normalizedRow['utr'] || (hours > 0 ? delivered / hours : 0)),
                        avgDeliveryTime: parseFloat(normalizedRow['avg_delivery_time_mins'] || normalizedRow['avg_delivery_time'] || 0),
                    },
                    update: {
                        deliveredOrders: delivered,
                        totalOrders: total || delivered,
                        hoursWorked: hours,
                        driverId: driver?.id ?? undefined,
                        riderName,
                        acceptanceRate: parseFloat(normalizedRow['acceptance_rate_'] || normalizedRow['acceptance_rate'] || 0),
                        utr: parseFloat(normalizedRow['utr'] || (hours > 0 ? delivered / hours : 0)),
                        avgDeliveryTime: parseFloat(normalizedRow['avg_delivery_time_mins'] || normalizedRow['avg_delivery_time'] || 0),
                    }
                });
                recordCount++;
            }

            console.log(`[KPI-Upload] Upserted ${recordCount} KPIs. Main ISO Week: ${mainIsoweek}`);

            await tx.kpiUpload.create({
                data: {
                    tenantId: req.tenantId!,
                    filename: req.file!.originalname,
                    isoweek: mainIsoweek,
                    recordCount,
                    status: 'SUCCESS'
                }
            });
        });

        res.json({ success: true, recordCount, isoweek: mainIsoweek });
    } catch (error) {
        console.error('[KPI-Upload] Error:', error);
        res.status(500).json({ error: 'Failed to process excel: ' + (error as Error).message });
    }
});

router.get('/', async (req: TenantRequest, res: Response) => {
    const { week } = req.query;
    try {
        const kpis = await prisma.riderKpi.findMany({
            where: {
                tenantId: req.tenantId!,
                ...(week ? { isoweek: Number(week) } : {})
            },
            include: {
                driver: true
            },
            orderBy: {
                deliveredOrders: 'desc'
            }
        });
        res.json(kpis);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
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
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
