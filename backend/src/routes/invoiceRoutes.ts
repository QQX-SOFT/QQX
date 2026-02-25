import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

const invoiceSchema = z.object({
    driverId: z.string(),
    amount: z.number(),
    period: z.string(),
});

// GET all invoices for a tenant
router.get('/', async (req: Request, res: Response) => {
    const subdomain = req.headers['x-tenant-subdomain'] as string;

    try {
        const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        const invoices = await prisma.invoice.findMany({
            where: { tenantId: tenant.id },
            include: { driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// POST create invoice
router.post('/', async (req: Request, res: Response) => {
    const subdomain = req.headers['x-tenant-subdomain'] as string;

    try {
        const { driverId, amount, period } = invoiceSchema.parse(req.body);
        const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        const invoice = await prisma.invoice.create({
            data: {
                amount,
                period,
                status: 'PENDING',
                driverId,
                tenantId: tenant.id,
                invoiceNumber: `INV-${Date.now()}`
            }
        });

        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

export default router;
