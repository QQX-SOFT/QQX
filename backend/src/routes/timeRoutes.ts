import express, { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const startSchema = z.object({
    driverId: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    shiftId: z.string().optional(),
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

const stopSchema = z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
});

const locationUpdateSchema = z.object({
    lat: z.number(),
    lng: z.number(),
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
        const { driverId, lat, lng, shiftId } = startSchema.parse(req.body);

        // Security check: Verify driver belongs to tenant
        const driver = await prisma.driver.findFirst({
            where: { id: driverId, tenantId }
        });

        if (!driver) {
            return res.status(403).json({ error: 'Nicht autorisiert für diesen Fahrer' });
        }

        // If shiftId is provided, check location AND time
        if (shiftId) {
            const shift = await prisma.shift.findUnique({
                where: { id: shiftId },
                include: { area: true }
            });

            if (!shift) return res.status(404).json({ error: 'Schicht nicht gefunden' });

            // Time restriction check
            const now = new Date();
            const startWindow = new Date(shift.startTime.getTime() - 15 * 60 * 1000); // 15 mins before
            const endTime = new Date(shift.endTime);

            if (now < startWindow) {
                return res.status(400).json({ 
                    error: 'Zu früh', 
                    message: `Sie können diese Schicht erst ab ${startWindow.toLocaleTimeString('de-DE')} Uhr starten.` 
                });
            }

            if (now > endTime) {
                return res.status(400).json({ 
                    error: 'Schicht beendet', 
                    message: 'Diese Schicht ist bereits offiziell beendet.' 
                });
            }

            if (shift.area && shift.area.latitude && shift.area.longitude) {
                if (!lat || !lng) {
                    return res.status(400).json({ 
                        error: 'Standort erforderlich', 
                        message: 'Sie müssen Ihren Standort freigeben, um diesen Dienst zu starten.' 
                    });
                }

                const distance = calculateDistance(lat, lng, shift.area.latitude, shift.area.longitude);
                if (distance > (shift.area.radius || 500)) {
                    return res.status(400).json({ 
                        error: 'Zu weit entfernt', 
                        message: `Sie befinden sich nicht im Einsatzgebiet (${shift.area.name}). Bitte begeben Sie sich in das Einsatzgebiet, um die Schicht zu starten.` 
                    });
                }
            }
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

// PATCH pause time
router.patch('/pause/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    try {
        const existing = await prisma.timeEntry.findFirst({ where: { id: req.params.id, driver: { tenantId } } });
        if (!existing) return res.status(404).json({ error: 'Nicht gefunden' });

        const entry = await prisma.timeEntry.update({
            where: { id: req.params.id },
            data: { status: 'PAUSED' }
        });
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Pausieren' });
    }
});

// PATCH resume time
router.patch('/resume/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    try {
        const existing = await prisma.timeEntry.findFirst({ where: { id: req.params.id, driver: { tenantId } } });
        if (!existing) return res.status(404).json({ error: 'Nicht gefunden' });

        const entry = await prisma.timeEntry.update({
            where: { id: req.params.id },
            data: { status: 'RUNNING' }
        });
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Fortsetzen' });
    }
});

// PATCH current location
router.patch('/location/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    try {
        const { lat, lng } = locationUpdateSchema.parse(req.body);

        const existing = await prisma.timeEntry.findFirst({
            where: {
                id: req.params.id,
                driver: { tenantId }
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Zeiteintrag nicht gefunden' });
        }

        const entry = await prisma.timeEntry.update({
            where: { id: req.params.id },
            data: {
                currentLat: lat,
                currentLng: lng
            }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Standort-Update fehlgeschlagen' });
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
            driverId: entry.driverId,
            driverName: `${entry.driver.firstName} ${entry.driver.lastName}`,
            lat: entry.currentLat || entry.startLat,
            lng: entry.currentLng || entry.startLng,
            startTime: entry.startTime,
            phone: entry.driver.phone,
            status: entry.status
        }));

        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Standorte' });
    }
});

export default router;
