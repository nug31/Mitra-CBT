import React, { useState, useEffect } from 'react';
import {
  Exam,
  AssessmentType,
  Subject,
  ClassRoom,
  Question,
  QuestionBank,
  ALL_CLASSES_ID
} from '../../types';
import { 
  X, 
  CalendarClock, 
  Shuffle, 
  Settings, 
  Check, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { db } from '../../services/db';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (examData: Partial<Exam>) => Promise<void>;
  initialExam?: Exam | null;
  assessmentTypes: AssessmentType[];
  subjects: Subject[];
  classes: ClassRoom[];
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExam,
  assessmentTypes,
  subjects,
  classes
}) => {
  const [availableBanks, setAvailableBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('auto');

  const [assessmentTypeId, setAssessmentTypeId] = useState(
    initialExam?.assessment_type_id || (assessmentTypes[0]?.id ?? '')
  );
  const [subjectId, setSubjectId] = useState(
    initialExam?.subject_id || (subjects[0]?.id ?? '')
  );
  const [classId, setClassId] = useState(
    initialExam?.class_id || (classes[0]?.id ?? '')
  );
  const [title, setTitle] = useState(initialExam?.title || '');
  const [academicYear, setAcademicYear] = useState(initialExam?.academic_year || '2024/2025');
  const [semester, setSemester] = useState(initialExam?.semester || 'Ganjil');
  const [durationMinutes, setDurationMinutes] = useState(initialExam?.duration_minutes || 90);
  const [kkm, setKkm] = useState(initialExam?.kkm || 75);
  const [questionCount, setQuestionCount] = useState(initialExam?.question_count || 40);

  // Settings
  const [randomizeQuestions, setRandomizeQuestions] = useState(initialExam?.randomize_questions ?? true);
  const [randomizeOptions, setRandomizeOptions] = useState(initialExam?.randomize_options ?? true);
  const [allowBackward, setAllowBackward] = useState(initialExam?.allow_backward ?? true);
  const [fullscreenMode, setFullscreenMode] = useState(initialExam?.fullscreen_mode ?? true);
  const [singleAttempt, setSingleAttempt] = useState(initialExam?.single_attempt ?? true);
  const [showResultsImmediately, setShowResultsImmediately] = useState(initialExam?.show_results_immediately ?? false);
  const [showExplanation, setShowExplanation] = useState(initialExam?.show_explanation ?? false);

  // Random Engine Breakdown
  const [easyCount, setEasyCount] = useState(10);
  const [mediumCount, setMediumCount] = useState(20);
  const [hardCount, setHardCount] = useState(10);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    db.getQuestionBanks().then(bList => {
      setAvailableBanks(bList);
    });
  }, [isOpen]);

  // Sync all form fields whenever the modal opens or initialExam changes (Edit mode)
  useEffect(() => {
    if (!isOpen) return;
    if (initialExam) {
      setAssessmentTypeId(initialExam.assessment_type_id || (assessmentTypes[0]?.id ?? ''));
      setSubjectId(initialExam.subject_id || (subjects[0]?.id ?? ''));
      setClassId(initialExam.class_id || (classes[0]?.id ?? ''));
      setTitle(initialExam.title || '');
      setAcademicYear(initialExam.academic_year || '2024/2025');
      setSemester(initialExam.semester || 'Ganjil');
      setDurationMinutes(initialExam.duration_minutes || 90);
      setKkm(initialExam.kkm || 75);
      setQuestionCount(initialExam.question_count || 40);
      setRandomizeQuestions(initialExam.randomize_questions ?? true);
      setRandomizeOptions(initialExam.randomize_options ?? true);
      setAllowBackward(initialExam.allow_backward ?? true);
      setFullscreenMode(initialExam.fullscreen_mode ?? true);
      setSingleAttempt(initialExam.single_attempt ?? true);
      setShowResultsImmediately(initialExam.show_results_immediately ?? false);
      setShowExplanation(initialExam.show_explanation ?? false);
    } else {
      // Reset for new exam
      setAssessmentTypeId(assessmentTypes[0]?.id ?? '');
      setSubjectId(subjects[0]?.id ?? '');
      setClassId(classes[0]?.id ?? '');
      setTitle('');
      setAcademicYear('2024/2025');
      setSemester('Ganjil');
      setDurationMinutes(90);
      setKkm(75);
      setQuestionCount(40);
      setRandomizeQuestions(true);
      setRandomizeOptions(true);
      setAllowBackward(true);
      setFullscreenMode(true);
      setSingleAttempt(true);
      setShowResultsImmediately(false);
      setShowExplanation(false);
    }
  }, [isOpen, initialExam]);

  // Auto-generate title based on Type, Subject, and Class (only for new exams)
  useEffect(() => {
    if (!initialExam) {
      const selectedType = assessmentTypes.find(t => t.id === assessmentTypeId);
      const selectedSubj = subjects.find(s => s.id === subjectId);
      const selectedCls = classes.find(c => c.id === classId);

      if (selectedType && selectedSubj) {
        const shortSubj = selectedSubj.name.split(' ')[0] + ' ' + (selectedSubj.name.split(' ')[1] || '');
        const clsLabel = classId === ALL_CLASSES_ID ? 'Semua Kelas' : (selectedCls?.name || '');
        setTitle(`${selectedType.code} ${shortSubj} ${clsLabel}`.trim());
      }
    }
  }, [assessmentTypeId, subjectId, classId]);

  // Handle bank change
  const handleBankChange = (bId: string) => {
    setSelectedBankId(bId);
    if (bId !== 'auto') {
      const b = availableBanks.find(x => x.id === bId);
      if (b) {
        if (b.subject_id) setSubjectId(b.subject_id);
        if (b.question_count) setQuestionCount(b.question_count);
        const selType = assessmentTypes.find(t => t.id === assessmentTypeId);
        const prefix = selType?.code || 'STS';
        const cleanTitle = b.title.replace(/^Bank Soal (Komprehensif )?/i, '');
        const selCls = classes.find(c => c.id === classId);
        setTitle(`${prefix} ${cleanTitle} ${selCls ? selCls.name : ''}`.trim());
      }
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Pick questions from selected bank or banks matching the subject and target grade
      const allQuestions = await db.getQuestions();
      let candidateQuestions: Question[] = [];

      if (selectedBankId && selectedBankId !== 'auto') {
        candidateQuestions = allQuestions.filter(q => q.bank_id === selectedBankId);
      } else {
        const subjectBanks = (await db.getQuestionBanks()).filter(b => b.subject_id === subjectId);
        const currentClass = classes.find(c => c.id === classId);
        const classGrade = currentClass?.grade; // 'X' | 'XI' | 'XII'

        let candidateBanks = subjectBanks;
        if (classGrade) {
          const matchingBanks = subjectBanks.filter(b => !b.target_grades || b.target_grades.length === 0 || b.target_grades.includes(classGrade));
          if (matchingBanks.length > 0) {
            candidateBanks = matchingBanks;
          }
        }

        const bankIds = candidateBanks.map(b => b.id);
        candidateQuestions = allQuestions.filter(q => bankIds.includes(q.bank_id));

        if (classGrade) {
          const gradeQuestions = candidateQuestions.filter(q => !q.target_grades || q.target_grades.length === 0 || q.target_grades.includes(classGrade));
          if (gradeQuestions.length > 0) {
            candidateQuestions = gradeQuestions;
          }
        }
      }

      if (candidateQuestions.length === 0) {
        candidateQuestions = allQuestions; // fallback to available questions
      }

      await onSave({
        id: initialExam?.id,
        title,
        assessment_type_id: assessmentTypeId,
        subject_id: subjectId,
        class_id: classId,
        academic_year: academicYear,
        semester,
        duration_minutes: Number(durationMinutes),
        question_count: Math.min(Number(questionCount), candidateQuestions.length || 40),
        kkm: Number(kkm),
        randomize_questions: randomizeQuestions,
        randomize_options: randomizeOptions,
        allow_backward: allowBackward,
        fullscreen_mode: fullscreenMode,
        single_attempt: singleAttempt,
        show_results_immediately: showResultsImmediately,
        show_explanation: showExplanation,
        questions: candidateQuestions.slice(0, Number(questionCount) || 40),
        status: initialExam?.status || 'active',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {initialExam ? 'Konfigurasi Ujian' : 'Buat Jadwal Ujian Baru (Mitra Exam)'}
              </h3>
              <p className="text-xs text-slate-500">
                Struktur: Jenis Evaluasi → Mata Pelajaran → Kelas → Bank Soal → Ujian
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
          {/* Sumber Bank Soal Selector */}
          <div className="bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200/90 space-y-1.5">
            <label className="block text-xs font-bold text-sky-950 uppercase">
              Sumber Bank Soal (Pilih Bank Soal Hasil Import / Kurasi Guru)
            </label>
            <select
              value={selectedBankId}
              onChange={(e) => handleBankChange(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-sky-300 bg-white text-slate-800 focus:ring-2 focus:ring-brand-500 shadow-2xs"
            >
              <option value="auto">-- Otomatis Pilih dari Mata Pelajaran & Kelas --</option>
              {availableBanks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.question_count || 0} Butir Soal)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-sky-700">
              💡 Memilih Bank Soal akan otomatis menyelaraskan Mata Pelajaran, Jumlah Soal ({questionCount} soal), dan mengaitkan seluruh butir soal hasil import.
            </p>
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                1. Jenis Evaluasi
              </label>
              <select
                value={assessmentTypeId}
                onChange={(e) => setAssessmentTypeId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500"
              >
                {assessmentTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} — {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                2. Mata Pelajaran
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                3. Kelas Sasaran
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value={ALL_CLASSES_ID}>🌟 Semua Kelas (X TKR 1, X TKR 2, X TKR 1 03, X TKR 2 03)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.major})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Judul Ujian (Tampil pada Halaman Siswa)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: STS Gambar Teknik X TKR 2"
              className="w-full text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Timing & Scoring */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Durasi (Menit)
              </label>
              <input
                type="number"
                min="10"
                max="240"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Jumlah Soal
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                KKM Kelulusan
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={kkm}
                onChange={(e) => setKkm(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          {/* Random Question Engine Section */}
          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 space-y-3">
            <div className="flex items-center gap-2 text-brand-900">
              <Shuffle className="w-4 h-4 text-brand-600" />
              <h4 className="text-xs font-bold uppercase">Random Question Engine</h4>
            </div>
            <p className="text-xs text-brand-700 leading-relaxed">
              Sistem dapat mengacak dan menyeimbangkan komposisi tingkat kesulitan secara proporsional untuk tiap peserta:
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-brand-200 text-center">
                <span className="text-[11px] font-bold text-emerald-700">🟢 Mudah (C1-C2)</span>
                <input
                  type="number"
                  value={easyCount}
                  onChange={(e) => setEasyCount(Number(e.target.value))}
                  className="w-full text-center text-xs font-bold mt-1 p-1 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-brand-200 text-center">
                <span className="text-[11px] font-bold text-amber-700">🟡 Sedang (C3)</span>
                <input
                  type="number"
                  value={mediumCount}
                  onChange={(e) => setMediumCount(Number(e.target.value))}
                  className="w-full text-center text-xs font-bold mt-1 p-1 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-brand-200 text-center">
                <span className="text-[11px] font-bold text-rose-700">🔴 Sulit (HOTS)</span>
                <input
                  type="number"
                  value={hardCount}
                  onChange={(e) => setHardCount(Number(e.target.value))}
                  className="w-full text-center text-xs font-bold mt-1 p-1 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Security & Experience Checkbox Settings */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              Pengaturan Keamanan & Mode Ujian
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Acak Urutan Soal</p>
                  <p className="text-[10px] text-slate-500">Urutan soal berbeda untuk setiap siswa</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={randomizeOptions}
                  onChange={(e) => setRandomizeOptions(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Acak Opsi Pilihan</p>
                  <p className="text-[10px] text-slate-500">Opsi A, B, C, D diacak posisinya</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={fullscreenMode}
                  onChange={(e) => setFullscreenMode(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Wajib Fullscreen (Anti-Cheat)</p>
                  <p className="text-[10px] text-slate-500">Catat insiden jika keluar layar penuh</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={allowBackward}
                  onChange={(e) => setAllowBackward(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Izinkan Kembali ke Soal Sebelumnya</p>
                  <p className="text-[10px] text-slate-500">Siswa bebas melompat antar nomor soal</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={showResultsImmediately}
                  onChange={(e) => setShowResultsImmediately(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Tampilkan Nilai Langsung</p>
                  <p className="text-[10px] text-slate-500">Siswa langsung tahu skor setelah submit</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={showExplanation}
                  onChange={(e) => setShowExplanation(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Tampilkan Pembahasan Soal</p>
                  <p className="text-[10px] text-slate-500">Kunci dan pembahasan terbuka di akhir</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            PIN Ujian dan QR Code akan otomatis digenerate setelah ujian disimpan.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              disabled={isSaving || !title.trim()}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan & Terbitkan Ujian'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
