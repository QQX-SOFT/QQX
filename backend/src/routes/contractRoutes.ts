import express, { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
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
            fileUrl,
            content,
            templateId
        } = req.body;

        const contract = await prisma.contract.create({
            data: {
                tenantId,
                title,
                description,
                content,
                type,
                status,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                driverId,
                customerId,
                fileUrl,
                templateId
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
            fileUrl,
            content,
            templateId
        } = req.body;

        const contract = await prisma.contract.update({
            where: { id, tenantId },
            data: {
                title,
                description,
                content,
                type,
                status,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                driverId,
                customerId,
                fileUrl,
                templateId
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

import crypto from 'crypto';

// ... existing code ...

// SHARE contract (Generate token and return link)
router.post('/:id/share', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) return res.status(400).json({ error: 'Context missing' });

    try {
        const token = crypto.randomBytes(32).toString('hex');
        const contract = await prisma.contract.update({
            where: { id, tenantId },
            data: { shareToken: token }
        });

        // In a real app, send email here. For now, return the link.
        const signingLink = `https://fastroute.qqxsoft.com/sign/${token}`;
        console.log(`[Contract] Sending signing link: ${signingLink}`);
        
        res.json({ success: true, signingLink });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Freigeben' });
    }
});

// PUBLIC: Get contract by token
router.get('/public/:token', async (req: Request, res: Response) => {
    const { token } = req.params;
    try {
        const contract = await prisma.contract.findUnique({
            where: { shareToken: token },
            include: { 
                driver: true,
                tenant: { select: { name: true } }
            }
        });
        if (!contract) return res.status(404).json({ error: 'Vertrag nicht gefunden oder abgelaufen' });
        res.json(contract);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

// PUBLIC: Sign contract
router.post('/public/:token/sign', async (req: Request, res: Response) => {
    const { token } = req.params;
    const { signatureImage } = req.body; // Base64 image

    try {
        const contract = await prisma.contract.update({
            where: { shareToken: token },
            data: {
                isSigned: true,
                signatureImageUrl: signatureImage,
                signedAt: new Date(),
                status: 'ACTIVE'
            }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Signierung fehlgeschlagen' });
    }
});

export default router;
