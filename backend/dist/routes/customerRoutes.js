"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
// GET all customers
router.get('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const customers = await index_1.prisma.customer.findMany({
            where: { tenantId: tenantId },
            orderBy: { name: 'asc' }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'Kunden konnten nicht geladen werden' });
    }
});
// GET single customer
router.get('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    try {
        const customer = await index_1.prisma.customer.findFirst({
            where: { id, tenantId: tenantId }
        });
        if (!customer)
            return res.status(404).json({ error: 'Kunde nicht gefunden' });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Kunde konnte nicht geladen werden' });
    }
});
// POST create customer
router.post('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const customer = await index_1.prisma.customer.create({
            data: {
                ...req.body,
                tenantId: tenantId
            }
        });
        res.status(201).json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Kunde konnte nicht erstellt werden' });
    }
});
// PATCH update customer
router.patch('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const customer = await index_1.prisma.customer.update({
            where: { id, tenantId: tenantId },
            data: req.body
        });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Kunde konnte nicht aktualisiert werden' });
    }
});
// DELETE customer
router.delete('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    try {
        await index_1.prisma.customer.delete({
            where: { id, tenantId: tenantId }
        });
        res.json({ message: 'Kunde gelöscht' });
    }
    catch (error) {
        res.status(500).json({ error: 'Kunde konnte nicht gelöscht werden' });
    }
});
exports.default = router;
