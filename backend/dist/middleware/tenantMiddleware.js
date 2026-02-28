"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = void 0;
const index_1 = require("../index");
const tenantMiddleware = async (req, res, next) => {
    const subdomain = req.headers['x-tenant-subdomain'];
    const path = req.originalUrl || req.path;
    console.log(`[TenantMiddleware] Path: ${path}, Subdomain: ${subdomain}`);
    // Skip tenant check for tenant creation/listing or health checks
    if (path.includes('/tenants') || path.includes('/health') || !subdomain) {
        console.log(`[TenantMiddleware] Bypassing check for ${path}`);
        return next();
    }
    try {
        const tenant = await index_1.prisma.tenant.findUnique({
            where: { subdomain }
        });
        if (!tenant) {
            console.warn(`[TenantMiddleware] Tenant NOT FOUND for subdomain: ${subdomain}`);
            return res.status(404).json({
                error: 'Mandant (Tenant) nicht gefunden.',
                debug: { subdomain, path }
            });
        }
        // Attach tenantId and subdomain to request for use in routes
        req.tenantId = tenant.id;
        req.subdomain = subdomain;
        next();
    }
    catch (error) {
        console.error('Tenant Middleware Error:', error);
        res.status(500).json({ error: 'Interner Serverfehler bei der Mandantenprüfung.' });
    }
};
exports.tenantMiddleware = tenantMiddleware;
