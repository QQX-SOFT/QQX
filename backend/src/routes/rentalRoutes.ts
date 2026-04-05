import express, { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

const rentalSchema = z.object({
    vehicleId: z.string().uuid(),
    driverId: z.string().uuid(),
    startDate: z.string(),
    expectedEndDate: z.string().optional().nullable(),
    dailyRate: z.number().min(0),
    notes: z.string().optional().nullable(),
});

// GET all rentals for the tenant
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const rentals = await prisma.rental.findMany({
            where: { tenantId },
            include: {
                vehicle: true,
                driver: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rentals);
    } catch (e) {
        res.status(500).json({ error: 'Mietverträge konnten nicht geladen werden' });
    }
});

// POST create new rental
router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    if (!tenantId) return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });

    try {
        const validated = rentalSchema.parse(req.body);

        // Check if vehicle is available
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: validated.vehicleId }
        });

        if (!vehicle || vehicle.status !== 'AVAILABLE') {
            return res.status(400).json({ error: 'Fahrzeug ist nicht verfügbar' });
        }

        const rental = await prisma.rental.create({
            data: {
                ...validated,
                startDate: new Date(validated.startDate),
                expectedEndDate: validated.expectedEndDate ? new Date(validated.expectedEndDate) : null,
                tenantId,
                status: 'ACTIVE'
            },
            include: { vehicle: true, driver: true }
        });

        // Update vehicle status
        await prisma.vehicle.update({
            where: { id: validated.vehicleId },
            data: { status: 'IN_USE' }
        });

        res.status(201).json(rental);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Mietvertrag konnte nicht erstellt werden' });
    }
});

// PATCH end rental
router.patch('/:id/end', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { id } = req.params;

    try {
        const rental = await prisma.rental.findFirst({
            where: { id, tenantId }
        });

        if (!rental) return res.status(404).json({ error: 'Mietvertrag nicht gefunden' });

        const actualEndDate = new Date();
        const days = Math.max(1, Math.ceil((actualEndDate.getTime() - rental.startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const totalAmount = days * rental.dailyRate;

        const updatedRental = await prisma.rental.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                actualEndDate,
                totalAmount
            }
        });

        // Free the vehicle
        await prisma.vehicle.update({
            where: { id: rental.vehicleId },
            data: { status: 'AVAILABLE' }
        });

        res.json(updatedRental);
    } catch (e) {
        res.status(500).json({ error: 'Mietvertrag konnte nicht beendet werden' });
    }
});

export default router;
