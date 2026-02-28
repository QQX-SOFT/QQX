"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const startSchema = zod_1.z.object({
    driverId: zod_1.z.string(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
});
const stopSchema = zod_1.z.object({
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
});
const locationUpdateSchema = zod_1.z.object({
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
});
// GET active entry for a driver
router.get('/active/:driverId', async (req, res) => {
    const { tenantId } = req;
    try {
        const entry = await index_1.prisma.timeEntry.findFirst({
            where: {
                driverId: req.params.driverId,
                driver: { tenantId: tenantId }, // Security: Verify driver belongs to tenant
                status: { in: ['RUNNING', 'PAUSED'] }
            }
        });
        res.json(entry);
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen des aktiven Zeiteintrags' });
    }
});
// POST start time
router.post('/start', async (req, res) => {
    const { tenantId } = req;
    try {
        const { driverId, lat, lng } = startSchema.parse(req.body);
        // Security check: Verify driver belongs to tenant
        const driver = await index_1.prisma.driver.findFirst({
            where: { id: driverId, tenantId }
        });
        if (!driver) {
            return res.status(403).json({ error: 'Nicht autorisiert für diesen Fahrer' });
        }
        // Check if already running
        const existing = await index_1.prisma.timeEntry.findFirst({
            where: { driverId, status: { in: ['RUNNING', 'PAUSED'] } }
        });
        if (existing) {
            return res.status(400).json({ error: 'Fahrer hat bereits eine aktive Schicht.' });
        }
        const entry = await index_1.prisma.timeEntry.create({
            data: {
                driverId,
                startTime: new Date(),
                startLat: lat,
                startLng: lng,
                status: 'RUNNING'
            }
        });
        res.status(201).json(entry);
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Starten der Schicht' });
    }
});
// PATCH stop time
router.patch('/stop/:id', async (req, res) => {
    const { tenantId } = req;
    try {
        const { lat, lng } = stopSchema.parse(req.body);
        // First find the entry to verify it belongs to this tenant
        const existing = await index_1.prisma.timeEntry.findFirst({
            where: {
                id: req.params.id,
                driver: { tenantId }
            }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Zeiteintrag nicht gefunden oder nicht autorisiert' });
        }
        const entry = await index_1.prisma.timeEntry.update({
            where: { id: req.params.id },
            data: {
                endTime: new Date(),
                endLat: lat,
                endLng: lng,
                status: 'COMPLETED'
            }
        });
        res.json(entry);
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Beenden der Schicht' });
    }
});
// PATCH current location
router.patch('/location/:id', async (req, res) => {
    const { tenantId } = req;
    try {
        const { lat, lng } = locationUpdateSchema.parse(req.body);
        const existing = await index_1.prisma.timeEntry.findFirst({
            where: {
                id: req.params.id,
                driver: { tenantId }
            }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Zeiteintrag nicht gefunden' });
        }
        const entry = await index_1.prisma.timeEntry.update({
            where: { id: req.params.id },
            data: {
                currentLat: lat,
                currentLng: lng
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Standort-Update fehlgeschlagen' });
    }
});
// GET latest location of all active drivers for a tenant
router.get('/locations', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const activeEntries = await index_1.prisma.timeEntry.findMany({
            where: {
                driver: { tenantId: tenantId },
                status: 'RUNNING'
            },
            include: {
                driver: true
            }
        });
        const locations = activeEntries.map((entry) => ({
            id: entry.id,
            driverId: entry.driverId,
            driverName: `${entry.driver.firstName} ${entry.driver.lastName}`,
            lat: entry.currentLat || entry.startLat,
            lng: entry.currentLng || entry.startLng,
            startTime: entry.startTime
        }));
        res.json(locations);
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Standorte' });
    }
});
exports.default = router;
