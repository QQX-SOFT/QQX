"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
// GET all payouts for a tenant
router.get('/payouts', async (req, res) => {
    try {
        const payouts = await index_1.prisma.payout.findMany({
            where: {
                driver: { tenantId: req.tenantId }
            },
            include: { driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payouts);
    }
    catch (error) {
        res.status(500).json({ error: 'Auszahlungen konnten nicht geladen werden' });
    }
});
// POST request payout
router.post('/payouts', async (req, res) => {
    const { driverId, amount, notes } = req.body;
    try {
        const payout = await index_1.prisma.payout.create({
            data: {
                driverId,
                amount,
                notes,
                status: 'PENDING'
            }
        });
        res.status(201).json(payout);
    }
    catch (error) {
        res.status(500).json({ error: 'Auszahlungsantrag fehlgeschlagen' });
    }
});
// PATCH approve/reject payout
router.patch('/payouts/:id', async (req, res) => {
    const { status } = req.body;
    try {
        const payout = await index_1.prisma.payout.update({
            where: { id: req.params.id },
            data: { status }
        });
        // If approved and paid, adjust driver wallet balance
        if (status === 'PAID') {
            await index_1.prisma.driver.update({
                where: { id: payout.driverId },
                data: {
                    walletBalance: { decrement: payout.amount }
                }
            });
            await index_1.prisma.walletHistory.create({
                data: {
                    driverId: payout.driverId,
                    amount: payout.amount,
                    type: 'PAYOUT',
                    description: `Auszahlung #${payout.id.slice(0, 8)}`
                }
            });
        }
        res.json(payout);
    }
    catch (error) {
        res.status(500).json({ error: 'Auszahlung konnte nicht aktualisiert werden' });
    }
});
exports.default = router;
