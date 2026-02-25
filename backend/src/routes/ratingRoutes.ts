import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

const ratingSchema = z.object({
    driverId: z.string(),
    stars: z.number().min(1).max(5),
    comment: z.string().optional(),
});

// GET ratings for a driver
router.get('/driver/:id', async (req: Request, res: Response) => {
    try {
        const ratings = await prisma.rating.findMany({
            where: { driverId: req.params.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

// POST create rating
router.post('/', async (req: Request, res: Response) => {
    try {
        const validatedData = ratingSchema.parse(req.body);

        const rating = await prisma.rating.create({
            data: validatedData
        });

        res.status(201).json(rating);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Failed to create rating' });
    }
});

export default router;
