import * as XLSX from 'xlsx';
const workbook = XLSX.readFile('c:/Users/IT Admin/Downloads/QQX/Meral_Rider_Report (3) (1).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data: any[] = XLSX.utils.sheet_to_json(sheet);
if (data.length > 0) {
    console.log(JSON.stringify(data[0], null, 2));
}
