import { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const ratingSchema = z.object({
    driverId: z.string(),
    stars: z.number().min(1).max(5),
    comment: z.string().optional(),
});

// GET ratings for a driver
router.get('/driver/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    try {
        const ratings = await prisma.rating.findMany({
            where: {
                driverId: req.params.id,
                driver: { tenantId }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: 'Bewertungen konnten nicht geladen werden' });
    }
});

// POST create rating
router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    try {
        const validatedData = ratingSchema.parse(req.body);

        // Security check
        const driver = await prisma.driver.findFirst({
            where: { id: validatedData.driverId, tenantId }
        });

        if (!driver) {
            return res.status(403).json({ error: 'Nicht autorisiert für diesen Fahrer' });
        }

        const rating = await prisma.rating.create({
            data: validatedData
        });

        res.status(201).json(rating);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Bewertung konnte nicht erstellt werden' });
    }
});

export default router;
