import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const complaintSchema = z.object({
    driverId: z.string(),
    title: z.string(),
    description: z.string(),
    penalty: z.number().optional().default(0),
});

// GET all complaints for a tenant
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    try {
        const complaints = await prisma.complaint.findMany({
            where: { tenantId },
            include: { driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: 'Reklamationen konnten nicht geladen werden' });
    }
});

// POST create complaint
router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    try {
        const validatedData = complaintSchema.parse(req.body);

        const complaint = await prisma.complaint.create({
            data: {
                ...validatedData,
                tenantId: tenantId!,
            }
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ error: 'Reklamation konnte nicht erstellt werden' });
    }
});

// PATCH resolve explanation
router.patch('/:id/resolve', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { explanation, status, penalty } = req.body;

    try {
        const complaint = await prisma.complaint.update({
            where: { id: req.params.id as string, tenantId: tenantId as string },
            data: {
                explanation,
                status,
                penalty
            }
        });
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ error: 'Reklamation konnte nicht aktualisiert werden' });
    }
});

export default router;
