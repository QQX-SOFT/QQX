import { Router, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import prisma from '../lib/prisma';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req: TenantRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        if (!req.tenantId) return res.status(401).json({ error: 'Tenant context missing' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data: any[] = XLSX.utils.sheet_to_json(sheet);

        let recordCount = 0;
        let mainIsoweek = 0;

        await prisma.$transaction(async (tx) => {
            for (const row of data) {
                const riderId = String(row['rider_id'] || '');
                const riderName = String(row['rider_name'] || '');
                const delivered = Number(row['actual_delivered_orders'] || row['total_delivered_orders'] || 0);
                const total = Number(row['total_orders'] || 0);
                const hours = Number(row['hours_worked'] || 0);
                const week = Number(row['isoweek'] || 0);
                
                if (week > 0) mainIsoweek = week;
                if (!riderName && !riderId) continue;

                const nameParts = riderName.split(' ');
                const lastName = nameParts[nameParts.length - 1];

                const driver = await tx.driver.findFirst({
                    where: {
                        tenantId: req.tenantId!,
                        OR: [
                            { lastName: { contains: lastName, mode: 'insensitive' } },
                            { firstName: { contains: nameParts[0], mode: 'insensitive' } }
                        ]
                    }
                });

                await tx.riderKpi.upsert({
                    where: {
                        tenantId_riderId_isoweek: {
                            tenantId: req.tenantId!,
                            riderId,
                            isoweek: week
                        }
                    },
                    create: {
                        tenantId: req.tenantId!,
                        riderId,
                        riderName,
                        deliveredOrders: delivered,
                        totalOrders: total,
                        hoursWorked: hours,
                        isoweek: week,
                        driverId: driver?.id,
                        acceptanceRate: parseFloat(row['acceptance_rate_%'] || 0),
                        utr: parseFloat(row['UTR'] || 0),
                        avgDeliveryTime: parseFloat(row['avg_delivery_time_mins'] || 0),
                    },
                    update: {
                        deliveredOrders: delivered,
                        totalOrders: total,
                        hoursWorked: hours,
                        driverId: driver?.id ?? undefined,
                        riderName,
                        acceptanceRate: parseFloat(row['acceptance_rate_%'] || 0),
                        utr: parseFloat(row['UTR'] || 0),
                        avgDeliveryTime: parseFloat(row['avg_delivery_time_mins'] || 0),
                    }
                });
                recordCount++;
            }

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
        console.error(error);
        res.status(500).json({ error: 'Failed to process excel' });
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
