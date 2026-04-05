import { PrismaClient, DriverStatus, DriverType } from '@prisma/client';
import fs from 'fs';
// @ts-ignore
import csv from 'csv-parser';
import path from 'path';

const prisma = new PrismaClient();

const CSV_PATH = 'c:\\Users\\IT Admin\\Downloads\\QQX\\Mitarbeiter Datenbank (4).csv';

// Map CSV dates (DD.MM.YYYY) to JS Dates
const parseGermanDate = (dateStr: string) => {
    if (!dateStr || dateStr === '...' || dateStr.trim() === '') return null;
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    // Parts: [DD, MM, YYYY]
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
};

// Map CSV Status to Prisma DriverStatus
const mapStatus = (status: string): DriverStatus => {
    const s = status.replace(/"/g, '').trim().toLowerCase();
    switch (s) {
        case 'aktif': return 'ACTIVE';
        case 'passiv': return 'PASSIV';
        case 'gekündigt': return 'GEKUENDIGT';
        case 'austritt': return 'INACTIVE';
        default: return 'INACTIVE';
    }
};

const mapEmploymentType = (type: string): DriverType => {
    if (type.toLowerCase().includes('selbstständig') || type.toLowerCase().includes('freier')) return 'FREELANCE';
    return 'EMPLOYED';
};

async function main() {
    const driversToUpdate: any[] = [];
    
    fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row: any) => {
            const riderId = row['rider_id'];
            if (!riderId) return;

            driversToUpdate.push({
                riderId: riderId.toString(),
                status: mapStatus(row['Status'] || ''),
                imageUrl: row['Bild'] || null,
                firstName: row['Vorname'] || '',
                lastName: row['Familienname'] || '',
                workLocation: row['Arbeitsort'] || null,
                employmentModel: row['Beschäftigungs modell'] || null,
                employmentType: row['Beschäftigungsart'] || null,
                iban: row['Bankverbindung'] || null,
                phone: row['Telefonnummer'] || null,
                address: row['Adresse'] || null,
                hasWorkPermit: (row['Arbeitsbewilligung vorhanden?'] || '').toLowerCase().includes('ja'),
                ssn: row['Vers.-Nr.'] || null,
                birthday: parseGermanDate(row['Geburtsdatum']),
                placeOfBirth: row['Geburtsort'] || null,
                maritalStatus: row['Familienstand'] || null,
                citizenship: row['Staatsbürgerschaft'] || null,
                jobTitle: row['Beschäftigt als.'] || null,
                employmentStart: parseGermanDate(row['Beginn des Dienstverhältnisses']),
                employmentEnd: parseGermanDate(row['Ende des Dienstverhältnisses']),
                signatureStatus: row['Status Unterschrift'] || null,
                visaExpiry: parseGermanDate(row['Visum ablauf']),
                orderFee: parseFloat((row['Bestellgebühr'] || '0').replace(',', '.')),
                hourlyWage: parseFloat((row['Stundenlohn'] || '0').replace(',', '.')),
                payPerKm: parseFloat((row['KM Geld'] || '0').replace(',', '.')),
                gisaNumber: row['GISA-Zahl'] || null,
                type: mapEmploymentType(row['Beschäftigungs modell'] || '')
            });
        })
        .on('end', async () => {
            console.log(`Processing ${driversToUpdate.length} riders from CSV...`);
            let updatedCount = 0;
            let skippedCount = 0;

            for (const rider of driversToUpdate) {
                // Find driver by driverNumber (rider_id)
                const existing = await prisma.driver.findFirst({
                    where: { driverNumber: rider.riderId }
                });

                if (existing) {
                    await prisma.driver.update({
                        where: { id: existing.id },
                        data: {
                            status: rider.status,
                            imageUrl: rider.imageUrl,
                            firstName: rider.firstName,
                            lastName: rider.lastName,
                            workLocation: rider.workLocation,
                            employmentModel: rider.employmentModel,
                            employmentType: rider.employmentType,
                            iban: rider.iban,
                            phone: rider.phone,
                            address: rider.address,
                            hasWorkPermit: rider.hasWorkPermit,
                            ssn: rider.ssn,
                            birthday: rider.birthday,
                            placeOfBirth: rider.placeOfBirth,
                            maritalStatus: rider.maritalStatus,
                            citizenship: rider.citizenship,
                            jobTitle: rider.jobTitle,
                            employmentStart: rider.employmentStart,
                            employmentEnd: rider.employmentEnd,
                            signatureStatus: rider.signatureStatus,
                            visaExpiry: rider.visaExpiry,
                            orderFee: isNaN(rider.orderFee) ? 0 : rider.orderFee,
                            hourlyWage: isNaN(rider.hourlyWage) ? 0 : rider.hourlyWage,
                            payPerKm: isNaN(rider.payPerKm) ? 0 : rider.payPerKm,
                            gisaNumber: rider.gisaNumber,
                            type: rider.type
                        }
                    });
                    updatedCount++;
                } else {
                    skippedCount++;
                }
            }
            console.log(`Done! Updated: ${updatedCount}, Skipped (not found): ${skippedCount}`);
            process.exit(0);
        });
}

main().catch(console.error);
