import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

const tenantSchema = z.object({
    name: z.string().min(2),
    subdomain: z.string().min(2).regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric"),
    currency: z.string().optional().default("EUR"),
    timezone: z.string().optional().default("Europe/Berlin"),
    basePrice: z.number().optional().default(15.00),
    distanceMultiplier: z.number().optional().default(0.50),
    // Admin info
    adminEmail: z.string().email().optional(),
    adminPassword: z.string().min(6).optional(),
});

// GET global platform stats (SuperAdmin)
router.get('/stats', async (req: express.Request, res: Response) => {
    try {
        const [tenantCount, userCount, vehicleCount, orderCount] = await Promise.all([
            prisma.tenant.count(),
            prisma.user.count(),
            prisma.vehicle.count(),
            prisma.order.count(),
        ]);

        // Simulated platform revenue (e.g. 149.90€ per tenant subscription)
        const revenue = tenantCount * 149.90;

        res.json({
            totalTenants: tenantCount,
            totalUsers: userCount,
            totalVehicles: vehicleCount,
            totalOrders: orderCount,
            revenue: revenue,
            uptime: "99.99%",
            latency: "14ms"
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch global stats' });
    }
});

// GET all tenants
router.get('/', async (req: express.Request, res: Response) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                _count: {
                    select: { users: true, vehicles: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
});

// POST create tenant
router.post('/', async (req: express.Request, res: Response) => {
    try {
        const validatedData = tenantSchema.parse(req.body);
        const { adminEmail, adminPassword, ...tenantData } = validatedData;

        const existing = await prisma.tenant.findUnique({
            where: { subdomain: validatedData.subdomain }
        });

        if (existing) {
            return res.status(400).json({ error: 'Subdomain already taken' });
        }

        // Create Tenant
        const tenant = await prisma.tenant.create({
            data: tenantData
        });

        // Create Admin User if provided
        if (adminEmail && adminPassword) {
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: adminPassword, // Should be hashed
                    role: 'CUSTOMER_ADMIN',
                    tenantId: tenant.id,
                    clerkId: `initial-admin-${Date.now()}`
                }
            });
        }

        res.status(201).json(tenant);
    } catch (error) {
        console.error("Create tenant error:", error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Failed to create tenant: ' + (error instanceof Error ? error.message : String(error)) });
    }
});

// PATCH update tenant (SuperAdmin)
router.patch('/:id', async (req: express.Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const tenant = await prisma.tenant.update({
            where: { id },
            data: req.body
        });
        res.json(tenant);
    } catch (error) {
        console.error("Update tenant error:", error);
        res.status(500).json({ error: 'Failed to update tenant' });
    }
});

// GET tenant admins
router.get('/:id/admins', async (req: express.Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const admins = await prisma.user.findMany({
            where: { tenantId: id, role: 'CUSTOMER_ADMIN' }
        });
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

// POST create tenant admin
router.post('/:id/admins', async (req: express.Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existing = await prisma.user.findFirst({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const user = await prisma.user.create({
            data: {
                email,
                password, // Should be hashed
                role: 'CUSTOMER_ADMIN',
                tenantId: id,
                clerkId: `manual-admin-${Date.now()}`
            }
        });

        res.status(201).json(user);
    } catch (error) {
        console.error("Create admin error:", error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// DELETE tenant admin
router.delete('/:id/admins/:userId', async (req: express.Request, res: Response) => {
    try {
        const { id, userId } = req.params;
        await prisma.user.delete({
            where: { id: userId, tenantId: id }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete admin' });
    }
});

// DELETE tenant (SuperAdmin)
router.delete('/:id', async (req: express.Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.tenant.delete({
            where: { id }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete tenant' });
    }
});

export default router;
