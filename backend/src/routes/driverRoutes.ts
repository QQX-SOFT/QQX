import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const driverSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    birthday: z.string().optional(),
    employmentType: z.enum(['ANGEMELDET', 'SELBSTSTANDIG']).optional(),
});

// GET all drivers
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const drivers = await prisma.driver.findMany({
            where: { tenantId: tenantId as string },
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

// GET single driver
router.get('/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const driver = await prisma.driver.findFirst({
            where: { id, tenantId: tenantId as string },
            include: {
                user: true,
                documents: true,
                ratings: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!driver) {
            return res.status(404).json({ error: 'Fahrer nicht gefunden' });
        }

        res.json(driver);
    } catch (error) {
        res.status(500).json({ error: 'Fahrer konnte nicht geladen werden' });
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

        // Map employmentType to Prisma DriverType
        const prismaType = validatedData.employmentType === 'SELBSTSTANDIG' ? 'FREELANCE' : 'EMPLOYED';

        const user = await prisma.user.create({
            data: {
                email: validatedData.email || `${validatedData.firstName.toLowerCase()}.${validatedData.lastName.toLowerCase()}@${subdomain || 'qqx'}.local`,
                clerkId: `manual-${Date.now()}`,
                role: 'DRIVER',
                tenantId: tenantId as string
            }
        });

        const driver = await prisma.driver.create({
            data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                phone: validatedData.phone,
                birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
                type: prismaType,
                tenantId: tenantId as string,
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
        console.error("Create driver error:", error);
        res.status(500).json({ error: 'Fahrer konnte nicht erstellt werden' });
    }
});

export default router;
