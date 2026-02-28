"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const complaintSchema = zod_1.z.object({
    driverId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    penalty: zod_1.z.number().optional().default(0),
});
// GET all complaints for a tenant
router.get('/', async (req, res) => {
    const { tenantId } = req;
    try {
        const complaints = await index_1.prisma.complaint.findMany({
            where: { tenantId },
            include: { driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(complaints);
    }
    catch (error) {
        res.status(500).json({ error: 'Reklamationen konnten nicht geladen werden' });
    }
});
// POST create complaint
router.post('/', async (req, res) => {
    const { tenantId } = req;
    try {
        const validatedData = complaintSchema.parse(req.body);
        const complaint = await index_1.prisma.complaint.create({
            data: {
                ...validatedData,
                tenantId: tenantId,
            }
        });
        res.status(201).json(complaint);
    }
    catch (error) {
        res.status(500).json({ error: 'Reklamation konnte nicht erstellt werden' });
    }
});
// PATCH resolve explanation
router.patch('/:id/resolve', async (req, res) => {
    const { tenantId } = req;
    const { explanation, status, penalty } = req.body;
    try {
        const complaint = await index_1.prisma.complaint.update({
            where: { id: req.params.id, tenantId: tenantId },
            data: {
                explanation,
                status,
                penalty
            }
        });
        res.json(complaint);
    }
    catch (error) {
        res.status(500).json({ error: 'Reklamation konnte nicht aktualisiert werden' });
    }
});
exports.default = router;
