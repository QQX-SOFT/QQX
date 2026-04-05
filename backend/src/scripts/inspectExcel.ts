import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.resolve('c:/Users/IT Admin/Downloads/QQX/Meral_Rider_Report (3) (1).xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length > 0) {
        console.log("Headers detected:", data[0]);
        console.log("Sample row (Row 1):", data[1]);
        console.log("Sample row (Row 2):", data[2]);
    } else {
        console.log("No data found in sheet.");
    }
} catch (error) {
    console.error("Error reading excel:", error);
}
