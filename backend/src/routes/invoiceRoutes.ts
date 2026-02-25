import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const invoiceSchema = z.object({
    driverId: z.string(),
    amount: z.number(),
    period: z.string(),
});

// GET all invoices for a tenant
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const invoices = await prisma.invoice.findMany({
            where: { tenantId: tenantId },
            include: { driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Rechnungen' });
    }
});

// POST create invoice
router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const { driverId, amount, period } = invoiceSchema.parse(req.body);

        const invoice = await prisma.invoice.create({
            data: {
                amount,
                period,
                status: 'PENDING',
                driverId,
                tenantId: tenantId,
                invoiceNumber: `INV-${Date.now()}`
            }
        });

        res.status(201).json(invoice);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Fehler beim Erstellen der Rechnung' });
    }
});

export default router;
