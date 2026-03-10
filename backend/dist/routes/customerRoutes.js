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
    const { tenantId, subdomain } = req;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const { name, contactPerson, email, phone, address, password } = req.body;
        const customerData = {
            name,
            tenantId: tenantId
        };
        if (contactPerson)
            customerData.contactPerson = contactPerson;
        if (email)
            customerData.email = email;
        if (phone)
            customerData.phone = phone;
        if (address)
            customerData.address = address;
        if (password)
            customerData.password = password;
        // Optionally, create a user if credentials are provided so they can log in
        if (email && password) {
            // Check if user already exists
            const existingUser = await index_1.prisma.user.findFirst({ where: { email } });
            if (!existingUser) {
                await index_1.prisma.user.create({
                    data: {
                        email,
                        password, // Should be hashed in production
                        role: 'CUSTOMER_ADMIN',
                        tenantId: tenantId,
                        clerkId: `customer-${Date.now()}`
                    }
                });
            }
        }
        const customer = await index_1.prisma.customer.create({
            data: customerData
        });
        res.status(201).json(customer);
    }
    catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ error: 'Kunde konnte nicht erstellt werden. ' + (error instanceof Error ? error.message : String(error)) });
    }
});
// PATCH update customer
router.patch('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const { name, contactPerson, email, phone, address, password } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (contactPerson !== undefined)
            updateData.contactPerson = contactPerson;
        if (email !== undefined)
            updateData.email = email;
        if (phone !== undefined)
            updateData.phone = phone;
        if (address !== undefined)
            updateData.address = address;
        if (password)
            updateData.password = password;
        const customer = await index_1.prisma.customer.update({
            where: { id, tenantId: tenantId },
            data: updateData
        });
        res.json(customer);
    }
    catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ error: 'Kunde konnte nicht aktualisiert werden. ' + (error instanceof Error ? error.message : String(error)) });
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
