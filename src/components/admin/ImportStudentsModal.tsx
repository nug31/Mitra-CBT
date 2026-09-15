import React, { useState, useCallback, useRef } from 'react';
import {
  UploadCloud, FileSpreadsheet, Download, CheckCircle2, XCircle,
  AlertTriangle, Loader2, Users, RefreshCw, ChevronDown, ChevronUp,
  Info, X
} from 'lucide-react';
import { parseExcelFile, generateTemplate, StudentImportRow, ImportResult } from '../../utils/excelImport';
import { db } from '../../services/db';
import { ClassRoom } from '../../types';

interface ImportStudentsModalProps {
  classes: ClassRoom[];
  onSuccess: (count: number) => void;
  onClose: () => void;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'done';

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({ classes, onSuccess, onClose }) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [showInvalid, setShowInvalid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      setError('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv');
      return;
    }
    setFileName(file.name);
    try {
      const result = await parseExcelFile(file, classes);
      if (result.rows.length === 0) {
        setError('File kosong atau format tidak sesuai template. Download template terlebih dahulu.');
        return;
      }
      setImportResult(result);
      setStep('preview');
    } catch (err) {
      setError((err as Error).message);
    }
  }, [classes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!importResult) return;
    const validRows = importResult.rows.filter(r => r.valid);
    if (validRows.length === 0) return;

    setImporting(true);
    setStep('importing');

    try {
      const count = await db.importStudents(validRows);
      setImportedCount(count);
      setStep('done');
      onSuccess(count);
    } catch (err) {
      setError('Gagal mengimport siswa: ' + (err as Error).message);
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  const validRows  = importResult?.rows.filter(r => r.valid)  ?? [];
  const invalidRows = importResult?.rows.filter(r => !r.valid) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Import Siswa via Excel</h2>
              <p className="text-xs text-slate-500">Upload file .xlsx dengan data NISN, NIS, Nama, dan Kelas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100">
          {(['upload', 'preview', 'done'] as const).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                step === s ? 'text-brand-600' : 
                (step === 'done' || (step === 'preview' && s === 'upload') || (step === 'importing' && s !== 'done'))
                  ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === s ? 'bg-brand-600 text-white' :
                  (s === 'upload' && (step === 'preview' || step === 'importing' || step === 'done')) ||
                  (s === 'preview' && (step === 'importing' || step === 'done'))
                    ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {i + 1}
                </div>
                <span className="hidden sm:inline capitalize">{s === 'upload' ? 'Upload File' : s === 'preview' ? 'Preview Data' : 'Selesai'}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* === STEP: UPLOAD === */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-brand-500 bg-brand-50 scale-[1.01]'
                    : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-brand-100' : 'bg-slate-100'}`}>
                  <UploadCloud className={`w-7 h-7 transition-colors ${isDragging ? 'text-brand-600' : 'text-slate-400'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700">
                    {isDragging ? 'Lepaskan file di sini...' : 'Drag & Drop file Excel di sini'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">atau klik untuk memilih file (.xlsx, .xls, .csv)</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Template download */}
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-800">Belum punya template?</p>
                  <p className="text-xs text-amber-700 mt-0.5">Download template Excel resmi Mitra CBT agar format kolom sesuai.</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); generateTemplate(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Template
                </button>
              </div>

              {/* Format guide */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs font-black text-slate-700 mb-2">📋 Format Kolom yang Dibutuhkan:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { col: 'NISN', desc: 'Nomor Induk Siswa Nasional (wajib)', required: true },
                    { col: 'NIS', desc: 'Nomor induk sekolah', required: false },
                    { col: 'Nama Lengkap', desc: 'Nama siswa lengkap', required: true },
                    { col: 'Kelas', desc: 'Contoh: X TKR, XI Mesin', required: true },
                  ].map(item => (
                    <div key={item.col} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${item.required ? 'bg-red-500' : 'bg-slate-300'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.col} {item.required && <span className="text-red-500">*</span>}</p>
                        <p className="text-[10px] text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kelas yang tersedia */}
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">Nama kelas yang valid:</p>
                  <div className="flex flex-wrap gap-1">
                    {classes.map(c => (
                      <span key={c.id} className="px-1.5 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded border border-brand-100">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === STEP: PREVIEW === */}
          {step === 'preview' && importResult && (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                  <p className="text-2xl font-black text-slate-900">{importResult.rows.length}</p>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">Total Baris</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center">
                  <p className="text-2xl font-black text-emerald-700">{importResult.totalValid}</p>
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">Siap Import</p>
                </div>
                <div className={`rounded-2xl p-4 border text-center ${importResult.totalInvalid > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-2xl font-black ${importResult.totalInvalid > 0 ? 'text-red-600' : 'text-slate-400'}`}>{importResult.totalInvalid}</p>
                  <p className={`text-xs mt-1 font-semibold ${importResult.totalInvalid > 0 ? 'text-red-500' : 'text-slate-400'}`}>Bermasalah</p>
                </div>
              </div>

              {/* File info */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-mono truncate">{fileName}</span>
                <button onClick={() => { setStep('upload'); setImportResult(null); setFileName(''); }} className="ml-auto flex items-center gap-1 text-brand-600 hover:text-brand-800 font-bold flex-shrink-0">
                  <RefreshCw className="w-3 h-3" /> Ganti
                </button>
              </div>

              {/* Valid rows table */}
              {validRows.length > 0 && (
                <div>
                  <p className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {validRows.length} siswa akan diimport:
                  </p>
                  <div className="rounded-xl border border-slate-200 overflow-hidden max-h-52 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-600 sticky top-0">
                        <tr>
                          <th className="p-2.5 text-left font-bold">No</th>
                          <th className="p-2.5 text-left font-bold">NISN</th>
                          <th className="p-2.5 text-left font-bold">Nama Lengkap</th>
                          <th className="p-2.5 text-left font-bold">Kelas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {validRows.map((row, i) => (
                          <tr key={i} className="hover:bg-emerald-50 transition">
                            <td className="p-2.5 text-slate-400">{i + 1}</td>
                            <td className="p-2.5 font-mono text-slate-700">{row.nisn}</td>
                            <td className="p-2.5 font-semibold text-slate-900">{row.full_name}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-black rounded-full border border-brand-100">
                                {row.class_name}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Invalid rows */}
              {invalidRows.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowInvalid(!showInvalid)}
                    className="flex items-center gap-2 text-xs font-black text-red-600 w-full"
                  >
                    <XCircle className="w-4 h-4" />
                    {invalidRows.length} baris bermasalah (klik untuk lihat)
                    {showInvalid ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {showInvalid && (
                    <div className="mt-2 rounded-xl border border-red-200 overflow-hidden max-h-44 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-red-50 text-red-700 sticky top-0">
                          <tr>
                            <th className="p-2.5 text-left font-bold">Baris</th>
                            <th className="p-2.5 text-left font-bold">Data</th>
                            <th className="p-2.5 text-left font-bold">Masalah</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100">
                          {invalidRows.map((row, i) => (
                            <tr key={i} className="bg-red-50/50">
                              <td className="p-2.5 text-red-400 font-mono">{row.rowIndex}</td>
                              <td className="p-2.5 text-slate-700 font-semibold">{row.full_name || '(kosong)'}</td>
                              <td className="p-2.5 text-red-600">{row.errors.join(', ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* === STEP: IMPORTING === */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center gap-5 py-12">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="w-7 h-7 text-brand-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-extrabold text-slate-900">Mengimport Siswa...</p>
                <p className="text-xs text-slate-500 mt-1">Mohon tunggu, sedang mendaftarkan {validRows.length} siswa</p>
              </div>
            </div>
          )}

          {/* === STEP: DONE === */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center gap-5 py-12">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">Import Berhasil! 🎉</p>
                <p className="text-sm text-slate-500 mt-2">
                  <span className="font-black text-emerald-700 text-lg">{importedCount}</span> siswa berhasil didaftarkan
                </p>
                <p className="text-xs text-slate-400 mt-1">Siswa dapat langsung login menggunakan NISN mereka</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 max-w-sm text-center">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Password default siswa adalah NISN masing-masing</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition"
          >
            {step === 'done' ? 'Tutup' : 'Batal'}
          </button>

          {step === 'preview' && validRows.length > 0 && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-200"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              Import {validRows.length} Siswa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
