import { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

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
router.get('/active/:driverId', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    try {
        const entry = await prisma.timeEntry.findFirst({
            where: {
                driverId: req.params.driverId,
                driver: { tenantId: tenantId }, // Security: Verify driver belongs to tenant
                status: { in: ['RUNNING', 'PAUSED'] }
            }
        });
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen des aktiven Zeiteintrags' });
    }
});

// POST start time
router.post('/start', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    try {
        const { driverId, lat, lng } = startSchema.parse(req.body);

        // Security check: Verify driver belongs to tenant
        const driver = await prisma.driver.findFirst({
            where: { id: driverId, tenantId }
        });

        if (!driver) {
            return res.status(403).json({ error: 'Nicht autorisiert für diesen Fahrer' });
        }

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
        res.status(500).json({ error: 'Fehler beim Starten der Schicht' });
    }
});

// PATCH stop time
router.patch('/stop/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    try {
        const { lat, lng } = stopSchema.parse(req.body);

        // First find the entry to verify it belongs to this tenant
        const existing = await prisma.timeEntry.findFirst({
            where: {
                id: req.params.id,
                driver: { tenantId }
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Zeiteintrag nicht gefunden oder nicht autorisiert' });
        }

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
        res.status(500).json({ error: 'Fehler beim Beenden der Schicht' });
    }
});

// GET latest location of all active drivers for a tenant
router.get('/locations', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const activeEntries = await prisma.timeEntry.findMany({
            where: {
                driver: { tenantId: tenantId },
                status: 'RUNNING'
            },
            include: {
                driver: true
            }
        });

        const locations = activeEntries.map((entry: any) => ({
            id: entry.id,
            driverName: `${entry.driver.firstName} ${entry.driver.lastName}`,
            lat: entry.startLat,
            lng: entry.startLng,
            startTime: entry.startTime
        }));

        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Standorte' });
    }
});

export default router;
