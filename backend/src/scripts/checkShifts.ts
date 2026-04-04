import { prisma } from '../lib/prisma';

export async function checkUpcomingShifts() {
    const now = new Date();
    const in30Mins = new Date(now.getTime() + 30 * 60 * 1000);
    const in35Mins = new Date(now.getTime() + 35 * 60 * 1000);

    console.log('Checking shifts starting between', in30Mins.toISOString(), 'and', in35Mins.toISOString());

    const assignments = await prisma.shiftAssignment.findMany({
        where: {
            status: 'CONFIRMED',
            shift: {
                startTime: {
                    gte: in30Mins,
                    lte: in35Mins
                }
            },
            lastNotificationSentAt: null // Only send once
        },
        include: {
            driver: true,
            shift: {
                include: { area: true }
            }
        }
    });

    for (const as of assignments) {
        console.log(`NOTIFY: Schicht in 30 Minuten für ${as.driver.firstName} ${as.driver.lastName} in ${as.shift.area.name}`);
        
        // In a real app, you'd trigger a Push Notification or SMS here
        // await sendPushNotification(as.driver.pushToken, "Schicht-Erinnerung", "Deine Schicht beginnt in 30 Minuten.");

        await prisma.shiftAssignment.update({
            where: { id: as.id },
            data: { lastNotificationSentAt: new Date() }
        });
    }
}

// If run directly
if (require.main === module) {
    checkUpcomingShifts()
        .then(() => console.log('Check complete'))
        .catch(console.error)
        .finally(() => process.exit());
}
