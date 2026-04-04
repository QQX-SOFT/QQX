import express, { Router, Response, Request } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';
import bcrypt from 'bcryptjs';

const router = Router();

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

router.post('/login', async (req: TenantRequest, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const subdomain = req.headers['x-tenant-subdomain'] as string;

        console.log(`[LOGIN ATTEMPT] Email: ${email}, Header Subdomain: ${subdomain || 'NONE'}`);

        // Find user by email (SUPER_ADMIN, CUSTOMER_ADMIN, DRIVER) - Case-insensitive
        let user = await prisma.user.findFirst({
            where: { 
                email: { equals: email, mode: 'insensitive' } 
            },
            include: {
                tenant: true,
                driver: true // Include driver profile to get firstName/lastName
            }
        });

        if (user) {
            console.log(`[LOGIN] User found: ${user.email}, Role: ${user.role}, User Tenant: ${user.tenant?.subdomain || 'NONE'}`);

            // Check password using bcrypt
            const passwordMatch = user.password ? bcrypt.compareSync(password, user.password) : false;
            if (!passwordMatch) {
                console.warn(`[LOGIN] Password mismatch for ${email}`);
                return res.status(401).json({ error: 'E-Mail oder Passwort falsch.' });
            }

            // Trust the user's tenant from DB over the header during login
            const resolvedSubdomain = user.tenant?.subdomain || subdomain || '';

            const { password: _, ...userWithoutPassword } = user;
            
            // Flatten driver name for convenience in mobile/apps
            const finalUser = {
                ...userWithoutPassword,
                firstName: user.driver?.firstName,
                lastName: user.driver?.lastName
            };

            console.log(`[LOGIN SUCCESS] User: ${user.email}, Resolved Subdomain: ${resolvedSubdomain}`);
            return res.json({
                message: 'Login erfolgreich',
                user: finalUser,
                role: user.role,
                subdomain: resolvedSubdomain
            });
        }

        console.warn(`[LOGIN] No user found with email: ${email}`);

        // If not in User table, check Customer table
        // We only allow customers to login to a specific subdomain
        if (subdomain) {
            const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
            if (tenant) {
                const customer = await prisma.customer.findFirst({
                    where: {
                        email: { equals: email, mode: 'insensitive' },
                        tenantId: tenant.id
                    }
                });

                if (customer) {
                    // Check password using bcrypt
                    if (!customer.password || !bcrypt.compareSync(password, customer.password)) {
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
        console.error('--- LOGIN ERROR ---');
        console.error(error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ 
            error: 'Ein interner Serverfehler ist aufgetreten.', 
            details: error instanceof Error ? error.stack : JSON.stringify(error) 
        });
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

        // Verify current password using bcrypt
        if (!user.password || !bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(401).json({ error: 'Aktuelles Passwort ist falsch.' });
        }

        // Update password with hash
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
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
