import express, { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const vehicleSchema = z.object({
    licensePlate: z.string().min(2),
    make: z.string().min(2),
    model: z.string().min(2),
    milage: z.number().int().nonnegative().default(0),
    nextMaintenance: z.string().optional().nullable(), // ISO String
    dailyRate: z.number().min(0).default(35),
    imageUrl: z.string().optional().nullable(),
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

        // Check Plan Limits
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId! },
            include: { plan: true }
        });

        if (tenant?.plan) {
            const vehicleCount = await prisma.vehicle.count({
                where: { tenantId: tenantId! }
            });

            if (vehicleCount >= tenant.plan.maxVehicles) {
                return res.status(403).json({ 
                    error: `Tarif-Limit erreicht: Ihr Tarif erlaubt maximal ${tenant.plan.maxVehicles} Fahrzeuge.` 
                });
            }
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                ...validatedData,
                nextMaintenance: validatedData.nextMaintenance ? new Date(validatedData.nextMaintenance) : null,
                dailyRate: validatedData.dailyRate,
                imageUrl: validatedData.imageUrl,
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

// PATCH update vehicle status
router.patch('/:id/status', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { status, nextMaintenance } = req.body;

    try {
        const vehicle = await prisma.vehicle.update({
            where: { id: req.params.id as string, tenantId: tenantId as string },
            data: {
                status: status,
                ...(nextMaintenance && { nextMaintenance: new Date(nextMaintenance) }),
                ...(req.body.availableFrom && { availableFrom: new Date(req.body.availableFrom) })
            }
        });
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ error: 'Fahrzeugstatus konnte nicht aktualisiert werden' });
    }
});

export default router;
