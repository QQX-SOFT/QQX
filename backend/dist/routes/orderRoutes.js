"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const orderSchema = zod_1.z.object({
    customerName: zod_1.z.string().optional(),
    customerPhone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    amount: zod_1.z.number().optional().default(0),
    source: zod_1.z.string().default("DIRECT"),
    externalId: zod_1.z.string().optional(),
    // New Fields
    senderName: zod_1.z.string().optional(),
    senderAddress: zod_1.z.string().optional(),
    recipientName: zod_1.z.string().optional(),
    recipientAddress: zod_1.z.string().optional(),
    packageInfo: zod_1.z.string().optional(),
    serviceType: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    driverId: zod_1.z.string().optional(),
    customerId: zod_1.z.string().optional(),
});
// GET all orders for a tenant
router.get('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const orders = await index_1.prisma.order.findMany({
            where: { tenantId },
            include: { driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Bestellungen konnten nicht geladen werden' });
    }
});
// POST create order
router.post('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const validatedData = orderSchema.parse(req.body);
        const order = await index_1.prisma.order.create({
            data: {
                ...validatedData,
                tenantId: tenantId,
            }
        });
        res.status(201).json(order);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Bestellung konnte nicht erstellt werden' });
    }
});
// PATCH assign driver
router.patch('/:id/assign', async (req, res) => {
    const { tenantId } = req;
    const { driverId } = req.body;
    try {
        const order = await index_1.prisma.order.update({
            where: { id: req.params.id, tenantId },
            data: {
                driverId,
                status: 'ACCEPTED',
                assignedAt: new Date()
            }
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Fahrer konnte nicht zugewiesen werden' });
    }
});
// PATCH update status
router.patch('/:id/status', async (req, res) => {
    const { tenantId } = req;
    const { status, deliveryPhoto, deliverySig, confirmCode } = req.body;
    try {
        const order = await index_1.prisma.order.update({
            where: { id: req.params.id, tenantId },
            data: {
                status: status,
                deliveryPhoto,
                deliverySig,
                confirmCode,
                ...(status === 'DELIVERED' && { deliveredAt: new Date() })
            }
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Status konnte nicht aktualisiert werden' });
    }
});
exports.default = router;
