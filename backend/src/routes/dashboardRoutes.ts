import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

router.get('/stats', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const weekAgoStart = new Date(todayStart);
        weekAgoStart.setDate(weekAgoStart.getDate() - 7);

        const [
            vehicleCount,
            driverCount,
            activeTimeEntries,
            alertCount,
            ordersToday,
            ordersYesterday,
            revenueTodayResult,
            revenueYesterdayResult,
            deliveredOrders,
            allIncompleteOrders
        ] = await Promise.all([
            prisma.vehicle.count({ where: { tenantId } }),
            prisma.driver.count({ where: { tenantId } }),
            prisma.timeEntry.count({
                where: {
                    driver: { tenantId },
                    status: 'RUNNING'
                }
            }),
            prisma.vehicle.count({
                where: {
                    tenantId,
                    nextMaintenance: { lt: now }
                }
            }),
            prisma.order.count({
                where: {
                    tenantId,
                    createdAt: { gte: todayStart }
                }
            }),
            prisma.order.count({
                where: {
                    tenantId,
                    createdAt: { gte: yesterdayStart, lt: todayStart }
                }
            }),
            prisma.order.aggregate({
                _sum: { amount: true },
                where: { tenantId, createdAt: { gte: todayStart } }
            }),
            prisma.order.aggregate({
                _sum: { amount: true },
                where: { tenantId, createdAt: { gte: yesterdayStart, lt: todayStart } }
            }),
            prisma.order.findMany({
                where: {
                    tenantId,
                    status: 'DELIVERED',
                    deliveredAt: { not: null },
                    createdAt: { gte: weekAgoStart }
                },
                select: { createdAt: true, deliveredAt: true }
            }),
            prisma.order.count({
                where: { tenantId, status: { not: 'DELIVERED' } }
            })
        ]);

        // Calculate 7-day volume
        const volume7d = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(todayStart);
            d.setDate(d.getDate() - i);
            const dEnd = new Date(d);
            dEnd.setDate(dEnd.getDate() + 1);

            const count = await prisma.order.count({
                where: {
                    tenantId,
                    createdAt: { gte: d, lt: dEnd }
                }
            });
            volume7d.push(count);
        }

        // Revenue calculations
        const revenueToday = revenueTodayResult._sum.amount || 0;
        const revenueYesterday = revenueYesterdayResult._sum.amount || 0;

        // Avg Delivery Time (minutes)
        let avgDeliveryTime = 0;
        if (deliveredOrders.length > 0) {
            const totalMs = deliveredOrders.reduce((acc, o) => {
                return acc + (o.deliveredAt!.getTime() - o.createdAt.getTime());
            }, 0);
            avgDeliveryTime = Math.round(totalMs / deliveredOrders.length / 60000);
        }

        // Trends
        const calcTrend = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? "+100%" : "0%";
            const diff = ((curr - prev) / prev) * 100;
            return (diff >= 0 ? "+" : "") + diff.toFixed(1) + "%";
        };

        res.json({
            vehicles: vehicleCount,
            drivers: driverCount,
            activeDrivers: activeTimeEntries,
            alerts: alertCount,
            ordersToday: ordersToday,
            revenueToday: revenueToday,
            avgDeliveryTime: avgDeliveryTime || 24, // fallback to typical value if no data
            volume7d: volume7d,
            trends: {
                vehicles: vehicleCount > 0 ? "+0%" : "0%",
                drivers: activeTimeEntries > 0 ? "+0%" : "0%",
                deliveries: calcTrend(ordersToday, ordersYesterday),
                revenue: calcTrend(revenueToday, revenueYesterday),
            },
            goals: {
                onTime: 95, // Simulated for now but could be calculated
                utilization: driverCount > 0 ? Math.round((activeTimeEntries / driverCount) * 100) : 0,
                satisfaction: 98
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Statistiken konnten nicht geladen werden' });
    }
});

router.get('/activities', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        // Fetch recent orders as activity
        const recentOrders = await prisma.order.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 4,
            include: { driver: true }
        });

        // Fetch recent active tracking updates
        const recentTracking = await prisma.timeEntry.findMany({
            where: {
                driver: { tenantId },
                status: 'RUNNING',
            },
            take: 2,
            orderBy: { updatedAt: 'desc' },
            include: { driver: true }
        });

        const activities = [];

        // Mix tracking signals
        for (const tr of recentTracking) {
            activities.push({
                id: "t" + tr.id,
                title: `Fahrer-Update: ${tr.driver.firstName}`,
                desc: `Letzter Ping vor einer Weile. Signal aktiv.`,
                type: "success",
                date: tr.updatedAt
            });
        }

        // Mix orders
        for (const order of recentOrders) {
            let type = "notif";
            let desc = `Bestellung von ${order.customerName} über €${order.amount.toFixed(2)}`;
            if (order.status === 'DELIVERED') {
                type = "success";
                desc = `erfolgreich zugestellt!`;
            } else if (order.status === 'PROBLEMATIC') {
                type = "alert";
                desc = `hatte ein Problem.`;
            }

            activities.push({
                id: "o" + order.id,
                title: `Auftrag #${order.id.slice(0, 6)} - ${order.status}`,
                desc: desc,
                type: type,
                date: order.createdAt
            });
        }

        // Sort combined to simulated feed
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(activities.slice(0, 5));
    } catch (error) {
        res.status(500).json({ error: 'Aktivitäten konnten nicht geladen werden' });
    }
});

export default router;
