"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const documentSchema = zod_1.z.object({
    driverId: zod_1.z.string(),
    type: zod_1.z.enum(['LICENSE', 'INSURANCE', 'TAX_ID', 'BUSINESS_REG', 'OTHER']),
    title: zod_1.z.string(),
    fileUrl: zod_1.z.string(),
    expiryDate: zod_1.z.string().optional().nullable(),
});
// GET all documents for a tenant's drivers
router.get('/', async (req, res) => {
    const { tenantId } = req;
    try {
        const documents = await index_1.prisma.document.findMany({
            where: {
                driver: { tenantId }
            },
            include: { driver: true },
            orderBy: { expiryDate: 'asc' }
        });
        res.json(documents);
    }
    catch (error) {
        res.status(500).json({ error: 'Dokumente konnten nicht geladen werden' });
    }
});
// GET documents for specific driver
router.get('/driver/:driverId', async (req, res) => {
    try {
        const documents = await index_1.prisma.document.findMany({
            where: {
                driverId: req.params.driverId,
                driver: { tenantId: req.tenantId }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    }
    catch (error) {
        res.status(500).json({ error: 'Fahrerdokumente konnten nicht geladen werden' });
    }
});
// POST create document
router.post('/', async (req, res) => {
    try {
        const validatedData = documentSchema.parse(req.body);
        const document = await index_1.prisma.document.create({
            data: {
                ...validatedData,
                expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
            }
        });
        res.status(201).json(document);
    }
    catch (error) {
        res.status(500).json({ error: 'Dokument konnte nicht gespeichert werden' });
    }
});
exports.default = router;
