import { Router, Response } from 'express';
import { prisma } from '../index';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

router.get('/stats', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const [vehicleCount, driverCount, activeTimeEntries, alertCount] = await Promise.all([
            prisma.vehicle.count({ where: { tenantId } }),
            prisma.driver.count({ where: { tenantId } }),
            prisma.timeEntry.count({
                where: {
                    driver: { tenantId },
                    status: 'RUNNING'
                }
            }),
            // Mock alert count for now, maybe maintenance overdue?
            prisma.vehicle.count({
                where: {
                    tenantId,
                    nextMaintenance: { lt: new Date() }
                }
            })
        ]);

        res.json({
            vehicles: vehicleCount,
            drivers: driverCount,
            activeDrivers: activeTimeEntries,
            alerts: alertCount,
            trends: {
                vehicles: "+2.5%",
                drivers: "+1.2%",
                deliveries: "+5.4%",
                alerts: alertCount > 5 ? "Kritisch" : "Normal"
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Statistiken konnten nicht geladen werden' });
    }
});

export default router;
