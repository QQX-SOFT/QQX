"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
// GET all templates
router.get('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const templates = await index_1.prisma.contractTemplate.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(templates);
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Vorlagen' });
    }
});
// GET single template
router.get('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const template = await index_1.prisma.contractTemplate.findUnique({
            where: { id, tenantId }
        });
        if (!template)
            return res.status(404).json({ error: 'Vorlage nicht gefunden' });
        res.json(template);
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Vorlage' });
    }
});
// POST create template
router.post('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const { name, description, content, type, driverType } = req.body;
        const template = await index_1.prisma.contractTemplate.create({
            data: {
                tenantId,
                name,
                description,
                content,
                type,
                driverType: driverType || null
            }
        });
        res.status(201).json(template);
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Erstellen der Vorlage' });
    }
});
// PATCH update template
router.patch('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const { name, description, content, type, driverType } = req.body;
        const template = await index_1.prisma.contractTemplate.update({
            where: { id, tenantId },
            data: {
                name,
                description,
                content,
                type,
                driverType: driverType || null
            }
        });
        res.json(template);
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren der Vorlage' });
    }
});
// DELETE template
router.delete('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        await index_1.prisma.contractTemplate.delete({
            where: { id, tenantId }
        });
        res.json({ message: 'Vorlage gelöscht' });
    }
    catch (error) {
        res.status(500).json({ error: 'Fehler beim Löschen der Vorlage' });
    }
});
exports.default = router;
