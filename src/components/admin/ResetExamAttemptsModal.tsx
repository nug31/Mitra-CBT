import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Loader2, AlertTriangle, FileWarning } from 'lucide-react';
import { Student } from '../../types';
import { db } from '../../services/db';

interface Attempt {
  participantId: string;
  examId: string;
  examTitle: string;
  status: string;
  score?: number;
  tab_switch_count: number;
  cheat_warning_count: number;
}

interface ResetExamAttemptsModalProps {
  student: Student;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  not_started: { text: 'Belum Mulai', className: 'bg-slate-100 text-slate-600' },
  in_progress: { text: 'Sedang Mengerjakan', className: 'bg-amber-100 text-amber-700' },
  submitted: { text: 'Selesai', className: 'bg-emerald-100 text-emerald-700' },
  force_submitted: { text: 'Dipaksa Submit', className: 'bg-rose-100 text-rose-700' }
};

export const ResetExamAttemptsModal: React.FC<ResetExamAttemptsModalProps> = ({ student, onClose }) => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    setLoading(true);
    try {
      const data = await db.getStudentExamAttempts(student.id);
      setAttempts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (attempt: Attempt) => {
    if (
      !confirm(
        `Reset ujian "${attempt.examTitle}" untuk ${student.profile?.full_name}?\n\nJawaban, riwayat pelanggaran, dan nilai sesi ini akan dihapus supaya siswa bisa mengerjakan dari awal. Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }
    setResettingId(attempt.participantId);
    setError('');
    try {
      await db.resetParticipantSession(attempt.participantId);
      await loadAttempts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Reset Ujian Siswa</h2>
              <p className="text-xs text-slate-500">{student.profile?.full_name} — {student.nisn || student.nis}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat riwayat ujian...
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-slate-400">
              <FileWarning className="w-8 h-8" />
              <p className="text-xs">Siswa ini belum pernah mengikuti ujian apa pun.</p>
            </div>
          ) : (
            attempts.map(a => {
              const statusInfo = STATUS_LABEL[a.status] || { text: a.status, className: 'bg-slate-100 text-slate-600' };
              const canReset = a.status !== 'not_started';
              return (
                <div
                  key={a.participantId}
                  className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{a.examTitle}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                      {a.score !== undefined && (
                        <span className="text-[11px] text-slate-500 font-mono">Nilai: {a.score}</span>
                      )}
                      {a.cheat_warning_count > 0 && (
                        <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {a.cheat_warning_count}x pelanggaran
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    disabled={!canReset || resettingId === a.participantId}
                    onClick={() => handleReset(a)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                    title={canReset ? 'Reset agar bisa mengerjakan ulang' : 'Belum dimulai, tidak perlu direset'}
                  >
                    {resettingId === a.participantId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    Reset
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
