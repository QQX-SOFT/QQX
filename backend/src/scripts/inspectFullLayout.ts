import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.resolve('c:/Users/IT Admin/Downloads/QQX/Mitarbeiter Datenbank (4).xlsx');
const outPath = path.resolve('c:/Users/IT Admin/Downloads/QQX/backend/layout_inspection_full.txt');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let out = "";
    const headers = data[0];
    out += `HEADER COUNT: ${headers.length}\n`;
    headers.forEach((h, i) => out += `[${i}] ${XLSX.utils.encode_col(i)} -> ${h}\n`);

    out += `\nSAMPLE DATA:\n`;
    for(let i=1; i<20; i++) {
        const row = data[i];
        if(!row) continue;
        out += `Row ${i}: ${row[3]} ${row[4]} | Type: ${row[7]} | W: ${row[22]} | X: ${row[23]}\n`;
    }

    fs.writeFileSync(outPath, out);
    console.log("Written to backend/layout_inspection_full.txt");
} catch (error) {
    console.error("Error reading excel:", error);
}
