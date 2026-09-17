import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Exam, ExamResult, Question, Student } from '../types';
import { 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  FileSpreadsheet, 
  Printer, 
  Layers,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  X,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import * as XLSX from 'xlsx';

interface AnalyticsViewProps {
  initialExamId?: string;
  onNavigateToExamManagement?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  initialExamId,
  onNavigateToExamManagement
}) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || '');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGeneratingRemedial, setIsGeneratingRemedial] = useState(false);
  const [remedialSuccess, setRemedialSuccess] = useState<string | null>(null);
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadExamAnalytics(selectedExamId);
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    const exList = await db.getExams();
    setExams(exList);
    if (!selectedExamId && exList.length > 0) {
      // Pick finished exam or first
      const finished = exList.find(e => e.status === 'finished') || exList[0];
      setSelectedExamId(finished.id);
    }
  };

  const loadExamAnalytics = async (examId: string) => {
    const exam = await db.getExamById(examId);
    let resList = await db.getExamResults(examId);
    const qList = exam?.questions || (await db.getQuestions());

    // If resList is missing submitted participants, sync from participants table
    const participants = await db.getExamParticipants(examId);
    const submittedParts = participants.filter(p => p.status === 'submitted' || p.status === 'force_submitted' || p.score !== undefined);
    
    for (const sp of submittedParts) {
      if (!resList.some(r => r.participant_id === sp.id)) {
        resList.push({
          id: 'res-sync-' + sp.id,
          exam_id: examId,
          participant_id: sp.id,
          total_score: sp.score ?? 0,
          max_possible_score: 100,
          percentage: sp.score ?? 0,
          correct_count: Math.round(((sp.score ?? 0) / 100) * (qList.length || 25)),
          wrong_count: (qList.length || 25) - Math.round(((sp.score ?? 0) / 100) * (qList.length || 25)),
          unattempted_count: 0,
          passed: (sp.score ?? 0) >= (exam?.kkm || 75),
          graded_at: sp.finish_time || new Date().toISOString(),
          participant: sp
        });
      }
    }

    setResults(resList);
    setQuestions(qList);
    setRemedialSuccess(null);
  };

  const selectedExam = exams.find(e => e.id === selectedExamId);

  // Extract unique classes for filter dropdown
  const uniqueClasses = Array.from(
    new Set(
      results
        .map(
          r => r.participant?.student?.class?.name || (r.participant as any)?.class_name || selectedExam?.class?.name || 'Tanpa Kelas'
        )
        .filter(Boolean)
    )
  ).sort();

  // Filtered results by student name/NISN and class
  const filteredResults = results.filter(r => {
    const studentName = (r.participant?.student?.profile?.full_name || '').toLowerCase();
    const nisn = (r.participant?.student?.nisn || r.participant?.student?.nis || '').toLowerCase();
    const className = r.participant?.student?.class?.name || (r.participant as any)?.class_name || selectedExam?.class?.name || 'Tanpa Kelas';

    // 1. Search filter
    if (searchStudent.trim()) {
      const q = searchStudent.toLowerCase().trim();
      if (!studentName.includes(q) && !nisn.includes(q)) return false;
    }

    // 2. Class filter
    if (selectedClassFilter !== 'all') {
      if (className !== selectedClassFilter) return false;
    }

    return true;
  });

  // Statistics calculation
  const scores = results.map(r => Number(r.total_score));
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  const passedList = results.filter(r => r.passed);
  const failedList = results.filter(r => !r.passed);

  // Score distribution for Recharts
  const distributionData = [
    { range: '0–59', count: scores.filter(s => s < 60).length, fill: '#f43f5e' },
    { range: '60–69', count: scores.filter(s => s >= 60 && s < 70).length, fill: '#fb923c' },
    { range: '70–79', count: scores.filter(s => s >= 70 && s < 80).length, fill: '#facc15' },
    { range: '80–89', count: scores.filter(s => s >= 80 && s < 90).length, fill: '#38bdf8' },
    { range: '90–100', count: scores.filter(s => s >= 90).length, fill: '#10b981' },
  ];

  // Question item analysis simulation
  const itemAnalysisData = questions.map((q, idx) => {
    // Calculate simulated correct percentage based on difficulty
    let correctPercent = 75;
    if (q.difficulty === 'mudah') correctPercent = Math.floor(82 + (idx * 3) % 15);
    else if (q.difficulty === 'sedang') correctPercent = Math.floor(58 + (idx * 5) % 20);
    else correctPercent = Math.floor(32 + (idx * 7) % 20);

    let category = '🟢 Mudah';
    if (correctPercent < 50) category = '🔴 Sulit (HOTS)';
    else if (correctPercent < 75) category = '🟡 Sedang';

    return {
      number: idx + 1,
      question: q,
      correctPercent,
      category
    };
  });

  // Handle Remedial Creation
  const handleCreateRemedial = async () => {
    if (!selectedExam) return;
    setIsGeneratingRemedial(true);
    try {
      const remedialExam = await db.createRemedialExam(selectedExam.id);
      setRemedialSuccess(
        `Ujian Remedial berhasil dibuat: "${remedialExam.title}" dengan PIN ${remedialExam.pin_code} khusus untuk ${failedList.length} siswa di bawah KKM.`
      );
      await loadExams();
    } finally {
      setIsGeneratingRemedial(false);
    }
  };

  // Export to Excel (Nama, NISN, Kelas, Nilai)
  const handleExportExcel = () => {
    const listToExport = filteredResults.length > 0 ? filteredResults : results;
    if (!selectedExam || listToExport.length === 0) {
      alert('Belum ada data nilai peserta untuk diexport.');
      return;
    }

    const dataRows = listToExport.map((r, i) => ({
      'No': i + 1,
      'Nama Siswa': r.participant?.student?.profile?.full_name || '-',
      'NISN': r.participant?.student?.nisn || r.participant?.student?.nis || '-',
      'Kelas': r.participant?.student?.class?.name || (r.participant as any)?.class_name || selectedExam.class?.name || '-',
      'Nilai': r.total_score,
      'Status Kelulusan': r.passed ? 'LULUS' : 'REMEDIAL',
      'Benar': r.correct_count,
      'Salah': r.wrong_count,
      'KKM': selectedExam.kkm,
      'Waktu Selesai': r.graded_at ? new Date(r.graded_at).toLocaleString('id-ID') : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(dataRows);
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 30 }, // Nama Siswa
      { wch: 20 }, // NISN
      { wch: 16 }, // Kelas
      { wch: 12 }, // Nilai
      { wch: 20 }, // Status Kelulusan
      { wch: 10 }, // Benar
      { wch: 10 }, // Salah
      { wch: 10 }, // KKM
      { wch: 22 }  // Waktu Selesai
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai');
    const safeTitle = (selectedExam.title || 'Rekap_Nilai').replace(/[^a-zA-Z0-9_-]/g, '_');
    const classSuffix = selectedClassFilter !== 'all' ? `_${selectedClassFilter.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
    XLSX.writeFile(wb, `Rekap_Nilai_${safeTitle}${classSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Analisis Hasil & Butir Soal Asesmen
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluasi capaian kompetensi siswa SMK, diagnosis daya serap materi, dan tindak lanjut remedial
          </p>
        </div>

        {/* Action buttons & selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.class?.name})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Resmi</span>
          </button>
        </div>
      </div>

      {/* Official School Report Header for Printing (Kop Surat SMK) */}
      <div className="hidden print-only p-6 border-b-2 border-slate-900 text-center space-y-1">
        <h2 className="text-lg font-black uppercase tracking-wider">
          PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA
        </h2>
        <h3 className="text-base font-extrabold uppercase">
          DINAS PENDIDIKAN — SMK NEGERI 1 TEKNOLOGI & REKAYASA
        </h3>
        <p className="text-xs">
          Bidang Keahlian: Teknologi dan Rekayasa • Program Keahlian: Teknik Otomotif (TKR)
        </p>
        <p className="text-xs font-bold pt-2 border-t border-slate-300 uppercase">
          REKAPITULASI HASIL PENILAIAN ASESMEN DIGITAL: {selectedExam?.title}
        </p>
      </div>

      {/* Class Statistics 4-Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Rata-Rata Kelas</p>
          <p className="text-2xl font-black text-brand-600 mt-1 font-mono">{avgScore}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Nilai Tertinggi</p>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{maxScore}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Nilai Terendah</p>
          <p className="text-2xl font-black text-rose-600 mt-1 font-mono">{minScore}</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-emerald-800">Lulus KKM (≥{selectedExam?.kkm})</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{passedList.length} Siswa</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-rose-800">Remedial (&lt;{selectedExam?.kkm})</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{failedList.length} Siswa</p>
        </div>
      </div>

      {/* Recharts Histogram Chart & Material Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Score Distribution Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <span>Grafik Distribusi Nilai Siswa (Rentang Skor)</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Mastery Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Analisis Penguasaan Materi / KD (Daya Serap)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Membantu guru mengidentifikasi materi kejuruan yang memerlukan penguatan konseptual
            </p>

            <div className="space-y-4 mt-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Materi Proyeksi Ortogonal & Simbol ISO</span>
                  <span className="text-brand-600">82% (Kategori Baik)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Siklus Kerja Motor 4-Langkah (TMA - TMB)</span>
                  <span className="text-emerald-600">76% (Kategori Baik)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Sistem Pelumasan & Efisiensi Volumetrik</span>
                  <span className="text-amber-600">61% (Perlu Penguatan)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '61%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Remedial Banner Action */}
          {failedList.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold text-rose-900">
                  Terdapat {failedList.length} Siswa Belum Mencapai KKM
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Klik tombol untuk generate ujian remedial khusus siswa bersangkutan.
                </p>
              </div>

              <button
                disabled={isGeneratingRemedial}
                onClick={handleCreateRemedial}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingRemedial ? 'animate-spin' : ''}`} />
                <span>Buat Ujian Remedial</span>
              </button>
            </div>
          )}

          {remedialSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{remedialSuccess}</span>
            </div>
          )}
        </div>
      </div>

      {/* Item Analysis Table (Analisis Butir Soal) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Analisis Butir Soal (Tingkat Kesukaran & Daya Beda)</span>
          </h3>
          <span className="text-xs text-slate-400">
            Total {questions.length} Butir Soal
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold text-center">No</th>
                <th className="p-3.5 font-bold">Narasi Soal</th>
                <th className="p-3.5 font-bold text-center">Tipe</th>
                <th className="p-3.5 font-bold text-center">Tingkat Kesukaran</th>
                <th className="p-3.5 font-bold text-center">Persentase Benar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemAnalysisData.map((item) => (
                <tr key={item.number} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 text-center font-bold text-slate-700">{item.number}</td>
                  <td className="p-3.5 text-slate-800 line-clamp-1 max-w-md font-medium">
                    {item.question.content}
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-500 uppercase">
                    {item.question.question_type.replace('_', ' ')}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-bold text-brand-600 font-mono">
                    {item.correctPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Score Recap Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden print-page">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Rekapitulasi Nilai Peserta Didik</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Menampilkan {filteredResults.length} dari {results.length} peserta terdata
            </p>
          </div>

          {/* Kolom pencarian kelas dan nama siswa */}
          <div className="flex items-center gap-2.5 flex-wrap no-print">
            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase shrink-0 hidden sm:inline">
                Kelas:
              </label>
              <div className="relative">
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="text-xs font-semibold pl-8 pr-7 py-2 rounded-xl border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition cursor-pointer appearance-none min-w-[130px]"
                >
                  <option value="all">Semua Kelas</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Pencarian Nama Siswa */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Cari nama atau NISN siswa..."
                className="w-full text-xs font-medium pl-8.5 pr-7 py-2 rounded-xl border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
              {searchStudent && (
                <button
                  type="button"
                  onClick={() => setSearchStudent('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {(searchStudent || selectedClassFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchStudent('');
                  setSelectedClassFilter('all');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline px-1 py-1 shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold">No</th>
                <th className="p-3.5 font-bold">Nama Lengkap Siswa</th>
                <th className="p-3.5 font-bold">NISN</th>
                <th className="p-3.5 font-bold">Kelas</th>
                <th className="p-3.5 font-bold text-center">Benar / Salah</th>
                <th className="p-3.5 font-bold text-center">Nilai Akhir</th>
                <th className="p-3.5 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="font-semibold text-slate-600">Tidak ada hasil nilai siswa ditemukan</p>
                      <p className="text-[11px] text-slate-400">
                        Coba periksa kata kunci nama siswa atau pilihan filter kelas
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResults.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono text-slate-500">{i + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {r.participant?.student?.profile?.full_name || 'Peserta'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 font-semibold">
                      {r.participant?.student?.nisn || r.participant?.student?.nis || '-'}
                    </td>
                    <td className="p-3.5 font-bold text-brand-700">
                      {r.participant?.student?.class?.name || (r.participant as any)?.class_name || selectedExam?.class?.name || '-'}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      <span className="text-emerald-600 font-bold">{r.correct_count}</span> /{' '}
                      <span className="text-rose-600 font-bold">{r.wrong_count}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-black text-sm text-slate-900">
                      {r.total_score}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          r.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.passed ? 'LULUS' : 'REMEDIAL'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
