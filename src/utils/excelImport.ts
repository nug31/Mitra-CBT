import * as XLSX from 'xlsx';
import { ClassRoom } from '../types';

export interface StudentImportRow {
  rowIndex: number;
  nisn: string;
  nis: string;
  full_name: string;
  class_name: string;       // nama kelas seperti "X TKR", "XI Mesin"
  class_id: string | null;  // resolved class id
  errors: string[];
  valid: boolean;
}

export interface ImportResult {
  rows: StudentImportRow[];
  totalValid: number;
  totalInvalid: number;
}

// Normalize header names dari berbagai variasi penulisan Excel
function normalizeHeader(h: string): string {
  return h.toLowerCase().trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

const HEADER_MAP: Record<string, string[]> = {
  nisn:      ['nisn', 'no_nisn', 'nomor_induk_siswa_nasional'],
  nis:       ['nis', 'no_nis', 'nomor_induk_siswa'],
  full_name: ['nama', 'nama_lengkap', 'nama_siswa', 'full_name', 'name'],
  class_name:['kelas', 'nama_kelas', 'class', 'class_name', 'ruang'],
};

function findColumn(headers: string[], aliases: string[]): number {
  for (const alias of aliases) {
    const idx = headers.findIndex(h => normalizeHeader(h) === alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseExcelFile(file: File, classes: ClassRoom[]): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rawRows.length < 2) {
          return resolve({ rows: [], totalValid: 0, totalInvalid: 0 });
        }

        // Find header row (first non-empty row)
        const headerRowIndex = rawRows.findIndex(r => r.some(c => String(c).trim() !== ''));
        const headers = rawRows[headerRowIndex].map(h => String(h));

        const colNISN      = findColumn(headers, HEADER_MAP.nisn);
        const colNIS       = findColumn(headers, HEADER_MAP.nis);
        const colName      = findColumn(headers, HEADER_MAP.full_name);
        const colClassName = findColumn(headers, HEADER_MAP.class_name);

        // Build class lookup (case-insensitive)
        const classLookup = new Map<string, ClassRoom>();
        for (const cls of classes) {
          classLookup.set(cls.name.toLowerCase().trim(), cls);
          // Also map abbreviation: "X TKR" → "x tkr"
        }

        const rows: StudentImportRow[] = [];
        let totalValid = 0;
        let totalInvalid = 0;

        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          // Skip completely empty rows
          if (!row.some(c => String(c).trim() !== '')) continue;

          const nisn      = String(row[colNISN] ?? '').trim();
          const nis       = String(row[colNIS]  ?? '').trim();
          const full_name = String(row[colName]  ?? '').trim();
          const className = String(row[colClassName] ?? '').trim();
          const errors: string[] = [];

          // Validate NISN — minimal 5 digit angka, tidak harus tepat 10
          if (!nisn) {
            errors.push('NISN wajib diisi');
          } else if (!/^\d{5,}$/.test(nisn)) {
            errors.push('NISN harus berupa angka (minimal 5 digit)');
          }

          // Validate Nama
          if (!full_name) errors.push('Nama lengkap wajib diisi');

          // Validate Kelas
          const classMatch = classLookup.get(className.toLowerCase().trim());
          if (!className) {
            errors.push('Kelas wajib diisi');
          } else if (!classMatch) {
            errors.push(`Kelas "${className}" tidak ditemukan`);
          }

          const valid = errors.length === 0;
          valid ? totalValid++ : totalInvalid++;

          rows.push({
            rowIndex: i + 1, // 1-indexed untuk tampilan
            nisn,
            nis: nis || nisn, // fallback nis = nisn jika tidak ada
            full_name,
            class_name: className,
            class_id: classMatch?.id ?? null,
            errors,
            valid,
          });
        }

        resolve({ rows, totalValid, totalInvalid });
      } catch (err) {
        reject(new Error('Gagal membaca file Excel: ' + (err as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

// Generate template Excel untuk didownload guru/admin
export function generateTemplate(): void {
  const ws_data = [
    ['NISN', 'NIS', 'Nama Lengkap', 'Kelas'],
    ['1234567890', '2401001', 'Contoh Nama Siswa', 'X TKR'],
    ['1234567891', '2401002', 'Contoh Nama Siswa 2', 'XI Mesin'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Set column widths
  ws['!cols'] = [
    { wch: 14 }, // NISN
    { wch: 10 }, // NIS
    { wch: 30 }, // Nama
    { wch: 14 }, // Kelas
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
  XLSX.writeFile(wb, 'Template_Import_Siswa_MitraCBT.xlsx');
}
