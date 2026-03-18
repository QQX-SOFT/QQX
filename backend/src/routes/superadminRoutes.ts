import { Router, Response, Request } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

// -----------------------------------------------------------------
// GLOBAL STATS
// -----------------------------------------------------------------
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const [
            totalTenants,
            totalUsers,
            totalVehicles,
            activeSupscriptions,
        ] = await Promise.all([
            prisma.tenant.count(),
            prisma.user.count(),
            prisma.vehicle.count(),
            prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        ]);

        const inactiveTenants = 0; // Or calculate based on planId if needed

        // Simulated MRR Calculation (Base 149.90 per active tenant)
        const mrr = totalTenants * 149.90;
        const arr = mrr * 12;

        res.json({
            totalTenants,
            inactiveTenants,
            totalUsers,
            totalVehicles,
            activeSupscriptions,
            mrr: "0,00 €",
            arr: "0,00 €",
            uptime: "99.98%",
            latency: "12ms"
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch superadmin stats' });
    }
});

// -----------------------------------------------------------------
// USERS (SUPER ADMINS)
// -----------------------------------------------------------------
router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { 
                id: true, 
                email: true, 
                role: true, 
                createdAt: true,
                tenant: { select: { name: true } }
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch superadmin users' });
    }
});

// -----------------------------------------------------------------
// PLANS
// -----------------------------------------------------------------
const planSchema = z.object({
    name: z.string(),
    maxVehicles: z.number(),
    maxUsers: z.number(),
    maxLocations: z.number(),
    priceMonthly: z.number(),
    priceYearly: z.number(),
});

router.get('/plans', async (req: Request, res: Response) => {
    try {
        const plans = await prisma.plan.findMany({
            include: { _count: { select: { tenants: true } } }
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

router.post('/plans', async (req: Request, res: Response) => {
    try {
        const data = planSchema.parse(req.body);
        const plan = await prisma.plan.create({ data });
        res.status(201).json(plan);
    } catch (error) {
        res.status(400).json({ error: 'Invalid plan data' });
    }
});

router.patch('/plans/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = planSchema.partial().parse(req.body);
        const plan = await prisma.plan.update({
            where: { id },
            data
        });
        res.json(plan);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update plan' });
    }
});

router.delete('/plans/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.plan.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

// -----------------------------------------------------------------
// FEATURES
// -----------------------------------------------------------------
router.get('/features', async (req: Request, res: Response) => {
    try {
        const features = await prisma.feature.findMany();
        res.json(features);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch features' });
    }
});

router.post('/features', async (req: Request, res: Response) => {
    try {
        const { key, description } = req.body;
        const feature = await prisma.feature.create({
            data: { key, description }
        });
        res.status(201).json(feature);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create feature' });
    }
});

router.delete('/features/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.feature.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete feature' });
    }
});

// -----------------------------------------------------------------
// LOCATIONS (GLOBAL VIEW)
// -----------------------------------------------------------------
router.get('/locations', async (req: Request, res: Response) => {
    try {
        const locations = await prisma.location.findMany({
            include: {
                tenant: { select: { name: true } },
                _count: { select: { users: true, vehicles: true } }
            }
        });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch global locations' });
    }
});

router.post('/locations', async (req: Request, res: Response) => {
    try {
        const { tenantId, name, address } = req.body;
        const location = await prisma.location.create({
            data: { tenantId, name, address }
        });
        res.status(201).json(location);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create location' });
    }
});

router.delete('/locations/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.location.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete location' });
    }
});

// -----------------------------------------------------------------
// SUPPORT TICKETS
// -----------------------------------------------------------------
router.get('/tickets', async (req: Request, res: Response) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            include: { tenant: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch support tickets' });
    }
});

router.patch('/tickets/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;
        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: { status }
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// -----------------------------------------------------------------
// AUDIT LOGS
// -----------------------------------------------------------------
router.get('/audit-logs', async (req: Request, res: Response) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// -----------------------------------------------------------------
// NOTIFICATIONS / ANNOUNCEMENTS
// -----------------------------------------------------------------
router.get('/notifications', async (req: Request, res: Response) => {
    try {
        const notifications = await prisma.supportTicket.findMany({
            where: { priority: 'HIGH' }, // Mocking announcements using tickets for now or add model
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.post('/notifications', async (req: Request, res: Response) => {
    try {
        const { title, description, category, type } = req.body;
        // In a real app, you'd have a Notification model. 
        // For now, let's just return what was sent to simulate success.
        res.status(201).json({ title, description, category, type, status: 'SENT', createdAt: new Date() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// -----------------------------------------------------------------
// BILLING / SUBSCRIPTIONS
// -----------------------------------------------------------------
router.get('/subscriptions', async (req: Request, res: Response) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            include: {
                tenant: { select: { name: true, subdomain: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// GET Single Subscription Details with Tenant, Invoices & Plan
router.get('/subscriptions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const subscription = await prisma.subscription.findUnique({
            where: { id },
            include: {
                tenant: {
                    include: {
                        saasInvoices: { orderBy: { createdAt: 'desc' } }
                    }
                },
            }
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        let plan = null;
        if (subscription.tenant && subscription.tenant.planId) {
            plan = await prisma.plan.findUnique({
                where: { id: subscription.tenant.planId }
            });
        }

        res.json({
            ...subscription,
            plan
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscription details' });
    }
});

// PUT Update Subscription Settings (e.g. autoInvoice)
router.put('/subscriptions/:id/settings', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { autoInvoice } = req.body;

        const subscription = await prisma.subscription.update({
            where: { id },
            data: { autoInvoice: autoInvoice !== undefined ? autoInvoice : undefined }
        });

        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update subscription settings' });
    }
});

// POST Create Manual SaaS Invoice
router.post('/subscriptions/:id/invoices', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, period, dueDate } = req.body;

        const subscription = await prisma.subscription.findUnique({
            where: { id },
            select: { tenantId: true }
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const invoice = await prisma.saaSInvoice.create({
            data: {
                tenantId: subscription.tenantId,
                invoiceNumber: `RE-${Date.now()}`,
                amount: parseFloat(amount),
                period: period || '',
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'UNPAID'
            }
        });

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// PATCH Update SaaS Invoice Status (e.g. PAID)
router.patch('/invoices/:invoiceId', async (req: Request, res: Response) => {
    try {
        const { invoiceId } = req.params;
        const { status } = req.body;

        const invoice = await prisma.saaSInvoice.update({
            where: { id: invoiceId },
            data: { status }
        });

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update invoice status' });
    }
});

export default router;
