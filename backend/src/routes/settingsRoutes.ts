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
            // Austrian Requirements
            address: tenant.address,
            zipCode: tenant.zipCode,
            city: tenant.city,
            country: tenant.country,
            uidNumber: tenant.uidNumber,
            companyRegister: tenant.companyRegister,
            legalForm: tenant.legalForm,
            commercialCourt: tenant.commercialCourt,
        });
    } catch (error) {
        res.status(500).json({ error: 'Einstellungen konnten nicht geladen werden' });
    }
});

// PATCH update tenant
router.patch('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const {
        name,
        address,
        zipCode,
        city,
        uidNumber,
        companyRegister,
        legalForm,
        commercialCourt
    } = req.body;

    try {
        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: name !== undefined ? name : undefined,
                address: address !== undefined ? address : undefined,
                zipCode: zipCode !== undefined ? zipCode : undefined,
                city: city !== undefined ? city : undefined,
                uidNumber: uidNumber !== undefined ? uidNumber : undefined,
                companyRegister: companyRegister !== undefined ? companyRegister : undefined,
                legalForm: legalForm !== undefined ? legalForm : undefined,
                commercialCourt: commercialCourt !== undefined ? commercialCourt : undefined,
            }
        });
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: 'Einstellungen konnten nicht aktualisiert werden' });
    }
});

export default router;
