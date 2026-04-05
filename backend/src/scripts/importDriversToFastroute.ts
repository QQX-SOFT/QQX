import { PrismaClient, DriverStatus, DriverType } from '@prisma/client';
import fs from 'fs';
// @ts-ignore
import csv from 'csv-parser';
import path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CSV_PATH = 'c:\\Users\\IT Admin\\Downloads\\QQX\\Mitarbeiter Datenbank (4).csv';
const FASTROUTE_TENANT_ID = 'e5e1e871-bfc6-435c-a669-78ab76ecb195';
const DEFAULT_PASSWORD = bcrypt.hashSync('Turkei.1453', 10);

// Map CSV dates (DD.MM.YYYY or DDMMYYYY) to JS Dates
const parseGermanDate = (dateStr: string) => {
    if (!dateStr || dateStr === '...' || dateStr.trim() === '') return null;
    let trimmed = dateStr.trim();
    
    // Handle formats like "15092025" (8 digits) or "1092025" (7 digits)
    if (!trimmed.includes('.') && /^\d{7,8}$/.test(trimmed)) {
        if (trimmed.length === 7) {
            trimmed = '0' + trimmed; 
        }
        // Now it's 8 digits: DDMMYYYY
        const dd = trimmed.substring(0, 2);
        const mm = trimmed.substring(2, 4);
        const yyyy = trimmed.substring(4, 8);
        trimmed = `${dd}.${mm}.${yyyy}`;
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) return null;
    
    // Ensure 4 digit year, sometimes people write 25 instead of 2025 but here it's YYYY
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
};

// Map CSV Status to Prisma DriverStatus
const mapStatus = (status: string): DriverStatus => {
    const s = status.replace(/"/g, '').trim().toLowerCase();
    switch (s) {
        case 'aktif': return 'ACTIVE';
        case 'passiv': return 'PASSIV';
        case 'gekündigt': return 'GEKUENDIGT';
        case 'austritt': return 'INACTIVE';
        default: return 'ACTIVE';
    }
};

const parseAddress = (addrFull: string) => {
    if (!addrFull) return { street: null, zip: null, city: null };
    const trimmed = addrFull.trim();
    // Look for 4 digits (Austrian ZIP)
    const zipMatch = trimmed.match(/(\d{4})/);
    if (!zipMatch) return { street: trimmed, zip: null, city: null };
    
    const zip = zipMatch[1];
    const zipIndex = trimmed.indexOf(zip);
    
    const street = trimmed.substring(0, zipIndex).trim();
    const city = trimmed.substring(zipIndex + zip.length).trim();
    
    return { street, zip, city };
};

const mapEmploymentType = (type: string): DriverType => {
    if (!type) return 'EMPLOYED';
    const t = type.toLowerCase();
    if (t.includes('gewerbe') || t.includes('selbstständ') || t.includes('sfu')) return 'COMMERCIAL';
    if (t.includes('frei')) return 'FREELANCE';
    return 'EMPLOYED';
};

async function main() {
    console.log("Cleaning existing drivers for Fastroute... 🧹");
    const existingDrivers = await prisma.driver.findMany({ where: { tenantId: FASTROUTE_TENANT_ID } });
    for (const d of existingDrivers) {
        await prisma.driver.delete({ where: { id: d.id } });
        await prisma.user.delete({ where: { id: d.userId } });
    }
    
    console.log("Starting Driver Import to Fastroute... 🚀");
    
    const driversToImport: any[] = [];
    
    fs.createReadStream(CSV_PATH)
        .pipe(csv({
            separator: ';',
            mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').replace(/"/g, '').trim()
        }))
        .on('data', (row: any) => {
            // Clean names for email
            const firstName = (row['Vorname'] || 'Fahrer').trim();
            const lastName = (row['Familienname'] || 'Unbekannt').trim();
            
            // Generate email: vorname.nachname@fastroute.at
            let email = `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase().replace(/\s+/g, '')}@fastroute.at`;
            // Handle special characters
            email = email.replace(/[öÖ]/g, 'oe').replace(/[üÜ]/g, 'ue').replace(/[äÄ]/g, 'ae').replace(/[ß]/g, 'ss');

            const rawRiderId = row['rider_id'] ? row['rider_id'].toString().trim() : "";
            const idParts = rawRiderId.split(/[-,\s]+/).filter((id: string) => id.trim().length > 0);
            const driverNumber = idParts.length > 0 ? idParts[0] : null;
            const secondaryDriverNumber = idParts.length > 1 ? idParts[1] : null;

            const addrParsed = parseAddress(row['Adresse'] || '');

            driversToImport.push({
                riderId: driverNumber,
                secondaryDriverNumber: secondaryDriverNumber,
                status: mapStatus(row['Status'] || ''),
                imageUrl: row['Bild'] || null,
                firstName: firstName,
                lastName: lastName,
                email: email,
                workLocation: (row['Arbeitsort'] || '').replace(/[\[\]"]/g, '').trim() || null,
                employmentModel: row['Beschäftigungs modell'] || null,
                employmentType: row['Beschäftigungsart'] || null,
                iban: row['Bankverbindung'] || null,
                phone: row['Telefonnummer'] || null,
                address: row['Adresse'] || null,
                street: addrParsed.street,
                zip: addrParsed.zip,
                city: addrParsed.city,
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
                type: mapEmploymentType(row['Beschäftigungsart'] || row['Beschäftigungs modell'] || '')
            });
        })
        .on('end', async () => {
            console.log(`Read ${driversToImport.length} records from CSV. Starting DB insertion...`);
            let createdCount = 0;
            let errorCount = 0;

            for (const data of driversToImport) {
                try {
                    // 1. Handle Email Collision
                    let finalEmail = data.email;
                    let existingUser = await prisma.user.findUnique({ where: { email: finalEmail } });
                    let counter = 1;
                    
                    while (existingUser) {
                        const parts = data.email.split('@');
                        finalEmail = `${parts[0]}${counter}@${parts[1]}`;
                        existingUser = await prisma.user.findUnique({ where: { email: finalEmail } });
                        counter++;
                    }

                    // 2. Create User
                    const user = await prisma.user.create({
                        data: {
                            email: finalEmail,
                            password: DEFAULT_PASSWORD,
                            clerkId: `import-${Math.random().toString(36).substring(7)}`,
                            role: 'DRIVER',
                            tenantId: FASTROUTE_TENANT_ID
                        }
                    });

                    // 3. Create Driver
                    await prisma.driver.create({
                        data: {
                            userId: user.id,
                            tenantId: FASTROUTE_TENANT_ID,
                            driverNumber: data.riderId || null,
                            secondaryDriverNumber: data.secondaryDriverNumber || null,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            phone: data.phone,
                            status: data.status,
                            imageUrl: data.imageUrl,
                            workLocation: data.workLocation,
                            employmentModel: data.employmentModel,
                            employmentType: data.employmentType,
                            iban: data.iban,
                            address: data.address,
                            street: data.street,
                            zip: data.zip,
                            city: data.city,
                            hasWorkPermit: data.hasWorkPermit,
                            ssn: data.ssn,
                            birthday: data.birthday,
                            placeOfBirth: data.placeOfBirth,
                            maritalStatus: data.maritalStatus,
                            citizenship: data.citizenship,
                            jobTitle: data.jobTitle,
                            employmentStart: data.employmentStart,
                            employmentEnd: data.employmentEnd,
                            signatureStatus: data.signatureStatus,
                            visaExpiry: data.visaExpiry,
                            orderFee: isNaN(data.orderFee) ? 0 : data.orderFee,
                            hourlyWage: isNaN(data.hourlyWage) ? 0 : data.hourlyWage,
                            payPerKm: isNaN(data.payPerKm) ? 0 : data.payPerKm,
                            gisaNumber: data.gisaNumber,
                            type: data.type
                        }
                    });

                    createdCount++;
                    if (createdCount % 10 === 0) console.log(`Progress: ${createdCount} drivers created...`);
                } catch (err) {
                    console.error(`Error importing ${data.firstName} ${data.lastName}:`, err);
                    errorCount++;
                }
            }
            
            console.log(`\nImport Completed! ✅`);
            console.log(`Created: ${createdCount}`);
            console.log(`Errors: ${errorCount}`);
            process.exit(0);
        });
}

main().catch(console.error);
