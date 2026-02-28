"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
// GET report for a driver in a date range
router.get('/driver/:id', async (req, res) => {
    const { start, end } = req.query;
    const { tenantId } = req;
    if (!start || !end) {
        return res.status(400).json({ error: 'Bezugszeitraum fehlt (start/end)' });
    }
    try {
        const entries = await index_1.prisma.timeEntry.findMany({
            where: {
                driverId: req.params.id,
                driver: { tenantId: tenantId }, // Security check
                startTime: {
                    gte: new Date(start),
                    lte: new Date(end)
                },
                status: 'COMPLETED'
            },
            orderBy: { startTime: 'asc' }
        });
        // Simple aggregation
        let totalMinutes = 0;
        const reportData = entries.map((entry) => {
            const durationMs = entry.endTime.getTime() - entry.startTime.getTime();
            const mins = Math.max(0, Math.floor(durationMs / 60000) - entry.pauseDuration);
            totalMinutes += mins;
            return {
                date: entry.startTime.toLocaleDateString('de-DE'),
                startTime: entry.startTime.toLocaleTimeString('de-DE'),
                endTime: entry.endTime.toLocaleTimeString('de-DE'),
                durationMinutes: mins,
                pauseMinutes: entry.pauseDuration
            };
        });
        res.json({
            summary: {
                totalHours: (totalMinutes / 60).toFixed(2),
                totalDays: entries.length,
                period: `${new Date(start).toLocaleDateString('de-DE')} - ${new Date(end).toLocaleDateString('de-DE')}`
            },
            entries: reportData
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Bericht konnte nicht generiert werden' });
    }
});
exports.default = router;
