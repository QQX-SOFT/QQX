import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

// GET all payouts for a tenant
router.get('/payouts', async (req: TenantRequest, res: Response) => {
    try {
        const payouts = await prisma.payout.findMany({
            where: {
                driver: { tenantId: req.tenantId }
            },
            include: { driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ error: 'Auszahlungen konnten nicht geladen werden' });
    }
});

// POST request payout
router.post('/payouts', async (req: TenantRequest, res: Response) => {
    const { driverId, amount, notes } = req.body;
    try {
        const payout = await prisma.payout.create({
            data: {
                driverId,
                amount,
                notes,
                status: 'PENDING'
            }
        });
        res.status(201).json(payout);
    } catch (error) {
        res.status(500).json({ error: 'Auszahlungsantrag fehlgeschlagen' });
    }
});

// PATCH approve/reject payout
router.patch('/payouts/:id', async (req: TenantRequest, res: Response) => {
    const { status } = req.body;
    try {
        const payout = await prisma.payout.update({
            where: { id: req.params.id as string },
            data: { status }
        });

        // If approved and paid, adjust driver wallet balance
        if (status === 'PAID') {
            await prisma.driver.update({
                where: { id: payout.driverId },
                data: {
                    walletBalance: { decrement: payout.amount }
                }
            });

            await prisma.walletHistory.create({
                data: {
                    driverId: payout.driverId,
                    amount: payout.amount,
                    type: 'PAYOUT',
                    description: `Auszahlung #${payout.id.slice(0, 8)}`
                }
            });
        }

        res.json(payout);
    } catch (error) {
        res.status(500).json({ error: 'Auszahlung konnte nicht aktualisiert werden' });
    }
});

export default router;
