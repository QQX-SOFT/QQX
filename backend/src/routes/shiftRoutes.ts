import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { TenantRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// SCHEMAS
const areaSchema = z.object({
  name: z.string(),
  city: z.string().optional(),
  zipCodes: z.string().optional(),
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
