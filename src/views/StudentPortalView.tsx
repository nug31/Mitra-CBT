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
    setExams(allExams);

    // Get participant sessions for this student
    const studentSessions: ExamParticipant[] = [];
    for (const ex of allExams) {
      const part = await db.getParticipantSession(ex.id, currentStudent.id);
      studentSessions.push(part);
    }
    setParticipants(studentSessions);

    // Load results
    const allResults: ExamResult[] = [];
    for (const ex of allExams) {
      const rList = await db.getExamResults(ex.id);
      const myResult = rList.find(r => r.participant_id === studentSessions.find(s => s.exam_id === ex.id)?.id);
      if (myResult) allResults.push(myResult);
    }
    setResults(allResults);

    // Auto-detect exam from QR Code scan (?exam=...&pin=...) OR sessionStorage (after login redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const scannedExamId = urlParams.get('exam') || sessionStorage.getItem('qr_exam_id');
    const scannedPin = urlParams.get('pin') || sessionStorage.getItem('qr_exam_pin');

    // Clear sessionStorage after reading so it doesn't persist across page refreshes
    sessionStorage.removeItem('qr_exam_id');
    sessionStorage.removeItem('qr_exam_pin');

    if (scannedExamId) {
      const targetExam = allExams.find(e => e.id === scannedExamId);
      if (targetExam) {
        setPinModalExam(targetExam);
        if (scannedPin) {
          setPinInput(scannedPin.trim().toUpperCase());
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  const handleStartExamClick = (exam: Exam) => {
    setPinModalExam(exam);
    setPinInput('');
    setPinError(null);
  };

  const handleVerifyPinAndEnter = async () => {
    if (!pinModalExam || !currentStudent) return;
    if (pinInput.trim().toUpperCase() !== pinModalExam.pin_code.toUpperCase()) {
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

  // Auto-enter exam when PIN is pre-filled from QR scan (no manual submit needed)
  useEffect(() => {
    if (pinModalExam && pinInput && pinInput.trim().toUpperCase() === pinModalExam.pin_code.toUpperCase()) {
      handleVerifyPinAndEnter();
    }
  }, [pinModalExam, pinInput]);

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
    <div className="space-y-5 sm:space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-5 sm:p-8 text-white shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <img
            src={
              currentStudent?.profile?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStudent?.profile?.full_name || 'Siswa')}&background=0284c7&color=fff`
            }
            alt="Student Avatar"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-brand-500 object-cover shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-brand-500/20 text-sky-300 border border-brand-500/30">
                PORTAL PESERTA ASESMEN
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white mt-1 tracking-tight">
              {currentStudent?.profile?.full_name || 'Siswa Peserta'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              NISN: <span className="text-emerald-300 font-mono font-bold">{currentStudent?.nisn || '-'}</span> • Kelas: <span className="text-sky-300 font-bold">{currentStudent?.class?.name || '-'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-xs self-start sm:self-auto">
          <div className="text-left sm:text-right">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Tahun Ajaran</p>
            <p className="font-bold text-white">2024/2025 (Ganjil)</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-brand-600/30 flex items-center justify-center text-sky-400">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Exams Available */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-brand-600" />
            <span>Jadwal Ujian Tersedia Hari Ini</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Pastikan koneksi internet stabil sebelum memulai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {exams.map((exam) => {
            const session = participants.find(p => p.exam_id === exam.id);
            const isSubmitted = session?.status === 'submitted' || session?.status === 'force_submitted';
            const isInProgress = session?.status === 'in_progress';

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-brand-300 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                      {exam.assessment_type?.code || 'STS'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
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

                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exam.subject?.name}
                  </p>

                  {/* Badges Info */}
                  <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Durasi Pengerjaan</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        {exam.duration_minutes} Menit
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Jumlah Butir Soal</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">
                        {exam.question_count} Soal
                      </p>
                    </div>
                  </div>
                </div>

                {/* Entry Action */}
                <div>
                  {isSubmitted ? (
                    <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ujian ini telah selesai Anda kumpulkan</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartExamClick(exam)}
                      className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-2"
                    >
                      <span>{isInProgress ? 'Lanjutkan Ujian (Sesi Aktif)' : 'Masuk Ujian (Masukkan PIN)'}</span>
                      <ArrowRight className="w-4 h-4" />
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
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-slate-900">
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
                    <p className="text-lg font-black text-slate-900 font-mono leading-none">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Verifikasi PIN Ruang Ujian
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan 5-digit PIN Ujian yang ditampilkan guru pengawas di depan kelas:
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold text-slate-800">{pinModalExam.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Durasi: {pinModalExam.duration_minutes} Menit</p>
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
                placeholder="CONTOH: GT902"
                className="w-full text-center font-mono text-2xl font-black tracking-widest uppercase p-3 rounded-xl border-2 border-slate-300 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPinModalExam(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!pinInput.trim()}
                onClick={handleVerifyPinAndEnter}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 disabled:opacity-50"
              >
                Mulai Ujian Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
