import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { 
  Exam, 
  AssessmentType, 
  Subject, 
  ClassRoom 
} from '../types';
import { 
  Plus, 
  CalendarClock, 
  Projector, 
  Activity, 
  BarChart3, 
  Clock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Layers
} from 'lucide-react';
import { ExamModal } from '../components/exam/ExamModal';
import { QRCodeModal } from '../components/exam/QRCodeModal';

interface ExamManagementViewProps {
  onNavigateToMonitoring: (examId: string) => void;
  onNavigateToAnalytics: (examId: string) => void;
}

export const ExamManagementView: React.FC<ExamManagementViewProps> = ({
  onNavigateToMonitoring,
  onNavigateToAnalytics
}) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);

  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [qrModalExam, setQrModalExam] = useState<Exam | null>(null);

  // Filter
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [exList, types, subjs, cls] = await Promise.all([
      db.getExams(),
      db.getAssessmentTypes(),
      db.getSubjects(),
      db.getClasses()
    ]);
    setExams(exList);
    setAssessmentTypes(types);
    setSubjects(subjs);
    setClasses(cls);
  };

  const handleSaveExam = async (examData: Partial<Exam>) => {
    await db.saveExam(examData);
    await loadData();
  };

  const filteredExams = exams.filter(e => {
    if (selectedType === 'all') return true;
    return e.assessment_type_id === selectedType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen & Jadwal Ujian (CBT)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi penilaian sumatif, formatif, ulangan harian, dan remedial untuk SMK Mitra
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExam(null);
            setIsExamModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Ujian Baru</span>
        </button>
      </div>

      {/* Filter Tabs by Assessment Type */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 border ${
            selectedType === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Evaluasi ({exams.length})
        </button>

        {assessmentTypes.map((t) => {
          const count = exams.filter(e => e.assessment_type_id === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 border flex items-center gap-1.5 ${
                selectedType === t.id
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{t.code}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedType === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredExams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-brand-300 transition space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                    {exam.assessment_type?.code || 'UJIAN'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                    {exam.class?.name}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    exam.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 animate-pulse'
                      : exam.status === 'scheduled'
                      ? 'bg-sky-100 text-sky-700 border border-sky-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {exam.status === 'active' ? '🟢 Sedang Berlangsung' : exam.status === 'scheduled' ? 'Terjadwal' : 'Selesai'}
                </span>
              </div>

              {/* Title & Subject */}
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {exam.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {exam.subject?.name} ({exam.academic_year} - Semester {exam.semester})
              </p>

              {/* Badges Info */}
              <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Durasi</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    {exam.duration_minutes}m
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Jumlah Soal</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {exam.question_count} Soal
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Standar KKM</p>
                  <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                    {exam.kkm} Poin
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQrModalExam(exam)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs"
                >
                  <Projector className="w-3.5 h-3.5 text-sky-400" />
                  <span>PIN & QR Code</span>
                </button>

                <div className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                  PIN: {exam.pin_code}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigateToMonitoring(exam.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 text-xs font-semibold transition"
                  title="Live Monitoring Peserta"
                >
                  <Activity className="w-3.5 h-3.5 text-brand-600" />
                  <span>Monitoring</span>
                </button>

                <button
                  onClick={() => onNavigateToAnalytics(exam.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition"
                  title="Lihat Hasil & Analisis"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Hasil</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setEditingExam(null);
        }}
        onSave={handleSaveExam}
        initialExam={editingExam}
        assessmentTypes={assessmentTypes}
        subjects={subjects}
        classes={classes}
      />

      <QRCodeModal
        isOpen={!!qrModalExam}
        onClose={() => setQrModalExam(null)}
        exam={qrModalExam}
      />
    </div>
  );
};
