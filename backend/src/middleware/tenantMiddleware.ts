import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export interface TenantRequest extends Request {
    tenantId?: string;
    subdomain?: string;
    // Explicitly add common properties as any to avoid build failures when Request type resolution fails
    query: any;
    body: any;
    params: any;
}

export const tenantMiddleware = async (req: TenantRequest, res: Response, next: NextFunction) => {
    const subdomain = req.headers['x-tenant-subdomain'] as string;
    const path = req.originalUrl || req.path;

    console.log(`[TenantMiddleware] Path: ${path}, Subdomain: ${subdomain}`);

    // Define special paths
    const isGlobalAPI = path.includes('/api/tenants') || path.includes('/api/superadmin');
    const isHealthOrAuth = path.includes('/health') || path.includes('/auth') || path.includes('/api/upload');
    const isPublicApplicationSubmit = (path === '/api/applications' || path === '/api/applications/') && req.method === 'POST';
    const isBypassed = isGlobalAPI || isHealthOrAuth || isPublicApplicationSubmit;

    // 1. Try to identify tenant if subdomain provided
    if (subdomain) {
        try {
            const tenant = await prisma.tenant.findUnique({
                where: { subdomain }
            });

            if (tenant) {
                req.tenantId = tenant.id;
                req.subdomain = subdomain;
                console.log(`[TenantMiddleware] Identified tenant: ${subdomain} (${tenant.id})`);
            } else if (!isBypassed) {
                // If subdomain provided but invalid, and it's NOT a bypassed path, block it
                return res.status(404).json({ error: 'Mandant (Tenant) nicht gefunden.' });
            }
        } catch (error) {
            console.error('Tenant Middleware identification error:', error);
            if (!isBypassed) return res.status(500).json({ error: 'Fehler bei der Mandantenprüfung.' });
        }
    }

    // 2. Enforce tenant context for non-bypassed paths
    if (!req.tenantId && !isBypassed) {
        console.warn(`[TenantMiddleware] Denying access to protected path ${path} - No tenant context.`);
        return res.status(400).json({ error: 'Mandantenkontext fehlt für diese Anfrage.' });
    }

    next();
};
