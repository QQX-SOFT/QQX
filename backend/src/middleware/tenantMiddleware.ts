import express, { Response, NextFunction } from 'express';
import { prisma } from '../index';

export interface TenantRequest extends express.Request {
    tenantId?: string;
    subdomain?: string;
}

export const tenantMiddleware = async (req: TenantRequest, res: Response, next: NextFunction) => {
    const subdomain = req.headers['x-tenant-subdomain'] as string;

    // Skip tenant check for tenant creation/listing
    if (!subdomain || req.path.startsWith('/tenants')) {
        return next();
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { subdomain }
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Mandant (Tenant) nicht gefunden.' });
        }

        // Attach tenantId and subdomain to request for use in routes
        req.tenantId = tenant.id;
        req.subdomain = subdomain;
        next();
    } catch (error) {
        console.error('Tenant Middleware Error:', error);
        res.status(500).json({ error: 'Interner Serverfehler bei der Mandantenprüfung.' });
    }
};
