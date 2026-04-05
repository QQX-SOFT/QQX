import express, { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
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
            allIncompleteOrders,
            onTimeOrders,
            totalRatings
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
            }),
            // On-time deliveries (delivered within 60 min)
            prisma.order.count({
                where: {
                    tenantId,
                    status: 'DELIVERED',
                    deliveredAt: { not: null },
                }
            }),
            // Avg rating / satisfaction
            prisma.rating.aggregate({
                _avg: { stars: true },
                _count: { stars: true },
                where: { driver: { tenantId } }
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
            avgDeliveryTime: avgDeliveryTime,
            volume7d: volume7d,
            trends: {
                vehicles: vehicleCount > 0 ? "+0%" : "0%",
                drivers: activeTimeEntries > 0 ? "+0%" : "0%",
                deliveries: calcTrend(ordersToday, ordersYesterday),
                revenue: calcTrend(revenueToday, revenueYesterday),
            },
            goals: {
                onTime: deliveredOrders.length > 0
                    ? Math.round((onTimeOrders / (onTimeOrders + allIncompleteOrders)) * 100) || 0
                    : 0,
                utilization: driverCount > 0 ? Math.round((activeTimeEntries / driverCount) * 100) : 0,
                satisfaction: totalRatings._count.stars > 0
                    ? Math.round((totalRatings._avg.stars || 0) * 20) // Convert 1-5 scale to percentage
                    : 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Statistiken konnten nicht geladen werden' });
    }
});

router.get('/alerts', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const now = new Date();
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(now.getDate() + 14);

        // Expiring work permits
        const expiringPermits = await prisma.driver.findMany({
            where: {
                tenantId,
                workPermitUntil: {
                    not: null,
                    lt: twoWeeksFromNow
                }
            },
            select: { id: true, firstName: true, lastName: true, workPermitUntil: true }
        });

        const maintenanceDue = await prisma.vehicle.findMany({
            where: {
                tenantId,
                nextMaintenance: {
                    not: null,
                    lt: now
                }
            },
            select: { id: true, licensePlate: true, make: true, model: true }
        });

        const alerts = [];

        for (const permit of expiringPermits) {
            const daysLeft = Math.ceil((permit.workPermitUntil!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            alerts.push({
                id: "permit-" + permit.id,
                title: `Arbeitsbewilligung läuft ab: ${permit.firstName} ${permit.lastName}`,
                message: daysLeft < 0 ? "Bereits abgelaufen!" : `Läuft in ${daysLeft} Tagen ab (${permit.workPermitUntil!.toLocaleDateString("de-DE")}).`,
                type: daysLeft < 0 ? "CRITICAL" : (daysLeft < 7 ? "HIGH" : "WARNING"),
                link: `/admin/drivers/editor?id=${permit.id}`
            });
        }

        for (const v of maintenanceDue) {
            alerts.push({
                id: "maintenace-" + v.id,
                title: `Wartung fällig: ${v.licensePlate}`,
                message: `Die Wartung für dieses Fahrzeug ist überfällig.`,
                type: "WARNING",
                link: "/admin/vehicles"
            });
        }

        res.json(alerts);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Fehler beim Laden der Warnmeldungen' });
    }
});

router.get('/activities', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const expiringDrivers = await prisma.driver.findMany({
            where: {
                tenantId,
                OR: [
                    { visaExpiry: { not: null, lt: thirtyDaysFromNow } },
                    { workPermitUntil: { not: null, lt: thirtyDaysFromNow } }
                ]
            },
            take: 10,
            orderBy: [{ visaExpiry: 'asc' }, { workPermitUntil: 'asc' }]
        });

        const activities = expiringDrivers.map(driver => {
            const visaExp = driver.visaExpiry;
            const permitExp = driver.workPermitUntil;
            const closestExp = (visaExp && permitExp) ? (visaExp < permitExp ? visaExp : permitExp) : (visaExp || permitExp);
            const daysLeft = closestExp ? Math.ceil((closestExp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const isVisa = closestExp === visaExp;

            return {
                id: driver.id,
                title: `${driver.firstName} ${driver.lastName}`,
                desc: `${isVisa ? 'Visum' : 'Arbeitspapiere'} ${daysLeft < 0 ? 'Abgelaufen!' : `läuft in ${daysLeft} Tagen ab`}`,
                type: daysLeft < 0 ? "alert" : (daysLeft < 7 ? "alert" : "notif"),
                date: closestExp
            };
        });

        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Visa-Daten konnten nicht geladen werden' });
    }
});

export default router;
