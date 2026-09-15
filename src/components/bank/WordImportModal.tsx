import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileUp,
  HelpCircle,
  Trash2,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck
} from 'lucide-react';
import { Question, QuestionType, DifficultyLevel } from '../../types';
import { parseDocxFile, ParsedWordQuestion } from '../../utils/wordImport';

interface WordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
  onImportComplete: (questions: Partial<Question>[]) => Promise<void>;
}

export const WordImportModal: React.FC<WordImportModalProps> = ({
  isOpen,
  onClose,
  bankId,
  onImportComplete
}) => {
  const [questions, setQuestions] = useState<ParsedWordQuestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  if (!isOpen) return null;

  const sampleTemplateText = `1. Alat ukur yang paling tepat untuk mengukur diameter silinder blok mesin adalah...
A. Jangka Sorong (Vernier Caliper)
B. Mikrometer Luar (Outside Micrometer)
C. Cylinder Bore Gauge
D. Dial Indicator
E. Feeler Gauge
Kunci: C
Bobot: 2
Kesulitan: Sedang
Pembahasan: Cylinder Bore Gauge digunakan bersama mikrometer untuk mengukur keovalan dinding silinder.

2. Kekentalan oli mesin SAE 10W-40, huruf W merupakan singkatan dari kata...
A. Weight
B. Winter
C. Weather
D. Wheel
E. Warm
Kunci: B
Pembahasan: Huruf W menandakan viskositas pelumas stabil di suhu dingin saat mesin dinyalakan.

3. Komponen sistem pendingin yang menaikkan titik didih air adalah tutup radiator.
A. Benar
B. Salah
Kunci: A`;

  const handleCopyGuide = () => {
    navigator.clipboard.writeText(sampleTemplateText);
    setCopiedGuide(true);
    setTimeout(() => setCopiedGuide(false), 2500);
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/Template_Soal_MitraCBT.docx';
    link.download = 'Template_Bank_Soal_MitraCBT_SMK.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setIsParsing(true);

    try {
      const res = await parseDocxFile(file);
      if (res.error) {
        setParseError(res.error);
        setQuestions([]);
      } else if (res.questions.length === 0) {
        setParseError(
          'Tidak ada soal yang terdeteksi dalam dokumen Word ini. Pastikan soal diawali dengan nomor (misal "1.") dan pilihan jawaban ("A.", "B.", dst).'
        );
        setQuestions([]);
      } else {
        setQuestions(res.questions);
      }
    } catch (err: any) {
      setParseError(err?.message || 'Gagal memproses file Word.');
      setQuestions([]);
    } finally {
      setIsParsing(false);
    }
  };

  // Allow teacher to select/toggle correct answer directly from preview
  const handleSelectOptionKey = (qIndex: number, optionLabel: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const target = { ...updated[qIndex] };

      if (target.questionType === 'pg_kompleks') {
        // Toggle for multiple choice complex
        target.options = target.options.map(opt =>
          opt.label === optionLabel ? { ...opt, isCorrect: !opt.isCorrect } : opt
        );
        const correctLabels = target.options.filter(o => o.isCorrect).map(o => o.label);
        target.key = correctLabels.join(', ');
      } else {
        // Single selection for standard PG or Benar/Salah
        target.options = target.options.map(opt => ({
          ...opt,
          isCorrect: opt.label === optionLabel
        }));
        target.key = optionLabel;
      }

      // Revalidate
      const hasCorrect = target.options.some(o => o.isCorrect);
      if (hasCorrect && target.content) {
        target.isValid = true;
        target.error = undefined;
      }

      updated[qIndex] = target;
      return updated;
    });
  };

  const handleDeleteQuestion = (qIndex: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleConfirmImport = async () => {
    const validList = questions.filter(q => q.isValid);
    if (validList.length === 0) return;

    setIsProcessing(true);
    try {
      const questionsToImport: Partial<Question>[] = validList.map(q => {
        return {
          bank_id: bankId,
          question_type: q.questionType,
          content: q.content,
          image_url: q.imageUrl,
          difficulty: q.difficulty,
          weight: q.weight,
          explanation: q.explanation,
          options: q.options.map(opt => ({
            id: 'opt-' + Math.random().toString(36).substring(2, 9),
            option_label: opt.label,
            content: opt.content,
            image_url: opt.imageUrl,
            is_correct: opt.isCorrect
          }))
        };
      });

      await onImportComplete(questionsToImport);
      onClose();
    } catch (err: any) {
      alert('Terjadi kesalahan saat menyimpan butir soal: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = questions.filter(q => q.isValid).length;
  const invalidCount = questions.length - validCount;

  const filteredQuestions = questions.filter(q => {
    if (activeFilter === 'valid') return q.isValid;
    if (activeFilter === 'invalid') return !q.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Import Soal dari Microsoft Word (.docx)
              </h3>
              <p className="text-xs text-slate-500">
                Otomatis membaca butir soal, opsi A-E, kunci jawaban, pembahasan, dan diagram gambar teknik
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

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Download & Guide Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-950">Unduh Format Template Word (.docx)</h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  Gunakan format penulisan standar sekolah: nomor (1.), pilihan (A-E), dan kunci jawaban.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-blue-700 border border-blue-300 text-xs font-semibold hover:bg-blue-50 transition shadow-2xs"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Format Teks</span>
                {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh .DOCX</span>
              </button>
            </div>
          </div>

          {/* Expandable Guide Accordion */}
          {showGuide && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-semibold text-[11px]">CONTOH SUSUNAN TEKS DI WORD:</span>
                <button
                  onClick={handleCopyGuide}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
                >
                  {copiedGuide ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGuide ? 'Tersalin!' : 'Salin Contoh'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-slate-300 text-[11px]">
                {sampleTemplateText}
              </pre>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                <span>💡 <b>Gambar:</b> Gambar/diagram yang disisipkan di Word akan otomatis diekstrak.</span>
                <span>💡 <b>Kunci:</b> Kunci: C, Jawaban: B, dsb.</span>
                <span>💡 <b>Bobot & Pembahasan:</b> Opsional</span>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
            <input
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              className="hidden"
              id="word-file-input"
            />
            <label
              htmlFor="word-file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                {isParsing ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileUp className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {fileName ? fileName : 'Pilih atau Drag & Drop File Dokumen Word (.docx)'}
              </p>
              <p className="text-[11px] text-slate-400">
                Mendukung Microsoft Word (.docx). Gambar dan diagram soal otomatis terbaca.
              </p>
            </label>
          </div>

          {/* Error message */}
          {parseError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold">Gagal Membaca Dokumen</p>
                <p className="mt-0.5 text-[11px] text-rose-700">{parseError}</p>
              </div>
            </div>
          )}

          {/* Validation & Preview Section */}
          {questions.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Hasil Analisis Dokumen ({questions.length} Soal)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    {validCount} Siap Import
                  </span>
                  {invalidCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <AlertCircle className="w-3 h-3" />
                      {invalidCount} Perlu Periksa
                    </span>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({questions.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('valid')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      activeFilter === 'valid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Valid ({validCount})
                  </button>
                  {invalidCount > 0 && (
                    <button
                      onClick={() => setActiveFilter('invalid')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                        activeFilter === 'invalid' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Perlu Periksa ({invalidCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Questions List Preview */}
              <div className="space-y-3">
                {filteredQuestions.map((q, idx) => {
                  const originalIndex = questions.findIndex(orig => orig.id === q.id);

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition ${
                        q.isValid
                          ? 'bg-white border-slate-200 hover:border-slate-300'
                          : 'bg-amber-50/50 border-amber-300'
                      }`}
                    >
                      {/* Top bar */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                            {q.number}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                            {q.questionType.replace('_', ' ')}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            Bobot: {q.weight}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                            {q.difficulty}
                          </span>
                          {q.imageUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <ImageIcon className="w-3 h-3" />
                              Diagram/Gambar
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteQuestion(originalIndex)}
                          title="Hapus butir soal ini dari daftar import"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Question Content */}
                      <p className="text-xs font-semibold text-slate-900 mb-2 leading-relaxed whitespace-pre-wrap">
                        {q.content || <span className="italic text-slate-400">Pertanyaan tidak terbaca</span>}
                      </p>

                      {/* Embedded Image preview if present */}
                      {q.imageUrl && (
                        <div className="mb-3 p-2 bg-slate-100 rounded-lg max-w-xs border border-slate-200">
                          <img
                            src={q.imageUrl}
                            alt="Diagram soal"
                            className="max-h-36 rounded object-contain mx-auto"
                          />
                        </div>
                      )}

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                        {q.options.map((opt) => (
                          <div
                            key={opt.label}
                            onClick={() => handleSelectOptionKey(originalIndex, opt.label)}
                            className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                              opt.isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-400'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 transition ${
                                opt.isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-300'
                              }`}
                            >
                              {opt.isCorrect ? <Check className="w-3 h-3" /> : opt.label}
                            </span>
                            <span className="flex-1 break-words">{opt.content}</span>
                          </div>
                        ))}
                      </div>

                      {/* Warning notice if invalid */}
                      {!q.isValid && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-100/70 px-2.5 py-1.5 rounded-lg border border-amber-300">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{q.error}</span>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">Pembahasan: </span>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-500">
            {questions.length > 0 ? (
              <span>
                Total <b>{validCount}</b> dari <b>{questions.length}</b> soal siap diimport.
              </span>
            ) : (
              <span>Pilih file .docx untuk memulai analisis soal.</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={validCount === 0 || isProcessing}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm ${
                validCount === 0 || isProcessing
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Bank Soal...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Import {validCount} Soal Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
