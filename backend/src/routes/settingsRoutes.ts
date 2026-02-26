import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

// GET tenant settings
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        res.json({
            name: tenant.name,
            subdomain: tenant.subdomain,
            createdAt: tenant.createdAt,
            // Configuration settings
            notificationsEnabled: tenant.notificationsEnabled,
            autoAssignDrivers: tenant.autoAssignDrivers,
            currency: tenant.currency,
            timezone: tenant.timezone
        });
    } catch (error) {
        res.status(500).json({ error: 'Einstellungen konnten nicht geladen werden' });
    }
});

// PATCH update tenant
router.patch('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { name, notificationsEnabled, autoAssignDrivers } = req.body;

    try {
        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: name !== undefined ? name : undefined,
                notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : undefined,
                autoAssignDrivers: autoAssignDrivers !== undefined ? autoAssignDrivers : undefined,
            }
        });
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: 'Einstellungen konnten nicht aktualisiert werden' });
    }
});

export default router;
