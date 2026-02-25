import { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const vehicleSchema = z.object({
    licensePlate: z.string().min(2),
    make: z.string().min(2),
    model: z.string().min(2),
    milage: z.number().int().nonnegative().default(0),
    nextMaintenance: z.string().optional().nullable(), // ISO String
});

// GET all vehicles for a specific tenant
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: 'Fahrzeuge konnten nicht geladen werden' });
    }
});

// POST create vehicle
router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const validatedData = vehicleSchema.parse(req.body);

        const vehicle = await prisma.vehicle.create({
            data: {
                ...validatedData,
                nextMaintenance: validatedData.nextMaintenance ? new Date(validatedData.nextMaintenance) : null,
                tenantId: tenantId!,
            }
        });

        res.status(201).json(vehicle);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Fahrzeug konnte nicht erstellt werden' });
    }
});

export default router;
