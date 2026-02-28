"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// -----------------------------------------------------------------
// GLOBAL STATS
// -----------------------------------------------------------------
router.get('/stats', async (req, res) => {
    try {
        const [totalTenants, inactiveTenants, totalUsers, totalVehicles, activeSupscriptions,] = await Promise.all([
            index_1.prisma.tenant.count(),
            index_1.prisma.tenant.count({ where: { isActive: false } }),
            index_1.prisma.user.count(),
            index_1.prisma.vehicle.count(),
            index_1.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        ]);
        // Simulated MRR Calculation (Base 149.90 per active tenant)
        const mrr = totalTenants * 149.90;
        const arr = mrr * 12;
        res.json({
            totalTenants,
            inactiveTenants,
            totalUsers,
            totalVehicles,
            activeSupscriptions,
            mrr: mrr.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
            arr: arr.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
            uptime: "99.98%",
            latency: "12ms"
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch superadmin stats' });
    }
});
// -----------------------------------------------------------------
// PLANS
// -----------------------------------------------------------------
const planSchema = zod_1.z.object({
    name: zod_1.z.string(),
    maxVehicles: zod_1.z.number(),
    maxUsers: zod_1.z.number(),
    maxLocations: zod_1.z.number(),
    priceMonthly: zod_1.z.number(),
    priceYearly: zod_1.z.number(),
});
router.get('/plans', async (req, res) => {
    try {
        const plans = await index_1.prisma.plan.findMany({
            include: { _count: { select: { tenants: true } } }
        });
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});
router.post('/plans', async (req, res) => {
    try {
        const data = planSchema.parse(req.body);
        const plan = await index_1.prisma.plan.create({ data });
        res.status(201).json(plan);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid plan data' });
    }
});
router.patch('/plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = planSchema.partial().parse(req.body);
        const plan = await index_1.prisma.plan.update({
            where: { id },
            data
        });
        res.json(plan);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update plan' });
    }
});
router.delete('/plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.plan.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});
// -----------------------------------------------------------------
// FEATURES
// -----------------------------------------------------------------
router.get('/features', async (req, res) => {
    try {
        const features = await index_1.prisma.feature.findMany();
        res.json(features);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch features' });
    }
});
router.post('/features', async (req, res) => {
    try {
        const { key, description } = req.body;
        const feature = await index_1.prisma.feature.create({
            data: { key, description }
        });
        res.status(201).json(feature);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create feature' });
    }
});
router.delete('/features/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.feature.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete feature' });
    }
});
// -----------------------------------------------------------------
// LOCATIONS (GLOBAL VIEW)
// -----------------------------------------------------------------
router.get('/locations', async (req, res) => {
    try {
        const locations = await index_1.prisma.location.findMany({
            include: {
                tenant: { select: { name: true } },
                _count: { select: { users: true, vehicles: true } }
            }
        });
        res.json(locations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch global locations' });
    }
});
router.post('/locations', async (req, res) => {
    try {
        const { tenantId, name, address } = req.body;
        const location = await index_1.prisma.location.create({
            data: { tenantId, name, address }
        });
        res.status(201).json(location);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create location' });
    }
});
router.delete('/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.location.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete location' });
    }
});
// -----------------------------------------------------------------
// SUPPORT TICKETS
// -----------------------------------------------------------------
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await index_1.prisma.supportTicket.findMany({
            include: { tenant: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch support tickets' });
    }
});
router.patch('/tickets/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const ticket = await index_1.prisma.supportTicket.update({
            where: { id },
            data: { status }
        });
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});
// -----------------------------------------------------------------
// AUDIT LOGS
// -----------------------------------------------------------------
router.get('/audit-logs', async (req, res) => {
    try {
        const logs = await index_1.prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});
// -----------------------------------------------------------------
// NOTIFICATIONS / ANNOUNCEMENTS
// -----------------------------------------------------------------
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await index_1.prisma.supportTicket.findMany({
            where: { priority: 'HIGH' }, // Mocking announcements using tickets for now or add model
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
router.post('/notifications', async (req, res) => {
    try {
        const { title, description, category, type } = req.body;
        // In a real app, you'd have a Notification model. 
        // For now, let's just return what was sent to simulate success.
        res.status(201).json({ title, description, category, type, status: 'SENT', createdAt: new Date() });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create notification' });
    }
});
// -----------------------------------------------------------------
// BILLING / SUBSCRIPTIONS
// -----------------------------------------------------------------
router.get('/subscriptions', async (req, res) => {
    try {
        const subscriptions = await index_1.prisma.subscription.findMany({
            include: {
                tenant: { select: { name: true, subdomain: true } },
                // plan: true // Plan relation might need fixing if not explicitly linked in schema beyond planId
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(subscriptions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});
exports.default = router;
