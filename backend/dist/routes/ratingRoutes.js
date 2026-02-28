"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const ratingSchema = zod_1.z.object({
    driverId: zod_1.z.string(),
    stars: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().optional(),
});
// GET ratings for a driver
router.get('/driver/:id', async (req, res) => {
    const { tenantId } = req;
    try {
        const ratings = await index_1.prisma.rating.findMany({
            where: {
                driverId: req.params.id,
                driver: { tenantId }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ratings);
    }
    catch (error) {
        res.status(500).json({ error: 'Bewertungen konnten nicht geladen werden' });
    }
});
// POST create rating
router.post('/', async (req, res) => {
    const { tenantId } = req;
    try {
        const validatedData = ratingSchema.parse(req.body);
        // Security check
        const driver = await index_1.prisma.driver.findFirst({
            where: { id: validatedData.driverId, tenantId }
        });
        if (!driver) {
            return res.status(403).json({ error: 'Nicht autorisiert für diesen Fahrer' });
        }
        const rating = await index_1.prisma.rating.create({
            data: validatedData
        });
        res.status(201).json(rating);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Bewertung konnte nicht erstellt werden' });
    }
});
exports.default = router;
