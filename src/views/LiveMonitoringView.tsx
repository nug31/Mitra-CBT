import React, { useState, useEffect } from 'react';
import { db, realtimeBus, getRealtimeChannel } from '../services/db';
import { Exam, ExamParticipant, ExamEvent } from '../types';
import { 
  Activity, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  Wifi, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  Eye
} from 'lucide-react';

interface LiveMonitoringViewProps {
  initialExamId?: string;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({ initialExamId }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || '');
  const [participants, setParticipants] = useState<ExamParticipant[]>([]);
  const [events, setEvents] = useState<ExamEvent[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'submitted' | 'warning'>('all');

  useEffect(() => {
    loadExams();
  }, []);

  const isMatchingExam = (examId: string, examTitle?: string) => {
    if (!selectedExamId) return true;
    if (examId === selectedExamId) return true;
    const cur = exams.find(e => e.id === selectedExamId);
    const curTitle = (cur?.title || '').toLowerCase();
    const otherTitle = (examTitle || '').toLowerCase();
    const isCurEngine = curTitle.includes('konversi') || curTitle.includes('engine') || curTitle.includes('motor bakar');
    const isOtherEngine = otherTitle.includes('konversi') || otherTitle.includes('engine') || otherTitle.includes('motor bakar') || examId === 'exam-02' || examId === 'exam-04';
    return isCurEngine && isOtherEngine;
  };

  useEffect(() => {
    if (selectedExamId) {
      loadExamSession(selectedExamId);
    }

    // Subscribe to realtime updates
    const unsubPart = realtimeBus.subscribe('participant_updated', (updated: ExamParticipant) => {
      if (isMatchingExam(updated.exam_id, updated.exam?.title)) {
        setParticipants(prev => {
          const idx = prev.findIndex(p => p.id === updated.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...updated };
            return next;
          }
          return [...prev, updated];
        });
      }
    });

    const unsubEvent = realtimeBus.subscribe('event_logged', (ev: ExamEvent) => {
      if (isMatchingExam(ev.exam_id, ev.details?.exam_title)) {
        setEvents(prev => [ev, ...prev]);
      }
    });

    // Listen to Presence updates dispatched safely through realtimeBus
    const unsubPresence = realtimeBus.subscribe('presence_synced', (activePresences: any[]) => {
      try {
        if (!Array.isArray(activePresences)) return;
        const liveParticipants: ExamParticipant[] = [];

        activePresences.forEach((p: any) => {
          if (!p.student_name && !p.student_id) return;
          if (!isMatchingExam(p.exam_id, p.exam_title)) return;

          liveParticipants.push({
            id: p.participant_id || ('part-' + p.student_id),
            exam_id: p.exam_id || selectedExamId,
            student_id: p.student_id,
            status: p.status || 'in_progress',
            start_time: p.start_time || new Date().toISOString(),
            remaining_seconds: p.remaining_seconds,
            tab_switch_count: p.tab_switch_count || 0,
            cheat_warning_count: p.cheat_warning_count || 0,
            student: {
              id: p.student_id,
              profile_id: 'prof-' + p.student_id,
              class_id: 'cls-tkr-12',
              status: 'active',
              nis: p.student_nis || p.student_id,
              profile: {
                id: 'prof-' + p.student_id,
                email: `${p.student_nis || p.student_id}@siswa.mitracbt.id`,
                full_name: p.student_name,
                role: 'siswa',
                created_at: ''
              },
              class: {
                id: 'cls-tkr-12',
                name: p.class_name || 'XII TKR',
                grade: 'XII',
                major: 'TKR',
                academic_year: '2024/2025'
              }
            },
            exam: exams.find(e => e.id === p.exam_id) || {
              id: p.exam_id,
              title: p.exam_title || 'Ujian Engine',
              duration_minutes: 90,
              question_count: p.total_questions || 25,
              kkm: 75,
              pin_code: 'NC5NZ',
              status: 'active',
              academic_year: '2024/2025',
              semester: 'Ganjil',
              start_time: '',
              end_time: '',
              assessment_type_id: '',
              subject_id: '',
              class_id: '',
              teacher_id: '',
              randomize_questions: true,
              randomize_options: true,
              allow_backward: true,
              fullscreen_mode: true,
              single_attempt: true,
              show_results_immediately: false,
              show_explanation: false
            }
          });
        });

        if (liveParticipants.length > 0) {
          setParticipants(prev => {
            const map = new Map(prev.map(item => [item.id, item]));
            liveParticipants.forEach(lp => {
              const existing = map.get(lp.id);
              map.set(lp.id, { ...existing, ...lp });
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.error('Error handling presence_synced:', err);
      }
    });

    // Ping active students immediately
    realtimeBus.emit('ping_active_students', { requested_by: 'teacher' });

    return () => {
      unsubPart();
      unsubEvent();
      unsubPresence();
    };
  }, [selectedExamId, exams]);

  const loadExams = async () => {
    const exList = await db.getExams();
    setExams(exList);
    if (!selectedExamId && exList.length > 0) {
      // Prioritize engine / XII TKR exam
      const engineExam = exList.find(e => e.title.includes('Dasar Konversi') || e.id === 'exam-04') ||
                         exList.find(e => e.status === 'active') || 
                         exList[0];
      setSelectedExamId(engineExam.id);
    }
  };

  const loadExamSession = async (examId: string) => {
    const [partList, evList] = await Promise.all([
      db.getExamParticipants(examId),
      db.getEvents(examId)
    ]);

    // Cross-merge engine participants if teacher is on an engine exam
    let combinedParticipants = [...partList];
    const curExam = exams.find(e => e.id === examId);
    const isEngine = (curExam?.title || '').toLowerCase().includes('konversi') || (curExam?.title || '').toLowerCase().includes('engine');
    if (isEngine) {
      const otherIds = ['exam-02', 'exam-04'].filter(id => id !== examId);
      for (const oid of otherIds) {
        const otherParts = await db.getExamParticipants(oid);
        for (const op of otherParts) {
          if (!combinedParticipants.find(p => p.id === op.id)) {
            combinedParticipants.push(op);
          }
        }
      }
    }

    setParticipants(combinedParticipants);
    setEvents(evList);

    // Ping all active students to instantly sync their state
    realtimeBus.emit('ping_active_students', { examId });
  };

  const handleForceSubmit = async (participantId: string, studentName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin memaksa mengumpulkan ujian peserta: ${studentName}?`)) {
      await db.submitExam(participantId);
      await loadExamSession(selectedExamId);
    }
  };

  const selectedExam = exams.find(e => e.id === selectedExamId);

  // Metrics
  const totalCount = participants.length;
  const inProgressCount = participants.filter(p => p.status === 'in_progress').length;
  const submittedCount = participants.filter(p => p.status === 'submitted' || p.status === 'force_submitted').length;
  const notStartedCount = participants.filter(p => p.status === 'not_started').length;
  const warningCount = participants.filter(p => (p.cheat_warning_count || 0) > 0).length;

  // Filter list
  const filteredParticipants = participants.filter(p => {
    if (activeFilter === 'in_progress') return p.status === 'in_progress';
    if (activeFilter === 'submitted') return p.status === 'submitted' || p.status === 'force_submitted';
    if (activeFilter === 'warning') return (p.cheat_warning_count || 0) > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Live Monitoring Pengawas CBT</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                REALTIME
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau progres pengerjaan, status koneksi, dan deteksi aktivitas integritas siswa secara langsung
          </p>
        </div>

        {/* Exam selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase shrink-0">
            Pilih Ujian:
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.class?.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-[11px] font-bold uppercase opacity-70">Total Peserta</p>
          <p className="text-2xl font-black mt-1">{totalCount}</p>
        </button>

        <button
          onClick={() => setActiveFilter('in_progress')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeFilter === 'in_progress'
              ? 'bg-brand-600 text-white border-brand-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-[11px] font-bold uppercase text-brand-600">Sedang Mengerjakan</p>
          <p className="text-2xl font-black mt-1 text-brand-600">{inProgressCount}</p>
        </button>

        <button
          onClick={() => setActiveFilter('submitted')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeFilter === 'submitted'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-[11px] font-bold uppercase text-emerald-600">Selesai Submit</p>
          <p className="text-2xl font-black mt-1 text-emerald-600">{submittedCount}</p>
        </button>

        <div className="p-4 rounded-2xl border bg-white border-slate-200 text-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Belum Mulai</p>
          <p className="text-2xl font-black mt-1 text-slate-400">{notStartedCount}</p>
        </div>

        <button
          onClick={() => setActiveFilter('warning')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeFilter === 'warning'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-[11px] font-bold uppercase text-rose-600">Perlu Perhatian</p>
          <p className="text-2xl font-black mt-1 text-rose-600">{warningCount}</p>
        </button>
      </div>

      {/* Main Grid: Student Table (Left 3 cols) & Realtime Event Stream (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Participants Table */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Daftar Peserta Ruang Ujian</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              PIN: {selectedExam?.pin_code}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Nama Peserta / NIS</th>
                  <th className="p-3.5 font-bold text-center">Status Sesi</th>
                  <th className="p-3.5 font-bold text-center">Aktivitas Integritas</th>
                  <th className="p-3.5 font-bold text-center">Nilai / Skor</th>
                  <th className="p-3.5 font-bold text-right">Aksi Pengawas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Tidak ada peserta pada filter ini
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => {
                    const cheatCount = p.cheat_warning_count || 0;
                    const isWarning = cheatCount >= 3;
                    const isAttention = cheatCount > 0 && cheatCount < 3;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        {/* Name & NIS */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                p.student?.profile?.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(p.student?.profile?.full_name || 'S')}&background=0284c7&color=fff`
                              }
                              alt="Avatar"
                              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                            />
                            <div>
                              <p className="font-bold text-slate-900">
                                {p.student?.profile?.full_name || 'Peserta'}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                NIS: {p.student?.nis || '-'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center">
                          {p.status === 'in_progress' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Mengerjakan
                            </span>
                          )}
                          {(p.status === 'submitted' || p.status === 'force_submitted') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Selesai
                            </span>
                          )}
                          {p.status === 'not_started' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                              Belum Mulai
                            </span>
                          )}
                        </td>

                        {/* Activity & Integrity Indicator */}
                        <td className="p-3.5 text-center">
                          {isWarning ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              🚨 Pelanggaran Tab ({p.tab_switch_count || cheatCount}x)
                            </span>
                          ) : isAttention ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              ⚠️ Buka Tab ({p.tab_switch_count || cheatCount}x)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              🟢 Normal
                            </span>
                          )}
                        </td>

                        {/* Score */}
                        <td className="p-3.5 text-center font-mono font-extrabold text-sm">
                          {p.status === 'submitted' || p.status === 'force_submitted' ? (
                            <span className={p.passed ? 'text-emerald-600' : 'text-rose-600'}>
                              {p.score ?? '-'}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-sans text-xs">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          {p.status === 'in_progress' && (
                            <button
                              onClick={() => handleForceSubmit(p.id, p.student?.profile?.full_name || 'Peserta')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold transition inline-flex items-center gap-1"
                              title="Paksa pengumpulan jika waktu habis atau kendala"
                            >
                              <Send className="w-3 h-3" />
                              <span>Paksa Submit</span>
                            </button>
                          )}
                          {(p.status === 'submitted' || p.status === 'force_submitted') && (
                            <span className="text-[11px] text-slate-400">Terkunci</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Realtime Event Stream (Right Column) */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Live Log Aktivitas</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Stream</span>
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Belum ada aktivitas tercatat</p>
            ) : (
              events.map((ev) => {
                let badgeColor = 'bg-slate-100 text-slate-700';
                if (ev.event_type === 'TAB_SWITCH' || ev.event_type === 'FULLSCREEN_EXIT') {
                  badgeColor = 'bg-rose-100 text-rose-800 border border-rose-200';
                } else if (ev.event_type === 'START_EXAM') {
                  badgeColor = 'bg-brand-100 text-brand-800';
                } else if (ev.event_type === 'SUBMIT_EXAM') {
                  badgeColor = 'bg-emerald-100 text-emerald-800';
                }

                return (
                  <div key={ev.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-800 line-clamp-1">
                        {ev.participant_name || 'Peserta'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(ev.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${badgeColor}`}>
                        {ev.event_type === 'TAB_SWITCH' ? '🚨 BUKA TAB LAIN' : ev.event_type.replace('_', ' ')}
                      </span>
                      {ev.event_type === 'TAB_SWITCH' && ev.details?.count && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 rounded border border-rose-200">
                          Ke-{ev.details.count} (Maks {ev.details.max || 3}x)
                        </span>
                      )}
                    </div>

                    {(ev.details?.note || ev.details?.reason) && (
                      <p className="text-[10px] text-slate-600 font-medium line-clamp-2">
                        {ev.details?.note || ev.details?.reason}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
