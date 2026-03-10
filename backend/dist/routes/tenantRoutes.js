"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const tenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    subdomain: zod_1.z.string().min(2).regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric"),
    // Austrian Legal & Address
    address: zod_1.z.string().optional(),
    zipCode: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    uidNumber: zod_1.z.string().optional(), // UID-Nummer
    companyRegister: zod_1.z.string().optional(), // Firmenbuchnummer
    legalForm: zod_1.z.string().optional(), // Rechtsform
    commercialCourt: zod_1.z.string().optional(), // Gerichtsstand
    // Admin info
    adminEmail: zod_1.z.string().email().optional(),
    adminPassword: zod_1.z.string().min(6).optional(),
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
        const { adminEmail, adminPassword, ...tenantData } = validatedData;
        const existing = await index_1.prisma.tenant.findUnique({
            where: { subdomain: validatedData.subdomain }
        });
        if (existing) {
            return res.status(400).json({ error: 'Subdomain already taken' });
        }
        // Create Tenant
        const tenant = await index_1.prisma.tenant.create({
            data: tenantData
        });
        // Create Admin User if provided
        if (adminEmail && adminPassword) {
            await index_1.prisma.user.create({
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
    }
    catch (error) {
        console.error("Create tenant error:", error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Failed to create tenant: ' + (error instanceof Error ? error.message : String(error)) });
    }
});
// GET single tenant
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || id === "undefined" || id === "null") {
            return res.status(400).json({ error: 'Valid Tenant ID is required' });
        }
        console.log(`[GET] Fetching tenant: ${id}`);
        const tenant = await index_1.prisma.tenant.findUnique({
            where: { id }
        });
        if (!tenant) {
            console.warn(`[GET] Tenant not found: ${id}`);
            return res.status(404).json({ error: 'Tenant not found' });
        }
        res.json(tenant);
    }
    catch (error) {
        console.error(`[GET] Fetch tenant error [${req.params.id}]:`, error.message);
        res.status(500).json({ error: 'Failed to fetch tenant', details: error.message });
    }
});
// PATCH update tenant (SuperAdmin)
router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Partial validation for updates
        const validatedData = tenantSchema.partial().parse(req.body);
        // Remove admin fields from update, they are handled separately
        const { adminEmail, adminPassword, ...updateData } = validatedData;
        const tenant = await index_1.prisma.tenant.update({
            where: { id },
            data: updateData
        });
        res.json(tenant);
    }
    catch (error) {
        console.error("Update tenant error:", error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Failed to update tenant' });
    }
});
// GET tenant admins
router.get('/:id/admins', async (req, res) => {
    try {
        const id = req.params.id;
        const admins = await index_1.prisma.user.findMany({
            where: { tenantId: id, role: 'CUSTOMER_ADMIN' }
        });
        res.json(admins);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});
// POST create tenant admin
router.post('/:id/admins', async (req, res) => {
    try {
        const id = req.params.id;
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const existing = await index_1.prisma.user.findFirst({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const user = await index_1.prisma.user.create({
            data: {
                email,
                password, // Should be hashed
                role: 'CUSTOMER_ADMIN',
                tenantId: id,
                clerkId: `manual-admin-${Date.now()}`
            }
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error("Create admin error:", error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});
// DELETE tenant admin
router.delete('/:id/admins/:userId', async (req, res) => {
    try {
        const { id, userId } = req.params;
        await index_1.prisma.user.delete({
            where: { id: userId, tenantId: id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete admin' });
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
