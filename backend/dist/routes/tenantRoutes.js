"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const tenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    subdomain: zod_1.z.string().min(2).regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric"),
});
// GET global platform stats (SuperAdmin)
router.get('/stats', async (req, res) => {
    try {
        const [tenantCount, userCount, vehicleCount, orderCount] = await Promise.all([
            index_1.prisma.tenant.count(),
            index_1.prisma.user.count(),
            index_1.prisma.vehicle.count(),
            index_1.prisma.order.count(),
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch global stats' });
    }
});
// GET all tenants
router.get('/', async (req, res) => {
    try {
        const tenants = await index_1.prisma.tenant.findMany({
            include: {
                _count: {
                    select: { users: true, vehicles: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tenants);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
});
// POST create tenant
router.post('/', async (req, res) => {
    try {
        const validatedData = tenantSchema.parse(req.body);
        const existing = await index_1.prisma.tenant.findUnique({
            where: { subdomain: validatedData.subdomain }
        });
        if (existing) {
            return res.status(400).json({ error: 'Subdomain already taken' });
        }
        const tenant = await index_1.prisma.tenant.create({
            data: validatedData
        });
        res.status(201).json(tenant);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Failed to create tenant' });
    }
});
// PATCH update tenant (SuperAdmin)
router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const tenant = await index_1.prisma.tenant.update({
            where: { id },
            data: req.body
        });
        res.json(tenant);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update tenant' });
    }
});
// DELETE tenant (SuperAdmin)
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await index_1.prisma.tenant.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete tenant' });
    }
});
exports.default = router;
