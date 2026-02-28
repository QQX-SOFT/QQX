"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const invoiceSchema = zod_1.z.object({
    driverId: zod_1.z.string(),
    amount: zod_1.z.number(),
    period: zod_1.z.string(),
});
// GET all invoices for a tenant
router.get('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const invoices = await index_1.prisma.invoice.findMany({
            where: { tenantId: tenantId },
            include: { driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Rechnungen' });
    }
});
// POST create invoice
router.post('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const { driverId, amount, period } = invoiceSchema.parse(req.body);
        const invoice = await index_1.prisma.invoice.create({
            data: {
                amount,
                period,
                status: 'PENDING',
                driverId,
                tenantId: tenantId,
                invoiceNumber: `INV-${Date.now()}`
            }
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Fehler beim Erstellen der Rechnung' });
    }
});
// PATCH update invoice status
router.patch('/:id/status', async (req, res) => {
    const { tenantId } = req;
    const { status } = req.body;
    try {
        const invoice = await index_1.prisma.invoice.update({
            where: {
                id: req.params.id,
                tenantId: tenantId // Security
            },
            data: { status }
        });
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: 'Status konnte nicht aktualisiert werden' });
    }
});
exports.default = router;
