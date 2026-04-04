import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = express.Router();

const applicationSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  employmentType: z.string(),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  ssn: z.string().optional(),
  taxId: z.string().optional(),
  gisaNumber: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
});

// PUBLIC: Submit application
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = applicationSchema.parse(req.body);
    const tenantId = req.headers['x-tenant-id'] as string; // Optional if we want to tie to a tenant via header

    const application = await prisma.driverApplication.create({
      data: {
        ...validatedData,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
        tenantId: tenantId || null
      }
    });

    res.status(201).json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Create application error:", error);
    res.status(500).json({ error: 'Bewerbung konnte nicht gesendet werden' });
  }
});

// ADMIN: Get all applications for tenant
router.get('/', async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  if (!tenantId) return res.status(400).json({ error: 'Context missing' });

  try {
    const applications = await prisma.driverApplication.findMany({
      where: { 
        OR: [
          { tenantId: tenantId as string },
          { tenantId: null } // Also show global applications maybe?
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden' });
  }
});

// ADMIN: Update status
router.patch('/:id/status', async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const updated = await prisma.driverApplication.update({
      where: { id },
      data: { status, notes }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Update' });
  }
});

export default router;
