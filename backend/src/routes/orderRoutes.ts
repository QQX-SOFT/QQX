import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const orderSchema = z.object({
    customerName: z.string(),
    customerPhone: z.string().optional(),
    address: z.string(),
    notes: z.string().optional(),
    amount: z.number(),
    source: z.string().default("DIRECT"),
    externalId: z.string().optional(),
});

// GET all orders for a tenant
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const orders = await prisma.order.findMany({
            where: { tenantId },
            include: { driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Bestellungen konnten nicht geladen werden' });
    }
});

// POST create order
router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const validatedData = orderSchema.parse(req.body);

        const order = await prisma.order.create({
            data: {
                ...validatedData,
                tenantId: tenantId!,
            }
        });

        res.status(201).json(order);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Bestellung konnte nicht erstellt werden' });
    }
});

// PATCH assign driver
router.patch('/:id/assign', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { driverId } = req.body;

    try {
        const order = await prisma.order.update({
            where: { id: req.params.id, tenantId },
            data: {
                driverId,
                status: 'ACCEPTED',
                assignedAt: new Date()
            }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Fahrer konnte nicht zugewiesen werden' });
    }
});

// PATCH update status
router.patch('/:id/status', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { status, deliveryPhoto, deliverySig, confirmCode } = req.body;

    try {
        const order = await prisma.order.update({
            where: { id: req.params.id, tenantId },
            data: {
                status: status,
                deliveryPhoto,
                deliverySig,
                confirmCode,
                ...(status === 'DELIVERED' && { deliveredAt: new Date() })
            }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Status konnte nicht aktualisiert werden' });
    }
});

export default router;
