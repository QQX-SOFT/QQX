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
  hasWorkPermit: z.boolean().optional(),
  idCardUrl: z.string().optional().nullable(),
  licenseUrl: z.string().optional().nullable(),
  meldezettelUrl: z.string().optional().nullable(),
  eCardUrl: z.string().optional().nullable(),
  greyCardUrl: z.string().optional().nullable(),
  gisaExtractUrl: z.string().optional().nullable(),
  svsConfirmationUrl: z.string().optional().nullable(),
  businessRegUrl: z.string().optional().nullable(),
  acceptedTerms: z.boolean().optional(),
});

// PUBLIC: Submit application
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = applicationSchema.parse(req.body);
    const tenantId = req.headers['x-tenant-id'] as string; // Optional if we want to tie to a tenant via header

    const application = await (prisma as any).driverApplication.create({
      data: {
        ...validatedData,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
        tenantId: tenantId || null,
        acceptedTerms: validatedData.acceptedTerms || false
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
    const applications = await (prisma as any).driverApplication.findMany({
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

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ... existing code ...

// ADMIN: Update status
router.patch('/:id/status', async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const updated = await (prisma as any).driverApplication.update({
      where: { id },
      data: { status, notes }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Update' });
  }
});

// ADMIN: Approve and Convert to Driver
router.post('/:id/approve', async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { tenantId, subdomain } = req;

  if (!tenantId) return res.status(400).json({ error: 'Context missing' });

  try {
    const app = await (prisma as any).driverApplication.findUnique({ where: { id } });
    if (!app) return res.status(404).json({ error: 'Bewerbung nicht gefunden' });

    // 1. Create User
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = bcrypt.hashSync(tempPassword, 10);
    
    const user = await prisma.user.create({
      data: {
        email: app.email,
        clerkId: `app-${id}`,
        password: hashedPassword,
        role: 'DRIVER',
        tenantId: tenantId as string
      }
    });

    // 2. Map type
    let prismaType: 'EMPLOYED' | 'FREELANCE' | 'COMMERCIAL' = 'EMPLOYED';
    if (app.employmentType === 'FREIER_DIENSTNEHMER') prismaType = 'FREELANCE';
    if (app.employmentType === 'SELBSTSTANDIG') prismaType = 'COMMERCIAL';

    // 3. Create Driver
    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        tenantId: tenantId as string,
        firstName: app.firstName,
        lastName: app.lastName,
        phone: app.phone,
        birthday: app.birthday,
        street: app.street,
        zip: app.zip,
        city: app.city,
        ssn: app.ssn,
        taxId: app.taxId,
        gisaNumber: app.gisaNumber,
        iban: app.iban,
        bic: app.bic,
        type: prismaType,
        status: 'ACTIVE'
      }
    });

    // 4. Create Documents
    const docs = [
      { url: app.idCardUrl, type: 'LICENSE' as const, title: 'Passport' },
      { url: app.licenseUrl, type: 'LICENSE' as const, title: 'Führerschein B' },
      { url: app.meldezettelUrl, type: 'OTHER' as const, title: 'Meldezettel' },
      { url: app.eCardUrl, type: 'OTHER' as const, title: 'eCard' },
      { url: app.greyCardUrl, type: 'OTHER' as const, title: 'Graue Karte' },
      { url: app.gisaExtractUrl, type: 'BUSINESS_REG' as const, title: 'GISA-Auszug' },
      { url: app.svsConfirmationUrl, type: 'OTHER' as const, title: 'SVS Bestätigung' },
      { url: app.businessRegUrl, type: 'BUSINESS_REG' as const, title: 'Gewerbeschein' },
    ];

    for (const doc of docs) {

      if (doc.url) {
        await prisma.document.create({
          data: {
            driverId: driver.id,
            fileUrl: doc.url,
            title: doc.title,
            type: doc.type as any,
            status: 'VALID'
          }
        });
      }
    }

    // 5. Update Application Status
    await (prisma as any).driverApplication.update({
      where: { id },
      data: { status: 'APPROVED', notes: `Konvertiert zu Fahrer am ${new Date().toLocaleDateString()}` }
    });

    res.json({ success: true, driverId: driver.id, tempPassword });

  } catch (error: any) {
    console.error("Approve error:", error);
    res.status(500).json({ error: error.message || 'Fehler beim Genehmigen' });
  }
});

export default router;
