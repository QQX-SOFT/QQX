import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';
import { getDistanceMatrix } from '../services/googleMaps';

const router = Router();

const orderSchema = z.object({
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    amount: z.number().optional().default(0),
    source: z.string().default("DIRECT"),
    externalId: z.string().optional(),
    // New Fields
    senderName: z.string().optional(),
    senderAddress: z.string().optional(),
    recipientName: z.string().optional(),
    recipientAddress: z.string().optional(),
    packageInfo: z.string().optional(),
    serviceType: z.string().optional(),
    priority: z.string().optional(),
    driverId: z.string().optional(),
    customerId: z.string().optional(),
});

// GET quote based on distance
router.get('/quote', async (req: TenantRequest, res: Response) => {
    const { origin, destination } = req.query as any;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required' });
    }

    try {
        const matrix = await getDistanceMatrix(origin as string, destination as string);

        // Simple pricing logic (could be fetched from tenant settings in future)
        const basePrice = 12.00;
        const perKmPrice = 0.85;
        const totalPrice = basePrice + (matrix.distanceKm * perKmPrice);

        res.json({
            ...matrix,
            price: Math.max(15.00, Math.ceil(totalPrice)), // Min price 15€
            currency: 'EUR'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
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
                amount: validatedData.amount || 0 // Ensure it's not undefined
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

// PATCH update order (e.g. assign driver)
router.patch('/:id', async (req: TenantRequest, res: Response) => {
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
