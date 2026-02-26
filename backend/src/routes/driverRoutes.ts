import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const driverSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    birthday: z.string().optional().nullable(),
    employmentType: z.enum(['ANGEMELDET', 'SELBSTSTANDIG']).optional(),
    street: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    ssn: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    iban: z.string().optional().nullable(),
    bic: z.string().optional().nullable(),
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
                street: validatedData.street,
                zip: validatedData.zip,
                city: validatedData.city,
                ssn: validatedData.ssn,
                taxId: validatedData.taxId,
                iban: validatedData.iban,
                bic: validatedData.bic,
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

// PATCH update driver status
router.patch('/:id/status', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;
    const { status } = req.body; // Expect ACTIVE or INACTIVE

    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const driver = await prisma.driver.updateMany({
            where: { id, tenantId },
            data: { status }
        });

        if (driver.count === 0) return res.status(404).json({ error: 'Fahrer nicht gefunden' });

        res.json({ message: 'Status aktualisiert' });
    } catch (error) {
        res.status(500).json({ error: 'Status konnte nicht aktualisiert werden' });
    }
});

// DELETE driver (only if inactive)
router.delete('/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const driver = await prisma.driver.findFirst({
            where: { id, tenantId }
        });

        if (!driver) return res.status(404).json({ error: 'Fahrer nicht gefunden' });

        if (driver.status === 'ACTIVE') {
            return res.status(400).json({ error: 'Aktive Fahrer können nicht gelöscht werden. Bitte zuerst auf Passiv setzen.' });
        }

        await prisma.driver.delete({
            where: { id }
        });

        res.json({ message: 'Fahrer erfolgreich gelöscht' });
    } catch (error) {
        console.error("Delete driver error:", error);
        res.status(500).json({ error: 'Fahrer konnte nicht gelöscht werden' });
    }
});

export default router;
