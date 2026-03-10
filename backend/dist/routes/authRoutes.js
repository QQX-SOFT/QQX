"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const subdomain = req.headers['x-tenant-subdomain'];
        // Find user by email (SUPER_ADMIN, CUSTOMER_ADMIN, DRIVER)
        let user = await index_1.prisma.user.findUnique({
            where: { email },
            include: {
                tenant: true
            }
        });
        if (user) {
            // Check password
            if (user.password !== password) {
                return res.status(401).json({ error: 'E-Mail oder Passwort falsch.' });
            }
            // Check tenant context if not SUPER_ADMIN
            if (user.role !== 'SUPER_ADMIN') {
                if (!user.tenant || user.tenant.subdomain !== subdomain) {
                    return res.status(401).json({ error: 'Dieser Benutzer gehört nicht zu dieser App/Instanz.' });
                }
            }
            const { password: _, ...userWithoutPassword } = user;
            return res.json({
                message: 'Login erfolgreich',
                user: userWithoutPassword,
                role: user.role
            });
        }
        // If not in User table, check Customer table
        // We only allow customers to login to a specific subdomain
        if (subdomain) {
            const tenant = await index_1.prisma.tenant.findUnique({ where: { subdomain } });
            if (tenant) {
                const customer = await index_1.prisma.customer.findFirst({
                    where: {
                        email,
                        tenantId: tenant.id
                    }
                });
                if (customer) {
                    if (customer.password !== password) {
                        return res.status(401).json({ error: 'E-Mail oder Passwort falsch.' });
                    }
                    const { password: _, ...customerWithoutPassword } = customer;
                    return res.json({
                        message: 'Login erfolgreich',
                        user: customerWithoutPassword,
                        role: 'CUSTOMER'
                    });
                }
            }
        }
        return res.status(401).json({ error: 'E-Mail oder Passwort falsch.' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Interner Serverfehler beim Login' });
    }
});
exports.default = router;
