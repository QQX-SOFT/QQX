"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const vehicleSchema = zod_1.z.object({
    licensePlate: zod_1.z.string().min(2),
    make: zod_1.z.string().min(2),
    model: zod_1.z.string().min(2),
    milage: zod_1.z.number().int().nonnegative().default(0),
    nextMaintenance: zod_1.z.string().optional().nullable(), // ISO String
});
// GET all vehicles for a specific tenant
router.get('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const vehicles = await index_1.prisma.vehicle.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(vehicles);
    }
    catch (error) {
        res.status(500).json({ error: 'Fahrzeuge konnten nicht geladen werden' });
    }
});
// POST create vehicle
router.post('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const validatedData = vehicleSchema.parse(req.body);
        const vehicle = await index_1.prisma.vehicle.create({
            data: {
                ...validatedData,
                nextMaintenance: validatedData.nextMaintenance ? new Date(validatedData.nextMaintenance) : null,
                tenantId: tenantId,
            }
        });
        res.status(201).json(vehicle);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Fahrzeug konnte nicht erstellt werden' });
    }
});
// PATCH update vehicle status
router.patch('/:id/status', async (req, res) => {
    const { tenantId } = req;
    const { status, nextMaintenance } = req.body;
    try {
        const vehicle = await index_1.prisma.vehicle.update({
            where: { id: req.params.id, tenantId: tenantId },
            data: {
                status: status,
                ...(nextMaintenance && { nextMaintenance: new Date(nextMaintenance) })
            }
        });
        res.json(vehicle);
    }
    catch (error) {
        res.status(500).json({ error: 'Fahrzeugstatus konnte nicht aktualisiert werden' });
    }
});
exports.default = router;
