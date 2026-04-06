import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.resolve('c:/Users/IT Admin/Downloads/QQX/Mitarbeiter Datenbank (4).xlsx');
const outputPath = path.resolve('c:/Users/IT Admin/Downloads/QQX/backend/excel_inspection.txt');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let output = "";
    if (data.length > 0) {
        const headers = data[0];
        output += `COLUMNS FOR MITARBEITER DATENBANK (4).xlsx:\n`;
        headers.forEach((h: string, i: number) => {
            const letter = XLSX.utils.encode_col(i);
            output += `[${i}] ${letter} -> ${h}\n`;
        });

        output += `\nSAMPLE DATA (Row 1):\n`;
        output += JSON.stringify(data[1], null, 2);
        output += `\n\nSAMPLE DATA (Row 2):\n`;
        output += JSON.stringify(data[2], null, 2);
    }
    fs.writeFileSync(outputPath, output);
    console.log("Inspection written to backend/excel_inspection.txt");
} catch (error) {
    console.error("Error reading excel:", error);
}
