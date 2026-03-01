import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

// GET all customers
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const customers = await prisma.customer.findMany({
            where: { tenantId: tenantId as string },
            orderBy: { name: 'asc' }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Kunden konnten nicht geladen werden' });
    }
});

// POST create customer
router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const customer = await prisma.customer.create({
            data: {
                ...req.body,
                tenantId: tenantId as string
            }
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Kunde konnte nicht erstellt werden' });
    }
});

// PATCH update customer
router.patch('/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const customer = await prisma.customer.update({
            where: { id, tenantId: tenantId as string },
            data: req.body
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Kunde konnte nicht aktualisiert werden' });
    }
});

// DELETE customer
router.delete('/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;

    try {
        await prisma.customer.delete({
            where: { id, tenantId: tenantId as string }
        });
        res.json({ message: 'Kunde gelöscht' });
    } catch (error) {
        res.status(500).json({ error: 'Kunde konnte nicht gelöscht werden' });
    }
});

export default router;
