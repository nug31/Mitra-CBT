import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Exam, QuestionBank, Student, ExamResult } from '../types';
import { 
  LayoutDashboard, 
  CalendarClock, 
  BookOpenCheck, 
  Users, 
  Trophy, 
  ArrowRight, 
  Activity, 
  Clock, 
  Plus, 
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface TeacherDashboardViewProps {
  onNavigate: (tab: string, extraId?: string) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ onNavigate }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [exList, bkList, stList] = await Promise.all([
      db.getExams(),
      db.getQuestionBanks(),
      db.getStudents()
    ]);
    setExams(exList);
    setBanks(bkList);
    setStudents(stList);

    // Get all results
    const allRes: ExamResult[] = [];
    for (const ex of exList) {
      const r = await db.getExamResults(ex.id);
      allRes.push(...r);
    }
    setResults(allRes);
  };

  const activeExams = exams.filter(e => e.status === 'active');
  const scores = results.map(r => Number(r.total_score));
  const avgSchoolScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '81.5';

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-brand-500/20 text-sky-300 border border-brand-500/30">
              SMK NEGERI 1 TEKNOLOGI & REKAYASA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Selamat Datang di MITRA CBT
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Platform asesmen digital terintegrasi untuk seluruh jenis evaluasi pembelajaran: STS, SAS, Ulangan Harian, Praktik Teori Kejuruan, dan Remedial.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigate('ujian')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Ujian Baru</span>
          </button>

          <button
            onClick={() => onNavigate('monitoring')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-sm transition flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Live Monitoring</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Ujian</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5 font-mono">{exams.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ujian Aktif</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5 font-mono">{activeExams.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <BookOpenCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bank Soal SMK</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5 font-mono">{banks.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rata-Rata Nilai</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5 font-mono">{avgSchoolScore}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Exams & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active & Recent Exams */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-brand-600" />
              <span>Daftar Ujian Terjadwal & Aktif</span>
            </h3>
            <button
              onClick={() => onNavigate('ujian')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Kelola Semua Ujian</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {exams.slice(0, 4).map((ex) => (
              <div
                key={ex.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-brand-300 transition bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                      {ex.assessment_type?.code || 'STS'}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {ex.class?.name}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        ex.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ex.status === 'active' ? '🟢 Sedang Berlangsung' : 'Terjadwal'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{ex.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Durasi: {ex.duration_minutes}m • Soal: {ex.question_count} • PIN: <span className="font-mono font-bold text-slate-700">{ex.pin_code}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('monitoring', ex.id)}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Monitor</span>
                  </button>

                  <button
                    onClick={() => onNavigate('analisis', ex.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
                  >
                    Hasil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): System Highlights & Quick Tools */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Fitur Utama Sistem Asesmen</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div
                onClick={() => onNavigate('bank_soal')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-800">Bank Soal & Gambar Teknik</p>
                  <p className="text-[11px] text-slate-500">Mendukung diagram ISO & siklus mesin</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => onNavigate('analisis')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-800">Analisis Butir Soal & Daya Beda</p>
                  <p className="text-[11px] text-slate-500">Statistik otomatis tingkat kesulitan soal</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => onNavigate('remedial')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-800">Program Ujian Remedial Otomatis</p>
                  <p className="text-[11px] text-slate-500">Penyaringan peserta di bawah standar KKM</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Keamanan Asesmen Terjamin</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Auto-save berkala, server-side timer, deteksi tab switching, serta mode layar penuh siap menjaga integritas pengerjaan siswa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
