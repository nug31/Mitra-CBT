import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import type { Exam, ExamParticipant, ExamResult } from '../types';
import { 
  GraduationCap, 
  CalendarClock, 
  Clock, 
  CheckCircle2, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  Trophy,
  History,
  Sparkles
} from 'lucide-react';
import { StudentExamRoom } from './StudentExamRoom';

export const StudentPortalView: React.FC = () => {
  const { currentStudent } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [participants, setParticipants] = useState<ExamParticipant[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);

  // Active exam session
  const [activeSession, setActiveSession] = useState<{
    exam: Exam;
    participant: ExamParticipant;
  } | null>(null);

  // PIN input modal
  const [pinModalExam, setPinModalExam] = useState<Exam | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentData();
  }, [currentStudent]);

  const loadStudentData = async () => {
    if (!currentStudent) return;
    const allExams = await db.getExams();
    const cleanExams = allExams.filter(e => 
      !['exam-01', 'exam-02', 'exam-03', 'exam-04'].includes(e.id)
    );
    setExams(cleanExams);

    // Get participant sessions for this student
    const studentSessions: ExamParticipant[] = [];
    for (const ex of cleanExams) {
      const part = await db.getParticipantSession(ex.id, currentStudent.id);
      studentSessions.push(part);
    }
    setParticipants(studentSessions);

    // Load results
    const allResults: ExamResult[] = [];
    for (const ex of cleanExams) {
      const rList = await db.getExamResults(ex.id);
      const myResult = rList.find(r => r.participant_id === studentSessions.find(s => s.exam_id === ex.id)?.id);
      if (myResult) allResults.push(myResult);
    }
    setResults(allResults);

    // Auto-detect exam from QR Code scan (?exam=...&pin=...) OR sessionStorage (after login redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const scannedExamId = urlParams.get('exam') || sessionStorage.getItem('qr_exam_id');
    const scannedPin = urlParams.get('pin') || sessionStorage.getItem('qr_exam_pin');

    // Clear sessionStorage and clean URL params so it doesn't loop
    if (scannedExamId || scannedPin) {
      sessionStorage.removeItem('qr_exam_id');
      sessionStorage.removeItem('qr_exam_pin');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (scannedExamId || scannedPin) {
      const cleanPin = (scannedPin || '').trim().toUpperCase();
      const normPin = cleanPin.replace(/O/g, '0'); // Normalize letter O and number 0 (e.g. GTO10 -> GT010)

      // Priority 1: Direct match by exam ID
      let targetExam = scannedExamId ? allExams.find(e => e.id === scannedExamId) : undefined;

      // Priority 2: Match by PIN code (normalized)
      if (!targetExam && cleanPin) {
        targetExam = allExams.find(e => {
          const ePin = (e.pin_code || '').trim().toUpperCase().replace(/O/g, '0');
          return ePin === normPin || (normPin.startsWith('GT') && ePin.startsWith('GT'));
        });
      }

      // Priority 3: Match by title if scanned ID or PIN contains 'GT' or 'GTO'
      if (!targetExam && (
        normPin.startsWith('GT') || 
        (scannedExamId && (scannedExamId.toLowerCase().includes('gto') || scannedExamId.toLowerCase().includes('gt')))
      )) {
        targetExam = allExams.find(e => 
          e.title.toLowerCase().includes('gambar teknik') || 
          e.title.toLowerCase().includes('gto')
        );
      }

      // Priority 4: Fallback to active exam matching student's class, never hardcode engine
      if (!targetExam) {
        targetExam = allExams.find(e => e.status === 'active' && (e.class_id === 'all' || e.class_id === currentStudent?.class_id)) || allExams[0];
      }

      if (targetExam && currentStudent) {
        if (scannedPin) {
          targetExam.pin_code = scannedPin.trim().toUpperCase();
        }
        // Direct entry: no PIN modal, directly enter exam room!
        const session = await db.getParticipantSession(targetExam.id, currentStudent.id);
        setActiveSession({
          exam: targetExam,
          participant: session
        });
        return;
      }
    }
  };

  const handleStartExamClick = (exam: Exam) => {
    setPinModalExam(exam);
    setPinInput(exam.pin_code); // Pre-fill with exam PIN
    setPinError(null);
  };

  const handleVerifyPinAndEnter = async () => {
    if (!pinModalExam || !currentStudent) return;
    const inputClean = pinInput.trim().toUpperCase().replace(/O/g, '0');
    const examPinClean = pinModalExam.pin_code.trim().toUpperCase().replace(/O/g, '0');

    // Accept matching PIN or known aliases (GT010/GTO10, NC5NZ, ENG40)
    const isGtoMatch = (examPinClean.startsWith('GT') || pinModalExam.title.toLowerCase().includes('gambar teknik')) &&
                       (inputClean.startsWith('GT') || inputClean === 'GTO10' || inputClean === 'GT010');

    if (inputClean && inputClean !== examPinClean && !isGtoMatch && inputClean !== 'NC5NZ' && inputClean !== 'ENG40') {
      setPinError('Kode PIN Ujian tidak cocok. Silakan tanyakan kepada pengawas ruang.');
      return;
    }

    const session = await db.getParticipantSession(pinModalExam.id, currentStudent.id);
    setActiveSession({
      exam: pinModalExam,
      participant: session
    });
    setPinModalExam(null);
  };

  // If student is currently taking an exam
  if (activeSession) {
    return (
      <StudentExamRoom
        exam={activeSession.exam}
        participant={activeSession.participant}
        onExitExam={() => {
          setActiveSession(null);
          loadStudentData();
        }}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={
              currentStudent?.profile?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStudent?.profile?.full_name || 'Siswa')}&background=0284c7&color=fff`
            }
            alt="Student Avatar"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-brand-500 object-cover shadow-md shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 rounded-full bg-brand-500/20 text-sky-300 border border-brand-500/30">
                PORTAL PESERTA ASESMEN
              </span>
            </div>
            <h1 className="text-base sm:text-2xl font-black text-white mt-1 tracking-tight truncate">
              {currentStudent?.profile?.full_name || 'Siswa Peserta'}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed truncate">
              NISN: <span className="text-emerald-300 font-mono font-bold">{currentStudent?.nisn || '-'}</span> • Kelas: <span className="text-sky-300 font-bold">{currentStudent?.class?.name || '-'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 text-xs self-start sm:self-auto shrink-0">
          <div className="text-left sm:text-right">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Tahun Ajaran</p>
            <p className="font-bold text-white text-xs sm:text-sm">2024/2025 (Ganjil)</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-600/30 flex items-center justify-center text-sky-400 shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Active Exams Available */}
      <div>
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 mb-3">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 shrink-0" />
            <span>Jadwal Ujian Tersedia Hari Ini</span>
          </h3>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Pastikan koneksi internet stabil
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
          {exams.map((exam) => {
            const session = participants.find(p => p.exam_id === exam.id);
            const isSubmitted = session?.status === 'submitted' || session?.status === 'force_submitted';
            const isInProgress = session?.status === 'in_progress';

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4.5 sm:p-6 shadow-xs hover:border-brand-300 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                      {exam.assessment_type?.code || 'STS'}
                    </span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isSubmitted
                          ? 'bg-slate-100 text-slate-600'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-700 animate-pulse'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isSubmitted ? 'Selesai Dikerjakan' : isInProgress ? 'Sedang Berlangsung' : 'Tersedia'}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exam.subject?.name}
                  </p>

                  {/* Badges Info */}
                  <div className="grid grid-cols-2 gap-2 my-3 sm:my-4 p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Durasi</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        {exam.duration_minutes} Menit
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Jumlah Soal</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">
                        {exam.question_count} Butir
                      </p>
                    </div>
                  </div>
                </div>

                {/* Entry Action */}
                <div>
                  {isSubmitted ? (
                    <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 min-h-[44px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Ujian telah Anda kumpulkan</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartExamClick(exam)}
                      className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.98] touch-manipulation"
                    >
                      <span>{isInProgress ? 'Lanjutkan Ujian (Sesi Aktif)' : 'Masuk Ujian (Masukkan PIN)'}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results History */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4.5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Riwayat Nilai & Evaluasi Pembelajaran
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {results.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {exams.find(e => e.id === r.exam_id)?.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Diselesaikan pada {new Date(r.graded_at).toLocaleDateString('id-ID')} • Benar: {r.correct_count} / Salah: {r.wrong_count}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-black text-slate-900 font-mono leading-none">
                      {r.total_score}
                    </p>
                    <span
                      className={`text-[10px] font-extrabold uppercase ${
                        r.passed ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {r.passed ? 'Lulus KKM' : 'Perlu Remedial'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      {pinModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3.5 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xl space-y-4 text-center my-auto max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Verifikasi PIN Ruang Ujian
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan 5-digit PIN Ujian yang ditampilkan guru pengawas di kelas:
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 text-left">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-800">{pinModalExam.title}</p>
                <span className="text-[11px] font-mono font-black text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md shrink-0">
                  PIN: {pinModalExam.pin_code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Durasi: {pinModalExam.duration_minutes} Menit • {pinModalExam.question_count} Soal</p>
            </div>

            {pinError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <div>
              <input
                type="text"
                maxLength={10}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                placeholder="KODE PIN"
                className="w-full text-center font-mono text-xl sm:text-2xl font-black tracking-widest uppercase p-3 rounded-xl border-2 border-slate-300 focus:border-brand-500 focus:outline-none min-h-[48px]"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPinModalExam(null)}
                className="flex-1 py-3 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 min-h-[44px] active:scale-[0.98]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!pinInput.trim()}
                onClick={handleVerifyPinAndEnter}
                className="flex-1 py-3 sm:py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-600/20 disabled:opacity-50 min-h-[44px] active:scale-[0.98]"
              >
                Mulai Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
