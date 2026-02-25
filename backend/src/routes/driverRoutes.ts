import { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const driverSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().optional(),
});

// GET all drivers
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const drivers = await prisma.driver.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: true
            }
        });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: 'Fahrer konnten nicht geladen werden' });
    }
});

// POST create driver
router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId, subdomain } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const validatedData = driverSchema.parse(req.body);

        const user = await prisma.user.create({
            data: {
                email: `${validatedData.firstName.toLowerCase()}.${validatedData.lastName.toLowerCase()}@${subdomain || 'qqx'}.local`,
                clerkId: `manual-${Date.now()}`,
                role: 'DRIVER',
                tenantId
            }
        });

        const driver = await prisma.driver.create({
            data: {
                ...validatedData,
                tenantId: tenantId!,
                userId: user.id
            },
            include: {
                user: true
            }
        });

        res.status(201).json(driver);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Fahrer konnte nicht erstellt werden' });
    }
});

export default router;
