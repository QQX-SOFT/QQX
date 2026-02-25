import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const documentSchema = z.object({
    driverId: z.string(),
    type: z.enum(['LICENSE', 'INSURANCE', 'TAX_ID', 'BUSINESS_REG', 'OTHER']),
    title: z.string(),
    fileUrl: z.string(),
    expiryDate: z.string().optional().nullable(),
});

// GET all documents for a tenant's drivers
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    try {
        const documents = await prisma.document.findMany({
            where: {
                driver: { tenantId }
            },
            include: { driver: true },
            orderBy: { expiryDate: 'asc' }
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Dokumente konnten nicht geladen werden' });
    }
});

// GET documents for specific driver
router.get('/driver/:driverId', async (req: TenantRequest, res: Response) => {
    try {
        const documents = await prisma.document.findMany({
            where: {
                driverId: req.params.driverId as string,
                driver: { tenantId: req.tenantId as string }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Fahrerdokumente konnten nicht geladen werden' });
    }
});

// POST create document
router.post('/', async (req: TenantRequest, res: Response) => {
    try {
        const validatedData = documentSchema.parse(req.body);

        const document = await prisma.document.create({
            data: {
                ...validatedData,
                expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
            }
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ error: 'Dokument konnte nicht gespeichert werden' });
    }
});

export default router;
