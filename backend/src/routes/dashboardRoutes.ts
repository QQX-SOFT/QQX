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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [vehicleCount, driverCount, activeTimeEntries, alertCount, ordersToday] = await Promise.all([
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
                    nextMaintenance: { lt: new Date() }
                }
            }),
            prisma.order.count({
                where: {
                    tenantId,
                    createdAt: { gte: today }
                }
            })
        ]);
        res.json({
            vehicles: vehicleCount,
            drivers: driverCount,
            activeDrivers: activeTimeEntries,
            alerts: alertCount,
            ordersToday: ordersToday,
            trends: {
                vehicles: vehicleCount > 0 ? "+2.5%" : "0%",
                drivers: activeTimeEntries > 0 ? "+1.2%" : "0%",
                deliveries: ordersToday > 0 ? "+5.4%" : "0%",
                alerts: alertCount > 5 ? "Kritisch" : alertCount > 0 ? "Normal" : "Keine"
            }
        });
    } catch (error) {
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
