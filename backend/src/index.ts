import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { prisma } from './lib/prisma';
import tenantRoutes from './routes/tenantRoutes';
import driverRoutes from './routes/driverRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import timeRoutes from './routes/timeRoutes';
import reportRoutes from './routes/reportRoutes';
import ratingRoutes from './routes/ratingRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import orderRoutes from './routes/orderRoutes';
import complaintRoutes from './routes/complaintRoutes';
import documentRoutes from './routes/documentRoutes';
import walletRoutes from './routes/walletRoutes';
import settingsRoutes from './routes/settingsRoutes';
import superadminRoutes from './routes/superadminRoutes';
import customerRoutes from './routes/customerRoutes';
import contractRoutes from './routes/contractRoutes';
import contractTemplateRoutes from './routes/contractTemplateRoutes';
import uploadRoutes from './routes/uploadRoutes';
import authRoutes from './routes/authRoutes';
import vatRoutes from './routes/vatRoutes';
import messageRoutes from './routes/messageRoutes';

import { tenantMiddleware } from './middleware/tenantMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - allow all origins explicitly
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-subdomain', 'x-user-id'],
    credentials: true,
}));

// Handle preflight OPTIONS for all routes (Vercel serverless compatibility)
app.options('*', cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-subdomain', 'x-user-id'],
    credentials: true,
}));

app.use(express.json());
app.use(tenantMiddleware as any);

// Routes
app.use('/api/tenants', tenantRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/time-entries', timeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/contract-templates', contractTemplateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vat', vatRoutes);
app.use('/api/messages', messageRoutes);

app.get('/health', (req: express.Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}

export { prisma };
export default app;
