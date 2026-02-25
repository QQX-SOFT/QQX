import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TenantRequest extends Request {
    tenantId?: string;
}

export const tenantMiddleware = async (req: TenantRequest, res: Response, next: NextFunction) => {
    const subdomain = req.headers['x-tenant-subdomain'] as string;

    if (!subdomain) {
        // If no subdomain, we might be in a public area or super admin area
        return next();
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { subdomain }
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Mandant (Tenant) nicht gefunden.' });
        }

        // Attach tenantId to request for use in routes
        req.tenantId = tenant.id;
        next();
    } catch (error) {
        console.error('Tenant Middleware Error:', error);
        res.status(500).json({ error: 'Interner Serverfehler bei der Mandantenprüfung.' });
    }
};
