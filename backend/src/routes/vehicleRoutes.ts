import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

const vehicleSchema = z.object({
    licensePlate: z.string().min(2),
    make: z.string().min(2),
    model: z.string().min(2),
    milage: z.number().int().nonnegative().default(0),
    nextMaintenance: z.string().optional().nullable(), // ISO String
});

// Helper to get tenant from header
const getTenantId = async (subdomain: string) => {
    const tenant = await prisma.tenant.findUnique({
        where: { subdomain }
    });
    return tenant?.id;
};

// GET all vehicles for a specific tenant
router.get('/', async (req: Request, res: Response) => {
    const subdomain = req.headers['x-tenant-subdomain'] as string;

    if (!subdomain) {
        return res.status(400).json({ error: 'Tenant context missing' });
    }

    try {
        const tenantId = await getTenantId(subdomain);
        if (!tenantId) return res.status(404).json({ error: 'Tenant not found' });

        const vehicles = await prisma.vehicle.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

// POST create vehicle
router.post('/', async (req: Request, res: Response) => {
    const subdomain = req.headers['x-tenant-subdomain'] as string;

    if (!subdomain) {
        return res.status(400).json({ error: 'Tenant context missing' });
    }

    try {
        const validatedData = vehicleSchema.parse(req.body);
        const tenantId = await getTenantId(subdomain);
        if (!tenantId) return res.status(404).json({ error: 'Tenant not found' });

        const vehicle = await prisma.vehicle.create({
            data: {
                ...validatedData,
                nextMaintenance: validatedData.nextMaintenance ? new Date(validatedData.nextMaintenance) : null,
                tenantId,
            }
        });

        res.status(201).json(vehicle);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Failed to create vehicle' });
    }
});

export default router;
