import express, { Response } from 'express';
import { z } from 'zod';
import { TenantRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// SCHEMAS
const areaSchema = z.object({
  name: z.string(),
  city: z.string().optional(),
  zipCodes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().default(500),
});

const shiftSchema = z.object({
  areaId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  maxDrivers: z.number().default(1),
  notes: z.string().optional(),
});

// AREAS
router.get('/areas', async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  if (!tenantId) return res.status(400).json({ error: 'Context missing' });
  
  const areas = await prisma.shiftArea.findMany({
    where: { tenantId: tenantId as string },
    orderBy: { name: 'asc' }
  });
  res.json(areas);
});

router.post('/areas', async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  if (!tenantId) return res.status(400).json({ error: 'Context missing' });

  try {
    const data = areaSchema.parse(req.body);
    const area = await prisma.shiftArea.create({
      data: { ...data, tenantId: tenantId as string }
    });
    res.json(area);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ASSIGNMENTS
router.get('/my-shifts', async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  const userId = req.headers['x-user-id'] as string;
  
  if (!tenantId || !userId) return res.status(400).json({ error: 'Context missing' });

  const driver = await prisma.driver.findFirst({ 
    where: { userId, tenantId: tenantId as string } 
  });
  if (!driver) return res.status(404).json({ error: 'Driver profile missing' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const assignments = await prisma.shiftAssignment.findMany({
      where: {
          driverId: driver.id,
          shift: {
              startTime: { gte: today, lt: tomorrow },
          }
      },
      include: {
          shift: {
              include: { area: true }
          }
      }
  });

  res.json(assignments.map(a => a.shift));
});

// GET available shifts for booking (for drivers)
router.get('/available', async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  const userId = req.headers['x-user-id'] as string;
  
  if (!tenantId || !userId) return res.status(400).json({ error: 'Context missing' });

  const driver = await prisma.driver.findFirst({ 
      where: { userId, tenantId: tenantId as string } 
  });
  if (!driver) return res.status(404).json({ error: 'Driver profile missing' });

  // Filter by driver area if set, otherwise all in tenant
  const shifts = await prisma.shift.findMany({
      where: {
          tenantId: tenantId as string,
          status: 'OPEN',
          startTime: { gte: new Date() },
          ...(driver.preferredAreaId ? { areaId: driver.preferredAreaId } : {}),
          // Don't show shifts they are already assigned to
          assignments: {
              none: { driverId: driver.id }
          }
      },
      include: { area: true, assignments: true },
      orderBy: { startTime: 'asc' }
  });

  res.json(shifts);
});

// POST book shift
router.post('/:id/book', async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { tenantId } = req;
  const userId = req.headers['x-user-id'] as string;

  const driver = await prisma.driver.findFirst({ 
      where: { userId, tenantId: tenantId as string } 
  });
  if (!driver) return res.status(404).json({ error: 'Driver profile missing' });

  try {
      const shift = await prisma.shift.findUnique({
          where: { id },
          include: { assignments: true }
      });

      if (!shift || shift.status === 'FULL') return res.status(400).json({ error: 'Schicht ist nicht verfügbar.' });

      const assignment = await prisma.shiftAssignment.create({
          data: {
              shiftId: id,
              driverId: driver.id,
              status: 'CONFIRMED'
          }
      });

      // Update shift status if full
      if (shift.assignments.length + 1 >= shift.maxDrivers) {
          await prisma.shift.update({
              where: { id },
              data: { status: 'FULL' }
          });
      }

      res.json(assignment);
  } catch (e: any) {
      res.status(400).json({ error: e.message });
  }
});

// SHIFTS
router.get('/', async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  const { areaId, from, to } = req.query;
  if (!tenantId) return res.status(400).json({ error: 'Context missing' });

  const shifts = await prisma.shift.findMany({
    where: {
      tenantId: tenantId as string,
      ...(areaId ? { areaId: areaId as string } : {}),
      ...(from || to ? {
        startTime: {
          ...(from ? { gte: new Date(from as string) } : {}),
          ...(to ? { lte: new Date(to as string) } : {}),
        }
      } : {})
    },
    include: {
      area: true,
      assignments: {
        include: { driver: true }
      }
    },
    orderBy: { startTime: 'asc' }
  });
  res.json(shifts);
});

router.post('/', async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  if (!tenantId) return res.status(400).json({ error: 'Context missing' });

  try {
    const data = shiftSchema.parse(req.body);
    const shift = await prisma.shift.create({
      data: {
        ...data,
        tenantId: tenantId as string,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime)
      }
    });
    res.json(shift);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ASSIGNMENTS
router.post('/:id/assign', async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { driverId } = req.body;

  try {
    const assignment = await prisma.shiftAssignment.create({
      data: {
        shiftId: id,
        driverId: driverId,
        status: 'CONFIRMED'
      }
    });

    // Check if full
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: { assignments: true }
    });

    if (shift && shift.assignments.length >= shift.maxDrivers) {
      await prisma.shift.update({
        where: { id },
        data: { status: 'FULL' }
      });
    }

    res.json(assignment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: TenantRequest, res: Response) => {
  try {
    await prisma.shift.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

export default router;
