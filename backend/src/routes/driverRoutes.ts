import { Router } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

const driverSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().optional(),
});

// Helper to get tenant from header
const getTenantId = async (subdomain: string) => {
    const tenant = await prisma.tenant.findUnique({
        where: { subdomain }
    });
    return tenant?.id;
};

// GET all drivers for a specific tenant
router.get('/', async (req, res) => {
    const subdomain = req.headers['x-tenant-subdomain'] as string;

    if (!subdomain) {
        return res.status(400).json({ error: 'Tenant context missing' });
    }

    try {
        const tenantId = await getTenantId(subdomain);
        if (!tenantId) return res.status(404).json({ error: 'Tenant not found' });

        const drivers = await prisma.driver.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: true
            }
        });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
});

// POST create driver
router.post('/', async (req, res) => {
    const subdomain = req.headers['x-tenant-subdomain'] as string;

    if (!subdomain) {
        return res.status(400).json({ error: 'Tenant context missing' });
    }

    try {
        const validatedData = driverSchema.parse(req.body);
        const tenantId = await getTenantId(subdomain);
        if (!tenantId) return res.status(404).json({ error: 'Tenant not found' });

        // TEMPORARY: Create a placeholder user for the driver since clerk is disabled
        const user = await prisma.user.create({
            data: {
                email: `${validatedData.firstName.toLowerCase()}.${validatedData.lastName.toLowerCase()}@${subdomain}.local`,
                clerkId: `manual-${Date.now()}`,
                role: 'DRIVER',
                tenantId
            }
        });

        const driver = await prisma.driver.create({
            data: {
                ...validatedData,
                tenantId,
                userId: user.id
            }
        });

        res.status(201).json(driver);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to create driver' });
    }
});

export default router;
