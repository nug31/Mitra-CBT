import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileUp,
  HelpCircle
} from 'lucide-react';
import { Question, QuestionType, DifficultyLevel, QuestionBank } from '../../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
  banks?: QuestionBank[];
  onImportComplete: (questions: Partial<Question>[], targetBankId?: string) => Promise<void>;
}

interface ParsedRow {
  rowNum: number;
  questionType: QuestionType;
  content: string;
  optA: string;
  optB: string;
  optC: string;
  optD: string;
  key: string;
  weight: number;
  difficulty: DifficultyLevel;
  explanation: string;
  isValid: boolean;
  error?: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  bankId,
  banks = [],
  onImportComplete
}) => {
  const [targetBankId, setTargetBankId] = useState<string>(bankId);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  React.useEffect(() => {
    if (bankId) {
      setTargetBankId(bankId);
    }
  }, [bankId, isOpen]);

  if (!isOpen) return null;

  // Download vocational question template
  const handleDownloadTemplate = () => {
    const headers = [
      'No',
      'Jenis Soal',
      'Pertanyaan',
      'A',
      'B',
      'C',
      'D',
      'Kunci',
      'Bobot',
      'Kesulitan',
      'Pembahasan'
    ];

    const sampleRows = [
      [
        1,
        'Pilihan Ganda',
        'Alat ukur yang paling tepat untuk mengukur diameter silinder blok mesin adalah...',
        'Jangka Sorong (Vernier Caliper)',
        'Mikrometer Luar (Outside Micrometer)',
        'Cylinder Bore Gauge',
        'Dial Indicator',
        'C',
        2.0,
        'Sedang',
        'Cylinder Bore Gauge (CBG) dikombinasikan dengan mikrometer digunakan untuk mengukur keausan dan keovalan silinder.'
      ],
      [
        2,
        'Pilihan Ganda',
        'Kekentalan oli mesin yang ditunjukkan dengan kode SAE 10W-40, huruf W singkatan dari...',
        'Weight',
        'Winter',
        'Weather',
        'Wheel',
        'B',
        1.5,
        'Mudah',
        'Huruf W adalah Winter, menandakan viskositas pelumas pada suhu dingin/musim dingin.'
      ],
      [
        3,
        'Benar/Salah',
        'Termostat pada sistem pendinginan mobil membuka saat suhu air mencapai kisaran 80 - 90 derajat Celcius.',
        'BENAR',
        'SALAH',
        '',
        '',
        'A',
        1.5,
        'Mudah',
        'Termostat bekerja otomatis berdasarkan suhu kerja mesin agar mencapai temperatur optimal.'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Soal SMK');
    XLSX.writeFile(wb, 'Template_Bank_Soal_MitraCBT_SMK.xlsx');
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length < 2) {
          alert('File Excel kosong atau format tidak sesuai');
          return;
        }

        // Parse rows (row index 0 is header)
        const rows: ParsedRow[] = [];
        for (let i = 1; i < data.length; i++) {
          const r = data[i];
          if (!r || r.length === 0 || !r[2]) continue;

          const rawType = String(r[1] || 'Pilihan Ganda').toLowerCase();
          let questionType: QuestionType = 'pilihan_ganda';
          if (rawType.includes('benar') || rawType.includes('salah')) questionType = 'benar_salah';
          else if (rawType.includes('kompleks')) questionType = 'pg_kompleks';
          else if (rawType.includes('isian')) questionType = 'isian_singkat';

          const content = String(r[2] || '').trim();
          const optA = String(r[3] || '').trim();
          const optB = String(r[4] || '').trim();
          const optC = String(r[5] || '').trim();
          const optD = String(r[6] || '').trim();
          const key = String(r[7] || 'A').trim().toUpperCase();
          const weight = parseFloat(r[8]) || 1.0;
          
          const rawDiff = String(r[9] || 'sedang').toLowerCase();
          let difficulty: DifficultyLevel = 'sedang';
          if (rawDiff.includes('mudah')) difficulty = 'mudah';
          if (rawDiff.includes('sulit')) difficulty = 'sulit';

          const explanation = String(r[10] || '').trim();

          let isValid = true;
          let error = '';

          if (!content) {
            isValid = false;
            error = 'Pertanyaan kosong';
          } else if (questionType === 'pilihan_ganda' && (!optA || !optB)) {
            isValid = false;
            error = 'Opsi A dan B wajib diisi';
          } else if (!key) {
            isValid = false;
            error = 'Kunci belum ditentukan';
          }

          rows.push({
            rowNum: i + 1,
            questionType,
            content,
            optA,
            optB,
            optC,
            optD,
            key,
            weight,
            difficulty,
            explanation,
            isValid,
            error
          });
        }

        setParsedRows(rows);
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan format file sesuai.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setIsProcessing(true);
    try {
      const selectedTargetBank = targetBankId || bankId;
      const questionsToImport: Partial<Question>[] = validRows.map(r => {
        const options = [
          { id: 'opt-' + Math.random(), option_label: 'A', content: r.optA, is_correct: r.key.includes('A') },
          { id: 'opt-' + Math.random(), option_label: 'B', content: r.optB, is_correct: r.key.includes('B') }
        ];

        if (r.optC) {
          options.push({ id: 'opt-' + Math.random(), option_label: 'C', content: r.optC, is_correct: r.key.includes('C') });
        }
        if (r.optD) {
          options.push({ id: 'opt-' + Math.random(), option_label: 'D', content: r.optD, is_correct: r.key.includes('D') });
        }

        return {
          bank_id: selectedTargetBank,
          question_type: r.questionType,
          content: r.content,
          difficulty: r.difficulty,
          weight: r.weight,
          explanation: r.explanation,
          options
        };
      });

      await onImportComplete(questionsToImport, selectedTargetBank);
      onClose();
    } catch (err: any) {
      alert('Terjadi kesalahan saat menyimpan soal: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Import Soal dari Microsoft Excel
              </h3>
              <p className="text-xs text-slate-500">
                Unggah banyak butir soal sekaligus dengan validasi preview otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Bank Selector */}
          {banks.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Target Bank Soal Tujuan</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Pilih bank soal yang sesuai agar butir soal masuk ke mata pelajaran yang tepat
                </p>
              </div>
              <select
                value={targetBankId}
                onChange={(e) => setTargetBankId(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shrink-0 min-w-[260px]"
              >
                {banks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.question_count || 0} Soal)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Download Template Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Unduh Format Template Excel Resmi</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Gunakan kolom baku yang telah disesuaikan agar data terbaca 100% akurat.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shrink-0 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template .XLSX</span>
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-file-input"
            />
            <label
              htmlFor="excel-file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                {fileName ? fileName : 'Klik di sini untuk memilih file Excel'}
              </p>
              <p className="text-[11px] text-slate-400">
                Mendukung format .xlsx dan .xls (Maksimal 200 soal per unggahan)
              </p>
            </label>
          </div>

          {/* Validation & Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Hasil Pratinjau & Validasi Soal:
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-semibold">
                    {validCount} Siap Impor
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-semibold">
                      {invalidCount} Error
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 font-bold">Baris</th>
                      <th className="p-2.5 font-bold">Status</th>
                      <th className="p-2.5 font-bold">Pertanyaan</th>
                      <th className="p-2.5 font-bold">Kunci</th>
                      <th className="p-2.5 font-bold">Bobot</th>
                      <th className="p-2.5 font-bold">Kesulitan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.map((r) => (
                      <tr
                        key={r.rowNum}
                        className={!r.isValid ? 'bg-rose-50/70' : 'hover:bg-slate-50'}
                      >
                        <td className="p-2.5 font-mono text-slate-500">#{r.rowNum}</td>
                        <td className="p-2.5">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-medium text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5" /> {r.error}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-800 line-clamp-1 max-w-xs">
                          {r.content}
                        </td>
                        <td className="p-2.5 font-bold text-brand-600">{r.key}</td>
                        <td className="p-2.5 text-slate-600">{r.weight}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              r.difficulty === 'mudah'
                                ? 'bg-emerald-100 text-emerald-700'
                                : r.difficulty === 'sedang'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {r.difficulty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            Sistem secara cerdas memeriksa kelengkapan opsi jawaban dan kunci sebelum disimpan.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Tutup
            </button>
            <button
              disabled={validCount === 0 || isProcessing}
              onClick={handleConfirmImport}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>{isProcessing ? 'Mengimpor...' : `Konfirmasi Impor (${validCount} Soal)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
