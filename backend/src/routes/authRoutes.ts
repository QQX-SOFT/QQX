import express, { Router, Response, Request } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

router.post('/login', async (req: TenantRequest, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const subdomain = req.headers['x-tenant-subdomain'] as string;

        // Find user by email (SUPER_ADMIN, CUSTOMER_ADMIN, DRIVER)
        let user = await prisma.user.findUnique({
            where: { email },
            include: {
                tenant: true
            }
        });

        if (user) {
            // Check password
            if (!user.password || user.password !== password) {
                return res.status(401).json({ error: 'E-Mail oder Passwort falsch.' });
            }

            // Check tenant context if not SUPER_ADMIN
            if (user.role !== 'SUPER_ADMIN') {
                if (subdomain && (!user.tenant || user.tenant.subdomain !== subdomain)) {
                    return res.status(401).json({ error: 'Dieser Benutzer gehört nicht zu dieser App/Instanz.' });
                }
            }

            const resolvedSubdomain = user.tenant?.subdomain || subdomain || '';

            const { password: _, ...userWithoutPassword } = user;
            return res.json({
                message: 'Login erfolgreich',
                user: userWithoutPassword,
                role: user.role,
                subdomain: resolvedSubdomain
            });
        }

        // If not in User table, check Customer table
        // We only allow customers to login to a specific subdomain
        if (subdomain) {
            const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
            if (tenant) {
                const customer = await prisma.customer.findFirst({
                    where: {
                        email,
                        tenantId: tenant.id
                    }
                });

                if (customer) {
                    if (!customer.password || customer.password !== password) {
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

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Interner Serverfehler beim Login' });
    }
});

// GET current user info (for security settings)
router.get('/me', async (req: TenantRequest, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Benutzerdaten' });
    }
});

// POST change password
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Aktuelles Passwort ist erforderlich'),
    newPassword: z.string().min(6, 'Neues Passwort muss mindestens 6 Zeichen lang sein'),
});

router.post('/change-password', async (req: TenantRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        // Verify current password
        if (!user.password || user.password !== currentPassword) {
            return res.status(401).json({ error: 'Aktuelles Passwort ist falsch.' });
        }

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: newPassword }
        });

        res.json({ message: 'Passwort erfolgreich geändert.' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Fehler beim Ändern des Passworts' });
    }
});

export default router;
