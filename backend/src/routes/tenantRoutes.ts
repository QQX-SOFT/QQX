import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

const tenantSchema = z.object({
    name: z.string().min(2),
    subdomain: z.string().min(2).regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric"),
});

// GET all tenants
router.get('/', async (req: express.Request, res: Response) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                _count: {
                    select: { users: true, vehicles: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
});

// POST create tenant
router.post('/', async (req: express.Request, res: Response) => {
    try {
        const validatedData = tenantSchema.parse(req.body);

        const existing = await prisma.tenant.findUnique({
            where: { subdomain: validatedData.subdomain }
        });

        if (existing) {
            return res.status(400).json({ error: 'Subdomain already taken' });
        }

        const tenant = await prisma.tenant.create({
            data: validatedData
        });

        res.status(201).json(tenant);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Failed to create tenant' });
    }
});

export default router;
