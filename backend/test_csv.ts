import fs from 'fs';
import csv from 'csv-parser';

const CSV_PATH = 'C:/Users/IT Admin/Downloads/QQX/Mitarbeiter Datenbank (4).csv';

fs.createReadStream(CSV_PATH)
    .pipe(csv({
        separator: ';',
        mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').replace(/"/g, '').trim()
    }))
    .on('data', (row) => {
        console.log(row['Vorname'], row['Familienname']);
    })
    .on('end', () => console.log('done'));
