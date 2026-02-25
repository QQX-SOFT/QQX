import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

const startSchema = z.object({
    driverId: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

const stopSchema = z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
});

// GET active entry for a driver
router.get('/active/:driverId', async (req: Request, res: Response) => {
    try {
        const entry = await prisma.timeEntry.findFirst({
            where: {
                driverId: req.params.driverId,
                status: { in: ['RUNNING', 'PAUSED'] }
            }
        });
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active entry' });
    }
});

// POST start time
router.post('/start', async (req: Request, res: Response) => {
    try {
        const { driverId, lat, lng } = startSchema.parse(req.body);

        // Check if already running
        const existing = await prisma.timeEntry.findFirst({
            where: { driverId, status: { in: ['RUNNING', 'PAUSED'] } }
        });

        if (existing) {
            return res.status(400).json({ error: 'Fahrer hat bereits eine aktive Schicht.' });
        }

        const entry = await prisma.timeEntry.create({
            data: {
                driverId,
                startTime: new Date(),
                startLat: lat,
                startLng: lng,
                status: 'RUNNING'
            }
        });

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to start entry' });
    }
});

// PATCH stop time
router.patch('/stop/:id', async (req: Request, res: Response) => {
    try {
        const { lat, lng } = stopSchema.parse(req.body);

        const entry = await prisma.timeEntry.update({
            where: { id: req.params.id },
            data: {
                endTime: new Date(),
                endLat: lat,
                endLng: lng,
                status: 'COMPLETED'
            }
        });

        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop entry' });
    }
});

export default router;
