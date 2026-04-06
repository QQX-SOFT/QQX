import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.resolve('c:/Users/IT Admin/Downloads/QQX/Mitarbeiter Datenbank (4).xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const firstName = row[3]?.toString() || "";
        const lastName = row[4]?.toString() || "";
        
        if (firstName.toLowerCase().includes("hamit") || lastName.toLowerCase().includes("ünye")) {
            console.log(`FOUND: ${firstName} ${lastName}`);
            console.log(`ROW LENGTH: ${row.length}`);
            row.forEach((val, i) => {
                const colLetter = XLSX.utils.encode_col(i);
                console.log(`[${i}] ${colLetter} -> ${val}`);
            });
        }
    }
} catch (error) {
    console.error("Error reading excel:", error);
}
