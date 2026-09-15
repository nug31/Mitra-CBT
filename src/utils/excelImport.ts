import * as XLSX from 'xlsx';
import { ClassRoom } from '../types';

export interface StudentImportRow {
  rowIndex: number;
  nisn: string;
  nis: string;          // sama dengan nisn jika tidak ada
  full_name: string;
  class_name: string;   // nama kelas seperti "X TKR", "XI Mesin"
  class_id: string | null;
  errors: string[];
  valid: boolean;
}

export interface ImportResult {
  rows: StudentImportRow[];
  totalValid: number;
  totalInvalid: number;
  detectedHeaders: string[]; // untuk debug jika ada masalah
}

// ──────────────────────────────────────────────────────────────
// Normalize header — hapus spasi, karakter khusus, jadikan lowercase
// ──────────────────────────────────────────────────────────────
function normalizeHeader(h: string): string {
  return h.toLowerCase().trim()
    .replace(/[\s.\-/()]+/g, '_')  // spasi, titik, strip, slash, kurung → underscore
    .replace(/[^a-z0-9_]/g, '');   // hapus karakter lain
}

// Berbagai variasi nama kolom yang mungkin ada di file Excel user
const HEADER_MAP: Record<string, string[]> = {
  nisn: [
    'nisn', 'no_nisn', 'nomor_induk_siswa_nasional',
    'no_induk_nasional', 'nisn_siswa', 'no_nisn_siswa',
    'induk_nasional', 'national_id'
  ],
  full_name: [
    'nama', 'nama_lengkap', 'nama_siswa', 'full_name', 'name',
    'nama_peserta', 'nama_murid', 'nama_pelajar',
    'student_name', 'nama_anak'
  ],
  class_name: [
    'kelas', 'nama_kelas', 'class', 'class_name', 'ruang',
    'kelas_rombel', 'rombel', 'kelompok_belajar',
    'tingkat_kelas', 'kelas_siswa', 'kls'
  ],
};

function findColumn(headers: string[], aliases: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.findIndex(h => h === alias || h.includes(alias) || alias.includes(h));
    if (idx !== -1) return idx;
  }
  return -1;
}

// Coba deteksi header row secara otomatis
// Kembalikan index baris header dan array nama kolom
function detectHeaderRow(rawRows: any[][]): { headerIdx: number; headers: string[] } {
  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;
    const strs = row.map(c => String(c || '').trim()).filter(s => s.length > 0);
    if (strs.length === 0) continue;

    // Cek apakah row ini tampak seperti header (ada kata kunci)
    const rowLower = strs.map(s => s.toLowerCase()).join(' ');
    if (
      rowLower.includes('nisn') ||
      rowLower.includes('nama') ||
      rowLower.includes('kelas') ||
      rowLower.includes('siswa') ||
      rowLower.includes('name') ||
      rowLower.includes('class')
    ) {
      return { headerIdx: i, headers: row.map(c => String(c || '')) };
    }
  }
  // Tidak ketemu header → asumsikan baris pertama adalah header
  return { headerIdx: 0, headers: rawRows[0]?.map(c => String(c || '')) ?? [] };
}

// Build class lookup yang fleksibel:
// "X TKR" → match, "XTKR" → match, "x tkr" → match, "Kelas X TKR" → match
function buildClassLookup(classes: ClassRoom[]): Map<string, ClassRoom> {
  const lookup = new Map<string, ClassRoom>();
  for (const cls of classes) {
    const keys = [
      cls.name.toLowerCase().trim(),                          // "x tkr"
      cls.name.toLowerCase().replace(/\s+/g, ''),            // "xtkr"
      ('kelas ' + cls.name).toLowerCase(),                   // "kelas x tkr"
      cls.name.toLowerCase().replace(/\s+/g, '_'),           // "x_tkr"
    ];
    for (const key of keys) {
      if (!lookup.has(key)) lookup.set(key, cls);
    }
  }
  return lookup;
}

function resolveClass(rawClassName: string, lookup: Map<string, ClassRoom>): ClassRoom | undefined {
  const cleaned = rawClassName.toLowerCase().trim();
  if (!cleaned) return undefined;

  // Coba exact match dulu
  if (lookup.has(cleaned)) return lookup.get(cleaned);

  // Coba tanpa spasi
  const noSpace = cleaned.replace(/\s+/g, '');
  if (lookup.has(noSpace)) return lookup.get(noSpace);

  // Coba partial match — apakah ada nama kelas yang terkandung dalam input
  for (const [key, cls] of lookup.entries()) {
    if (cleaned.includes(key) || key.includes(cleaned)) return cls;
  }

  return undefined;
}

// ──────────────────────────────────────────────────────────────
// MAIN PARSER
// ──────────────────────────────────────────────────────────────
export function parseExcelFile(file: File, classes: ClassRoom[]): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellText: true, cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

        if (rawRows.length < 2) {
          return resolve({ rows: [], totalValid: 0, totalInvalid: 0, detectedHeaders: [] });
        }

        // Auto-detect header row
        const { headerIdx, headers } = detectHeaderRow(rawRows);

        const colNISN      = findColumn(headers, HEADER_MAP.nisn);
        const colName      = findColumn(headers, HEADER_MAP.full_name);
        const colClassName = findColumn(headers, HEADER_MAP.class_name);

        const classLookup = buildClassLookup(classes);

        const rows: StudentImportRow[] = [];
        let totalValid   = 0;
        let totalInvalid = 0;

        for (let i = headerIdx + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || !row.some(c => String(c).trim() !== '')) continue; // skip baris kosong

          // Ambil nilai — fallback ke kolom 0,1,2 jika header tidak terdeteksi
          const nisnRaw  = colNISN      >= 0 ? String(row[colNISN]      ?? '').trim() : String(row[0] ?? '').trim();
          const nameRaw  = colName      >= 0 ? String(row[colName]      ?? '').trim() : String(row[1] ?? '').trim();
          const classRaw = colClassName >= 0 ? String(row[colClassName] ?? '').trim() : String(row[2] ?? '').trim();

          // Bersihkan NISN — hapus spasi, titik, strip yang mungkin ada
          const nisn = nisnRaw.replace(/[\s.\-]/g, '');

          const errors: string[] = [];

          // Validasi NISN
          if (!nisn) {
            errors.push('NISN wajib diisi');
          } else if (!/^\d{5,}$/.test(nisn)) {
            errors.push(`NISN "${nisnRaw}" harus berupa angka (minimal 5 digit)`);
          }

          // Validasi Nama
          if (!nameRaw) errors.push('Nama lengkap wajib diisi');

          // Validasi Kelas
          const classMatch = resolveClass(classRaw, classLookup);
          if (!classRaw) {
            errors.push('Kelas wajib diisi');
          } else if (!classMatch) {
            errors.push(`Kelas "${classRaw}" tidak ditemukan (cek daftar kelas yang tersedia)`);
          }

          const valid = errors.length === 0;
          valid ? totalValid++ : totalInvalid++;

          rows.push({
            rowIndex: i + 1,
            nisn,
            nis: nisn, // tidak lagi ada kolom NIS terpisah
            full_name: nameRaw,
            class_name: classRaw,
            class_id: classMatch?.id ?? null,
            errors,
            valid,
          });
        }

        resolve({ rows, totalValid, totalInvalid, detectedHeaders: headers });
      } catch (err) {
        reject(new Error('Gagal membaca file Excel: ' + (err as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

// ──────────────────────────────────────────────────────────────
// TEMPLATE GENERATOR — tanpa kolom NIS
// ──────────────────────────────────────────────────────────────
export function generateTemplate(classes: ClassRoom[] = []): void {
  const exampleClasses = classes.length > 0
    ? [classes[0]?.name ?? 'X TKR', classes[3]?.name ?? 'XI Mesin']
    : ['X TKR', 'XI Mesin'];

  const ws_data = [
    // Header — hanya 3 kolom: NISN, Nama Lengkap, Kelas
    ['NISN', 'Nama Lengkap', 'Kelas'],
    // Contoh data
    ['1234567890', 'Ahmad Fauzi', exampleClasses[0]],
    ['1234567891', 'Budi Santoso', exampleClasses[0]],
    ['1234567892', 'Candra Wijaya', exampleClasses[1]],
  ];

  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Style header bold (SheetJS CE tidak support styling, tapi set widths)
  ws['!cols'] = [
    { wch: 14 }, // NISN
    { wch: 32 }, // Nama Lengkap
    { wch: 14 }, // Kelas
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
  XLSX.writeFile(wb, 'Template_Import_Siswa_MitraCBT.xlsx');
}
