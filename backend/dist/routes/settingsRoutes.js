"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
// GET tenant settings
router.get('/', async (req, res) => {
    const { tenantId } = req;
    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }
    try {
        const tenant = await index_1.prisma.tenant.findUnique({
            where: { id: tenantId }
        });
        if (!tenant)
            return res.status(404).json({ error: 'Tenant not found' });
        res.json({
            name: tenant.name,
            subdomain: tenant.subdomain,
            createdAt: tenant.createdAt,
            // Configuration settings
            notificationsEnabled: tenant.notificationsEnabled,
            autoAssignDrivers: tenant.autoAssignDrivers,
            currency: tenant.currency,
            timezone: tenant.timezone,
            basePrice: tenant.basePrice,
            distanceMultiplier: tenant.distanceMultiplier,
            expressExtra: tenant.expressExtra,
            heavyPackageExtra: tenant.heavyPackageExtra,
            minPrice: tenant.minPrice,
            maxPrice: tenant.maxPrice,
            essenBasePrice: tenant.essenBasePrice,
            essenDistanceMultiplier: tenant.essenDistanceMultiplier,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Einstellungen konnten nicht geladen werden' });
    }
});
// PATCH update tenant
router.patch('/', async (req, res) => {
    const { tenantId } = req;
    const { name, notificationsEnabled, autoAssignDrivers, basePrice, distanceMultiplier, expressExtra, heavyPackageExtra, minPrice, maxPrice, essenBasePrice, essenDistanceMultiplier } = req.body;
    try {
        const tenant = await index_1.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: name !== undefined ? name : undefined,
                notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : undefined,
                autoAssignDrivers: autoAssignDrivers !== undefined ? autoAssignDrivers : undefined,
                basePrice: basePrice !== undefined ? Number(basePrice) : undefined,
                distanceMultiplier: distanceMultiplier !== undefined ? Number(distanceMultiplier) : undefined,
                expressExtra: expressExtra !== undefined ? Number(expressExtra) : undefined,
                heavyPackageExtra: heavyPackageExtra !== undefined ? Number(heavyPackageExtra) : undefined,
                minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
                maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
                essenBasePrice: essenBasePrice !== undefined ? Number(essenBasePrice) : undefined,
                essenDistanceMultiplier: essenDistanceMultiplier !== undefined ? Number(essenDistanceMultiplier) : undefined,
            }
        });
        res.json(tenant);
    }
    catch (error) {
        res.status(500).json({ error: 'Einstellungen konnten nicht aktualisiert werden' });
    }
});
exports.default = router;
