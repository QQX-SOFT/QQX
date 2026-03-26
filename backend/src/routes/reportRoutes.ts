import express, { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

// GET report for a driver in a date range
router.get('/driver/:id', async (req: TenantRequest, res: Response) => {
    const { start, end } = req.query;
    const { tenantId } = req;

    if (!start || !end) {
        return res.status(400).json({ error: 'Bezugszeitraum fehlt (start/end)' });
    }

    try {
        const [entries, completedOrders] = await Promise.all([
            prisma.timeEntry.findMany({
                where: {
                    driverId: req.params.id,
                    driver: { tenantId: tenantId },
                    startTime: {
                        gte: new Date(start as string),
                        lte: new Date(end as string)
                    },
                    status: 'COMPLETED'
                },
                orderBy: { startTime: 'asc' }
            }),
            prisma.order.findMany({
                where: {
                    driverId: req.params.id,
                    status: 'DELIVERED',
                    deliveredAt: {
                        gte: new Date(start as string),
                        lte: new Date(end as string)
                    }
                },
                select: {
                    amount: true,
                    deliveredAt: true
                }
            })
        ]);

        // Group orders by date string for easy lookup: { "23.03.2026": 120.50 }
        const dailyEarnings: { [key: string]: number } = {};
        let totalEarnings = 0;

        completedOrders.forEach((o: any) => {
            if (o.deliveredAt) {
                const dateStr = o.deliveredAt.toLocaleDateString('de-DE');
                dailyEarnings[dateStr] = (dailyEarnings[dateStr] || 0) + o.amount;
                totalEarnings += o.amount;
            }
        });

        // Simple aggregation
        let totalMinutes = 0;
        const reportData = entries.map((entry: any) => {
            const durationMs = entry.endTime!.getTime() - entry.startTime.getTime();
            const mins = Math.max(0, Math.floor(durationMs / 60000) - entry.pauseDuration);
            totalMinutes += mins;
            
            const dateStr = entry.startTime.toLocaleDateString('de-DE');

            return {
                date: dateStr,
                startTime: entry.startTime.toLocaleTimeString('de-DE'),
                endTime: entry.endTime!.toLocaleTimeString('de-DE'),
                durationMinutes: mins,
                pauseMinutes: entry.pauseDuration,
                earnings: dailyEarnings[dateStr] || 0
            };
        });

        res.json({
            summary: {
                totalHours: (totalMinutes / 60).toFixed(2),
                totalDays: entries.length,
                totalEarnings: totalEarnings.toFixed(2),
                period: `${new Date(start as string).toLocaleDateString('de-DE')} - ${new Date(end as string).toLocaleDateString('de-DE')}`
            },
            entries: reportData
        });

    } catch (error) {
        res.status(500).json({ error: 'Bericht konnte nicht generiert werden' });
    }
});

export default router;
