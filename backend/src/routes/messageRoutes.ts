import express, { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { TenantRequest } from '../middleware/tenantMiddleware';

const router = Router();

// GET all messages for a tenant (between driver/customer and admin panel)
router.get('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;
    const { senderId, receiverId } = req.query as any;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const messages = await prisma.message.findMany({
            where: {
                tenantId: tenantId as string,
                OR: [
                    { senderId: senderId || undefined },
                    { receiverId: receiverId || undefined }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Nachrichten konnten nicht geladen werden' });
    }
});

// POST send message
const messageSchema = z.object({
    senderId: z.string(),
    receiverId: z.string().optional().nullable(),
    text: z.string().optional().nullable(),
    fileUrl: z.string().optional().nullable(),
});

router.post('/', async (req: TenantRequest, res: Response) => {
    const { tenantId } = req;

    if (!tenantId) {
        return res.status(400).json({ error: 'Mandanten-Kontext fehlt' });
    }

    try {
        const validatedData = messageSchema.parse(req.body);

        const msg = await prisma.message.create({
            data: {
                ...validatedData,
                tenantId: tenantId as string,
            }
        });
        res.status(201).json(msg);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Nachricht konnte nicht gesendet werden' });
    }
});

export default router;
