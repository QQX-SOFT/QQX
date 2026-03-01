"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const driverSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    phone: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().email().optional().nullable(),
    birthday: zod_1.z.string().optional().nullable(),
    employmentType: zod_1.z.enum(['ECHTER_DIENSTNEHMER', 'FREIER_DIENSTNEHMER', 'SELBSTSTANDIG']).optional(),
    street: zod_1.z.string().optional().nullable(),
    zip: zod_1.z.string().optional().nullable(),
    city: zod_1.z.string().optional().nullable(),
    ssn: zod_1.z.string().optional().nullable(),
    taxId: zod_1.z.string().optional().nullable(),
    iban: zod_1.z.string().optional().nullable(),
    bic: zod_1.z.string().optional().nullable(),
    password: zod_1.z.string().optional().nullable(),
});
// GET all drivers
router.get('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const drivers = await index_1.prisma.driver.findMany({
            where: { tenantId: tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: true
            }
        });
        res.json(drivers);
    }
    catch (error) {
        res.status(500).json({ error: 'Fahrer konnten nicht geladen werden' });
    }
});
// GET single driver
router.get('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const driver = await index_1.prisma.driver.findFirst({
            where: { id, tenantId: tenantId },
            include: {
                user: true,
                documents: true,
                ratings: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!driver) {
            return res.status(404).json({ error: 'Fahrer nicht gefunden' });
        }
        res.json(driver);
    }
    catch (error) {
        res.status(500).json({ error: 'Fahrer konnte nicht geladen werden' });
    }
});
// POST create driver
router.post('/', async (req, res) => {
    const { tenantId, subdomain } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const validatedData = driverSchema.parse(req.body);
        // Map frontend employmentType to Prisma DriverType
        let prismaType = 'EMPLOYED';
        if (validatedData.employmentType === 'FREIER_DIENSTNEHMER')
            prismaType = 'FREELANCE';
        if (validatedData.employmentType === 'SELBSTSTANDIG')
            prismaType = 'COMMERCIAL';
        const user = await index_1.prisma.user.create({
            data: {
                email: validatedData.email || `${validatedData.firstName.toLowerCase()}.${validatedData.lastName.toLowerCase()}@${subdomain || 'qqx'}.local`,
                clerkId: `manual-${Date.now()}`,
                password: validatedData.password, // Ideally hash this
                role: 'DRIVER',
                tenantId: tenantId
            }
        });
        const driver = await index_1.prisma.driver.create({
            data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                phone: validatedData.phone,
                birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
                type: prismaType,
                street: validatedData.street,
                zip: validatedData.zip,
                city: validatedData.city,
                ssn: validatedData.ssn,
                taxId: validatedData.taxId,
                iban: validatedData.iban,
                bic: validatedData.bic,
                tenantId: tenantId,
                userId: user.id
            },
            include: {
                user: true
            }
        });
        res.status(201).json(driver);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error("Create driver error:", error);
        res.status(500).json({ error: 'Fahrer konnte nicht erstellt werden' });
    }
});
// PATCH update driver
router.patch('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const validatedData = driverSchema.partial().parse(req.body);
        const { password, ...driverData } = validatedData;
        const driver = await index_1.prisma.driver.findFirst({
            where: { id, tenantId: tenantId },
        });
        if (!driver)
            return res.status(404).json({ error: 'Fahrer nicht gefunden' });
        // Update Driver
        let prismaType = undefined;
        if (driverData.employmentType === 'ECHTER_DIENSTNEHMER')
            prismaType = 'EMPLOYED';
        if (driverData.employmentType === 'FREIER_DIENSTNEHMER')
            prismaType = 'FREELANCE';
        if (driverData.employmentType === 'SELBSTSTANDIG')
            prismaType = 'COMMERCIAL';
        const updatedDriver = await index_1.prisma.driver.update({
            where: { id },
            data: {
                ...driverData,
                birthday: driverData.birthday ? new Date(driverData.birthday) : undefined,
                type: prismaType,
            }
        });
        // Update User password if provided
        if (password) {
            await index_1.prisma.user.update({
                where: { id: driver.userId },
                data: { password }
            });
        }
        res.json(updatedDriver);
    }
    catch (error) {
        console.error("Update driver error:", error);
        res.status(500).json({ error: 'Fahrer konnte nicht aktualisiert werden' });
    }
});
// PATCH update driver status
router.patch('/:id/status', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    const { status } = req.body; // Expect ACTIVE or INACTIVE
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const driver = await index_1.prisma.driver.updateMany({
            where: { id, tenantId },
            data: { status }
        });
        if (driver.count === 0)
            return res.status(404).json({ error: 'Fahrer nicht gefunden' });
        res.json({ message: 'Status aktualisiert' });
    }
    catch (error) {
        res.status(500).json({ error: 'Status konnte nicht aktualisiert werden' });
    }
});
// DELETE driver (only if inactive)
router.delete('/:id', async (req, res) => {
    const { tenantId } = req;
    const { id } = req.params;
    if (!tenantId)
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    try {
        const driver = await index_1.prisma.driver.findFirst({
            where: { id, tenantId }
        });
        if (!driver)
            return res.status(404).json({ error: 'Fahrer nicht gefunden' });
        if (driver.status === 'ACTIVE') {
            return res.status(400).json({ error: 'Aktive Fahrer können nicht gelöscht werden. Bitte zuerst auf Passiv setzen.' });
        }
        await index_1.prisma.driver.delete({
            where: { id }
        });
        res.json({ message: 'Fahrer erfolgreich gelöscht' });
    }
    catch (error) {
        console.error("Delete driver error:", error);
        res.status(500).json({ error: 'Fahrer konnte nicht gelöscht werden' });
    }
});
exports.default = router;
