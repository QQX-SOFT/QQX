import express, { Router, Response } from 'express';
import { prisma } from '../index';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

// GET all contracts
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const contracts = await prisma.contract.findMany({
            where: { tenantId },
            include: {
                driver: true,
                customer: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(contracts);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Verträge' });
    }
});

// GET single contract
router.get('/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const contract = await prisma.contract.findUnique({
            where: { id, tenantId },
            include: {
                driver: true,
                customer: true
            }
        });
        if (!contract) return res.status(404).json({ error: 'Vertrag nicht gefunden' });
        res.json(contract);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden des Vertrags' });
    }
});

// POST create contract
router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const {
            title,
            description,
            type,
            status,
            startDate,
            endDate,
            driverId,
            customerId,
            fileUrl
        } = req.body;

        const contract = await prisma.contract.create({
            data: {
                tenantId,
                title,
                description,
                type,
                status,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                driverId,
                customerId,
                fileUrl
            }
        });

        res.status(201).json(contract);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Erstellen des Vertrags' });
    }
});

// PATCH update contract
router.patch('/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const {
            title,
            description,
            type,
            status,
            startDate,
            endDate,
            driverId,
            customerId,
            fileUrl
        } = req.body;

        const contract = await prisma.contract.update({
            where: { id, tenantId },
            data: {
                title,
                description,
                type,
                status,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                driverId,
                customerId,
                fileUrl
            }
        });

        res.json(contract);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Vertrags' });
    }
});

// DELETE contract
router.delete('/:id', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        await prisma.contract.delete({
            where: { id, tenantId }
        });

        res.json({ message: 'Vertrag gelöscht' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Löschen des Vertrags' });
    }
});

export default router;
