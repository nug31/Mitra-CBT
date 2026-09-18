import React, { useState, useEffect } from 'react';
import { QuestionBank, Subject } from '../../types';
import { X, BookOpen, Layers, Check, Sparkles } from 'lucide-react';

interface EditBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: QuestionBank | null;
  subjects: Subject[];
  onSave: (bankData: any) => Promise<void>;
}

export const EditBankModal: React.FC<EditBankModalProps> = ({
  isOpen,
  onClose,
  bank,
  subjects,
  onSave
}) => {
  const isCreate = !bank;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [targetGrades, setTargetGrades] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (bank) {
        setTitle(bank.title || '');
        setDescription(bank.description || '');
        setSubjectId(bank.subject_id || (subjects[0]?.id ?? ''));
        setTargetGrades(bank.target_grades && bank.target_grades.length > 0 ? [...bank.target_grades] : ['X']);
      } else {
        setTitle('');
        setDescription('');
        setSubjectId(subjects[0]?.id ?? 'subj-01');
        setTargetGrades(['X']);
      }
      setError(null);
    }
  }, [bank, isOpen, subjects]);

  if (!isOpen) return null;

  const toggleGrade = (grade: string) => {
    setTargetGrades(prev => {
      if (prev.includes(grade)) {
        if (prev.length === 1) {
          setError('Minimal harus memilih 1 tingkat kelas.');
          return prev;
        }
        setError(null);
        return prev.filter(g => g !== grade);
      } else {
        setError(null);
        return [...prev, grade].sort();
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul bank soal tidak boleh kosong.');
      return;
    }
    if (targetGrades.length === 0) {
      setError('Pilih minimal 1 tingkat kelas untuk bank soal ini.');
      return;
    }

    setIsSaving(true);
    try {
      if (bank?.id) {
        await onSave({
          ...bank,
          title: title.trim(),
          description: description.trim(),
          subject_id: subjectId,
          target_grades: targetGrades
        });
      } else {
        await onSave({
          title: title.trim(),
          description: description.trim(),
          subject_id: subjectId,
          target_grades: targetGrades,
          teacher_id: 'teacher-01',
          question_count: 0
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan bank soal.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isCreate ? 'Buat Bank Soal Baru' : 'Pengaturan & Target Kelas Bank Soal'}
              </h2>
              <p className="text-xs text-slate-500">
                {isCreate 
                  ? 'Buat wadah baru untuk butir soal evaluasi kejuruan atau umum' 
                  : 'Atur judul, deskripsi, dan peruntukan tingkat kelas soal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Bank Soal <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Bank Soal Motor Bakar & Dasar Konversi Energi Engine"
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/30"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Materi / Keterangan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan ringkasan materi, standar kompetensi, atau tujuan pembelajaran..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/30 resize-none"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mata Pelajaran Kejuruan
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Grade Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>Target Tingkat Kelas (Bisa Pilih Lebih dari 1)</span>
              </label>
              <span className="text-[11px] font-bold text-brand-600">
                {targetGrades.length} Tingkat Terpilih
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pilih kelas berapa saja yang dapat menggunakan bank soal ini. Misalnya materi <strong>Konversi Engine</strong> dapat digunakan untuk <strong>Kelas X dan Kelas XII</strong> sekaligus.
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {(['X', 'XI', 'XII'] as const).map((grade) => {
                const isSelected = targetGrades.includes(grade);
                return (
                  <button
                    type="button"
                    key={grade}
                    onClick={() => toggleGrade(grade)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-600/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-white/20 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>Kelas {grade}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                Saat ini aktif untuk:{' '}
                <strong>
                  {targetGrades.map(g => `Kelas ${g}`).join(' dan ')}
                </strong>
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSaving ? 'Menyimpan...' : (isCreate ? 'Buat Bank Soal Baru' : 'Simpan Perubahan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
