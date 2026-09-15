import React, { useState } from 'react';
import { Question, QuestionOption, QuestionType, DifficultyLevel, Subject, SubjectMaterial } from '../../types';
import { 
  X, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { DIAGRAM_PROYEKSI_EROPA, DIAGRAM_SIKLUS_ENGINE, DIAGRAM_ETIKET } from '../../services/mockData';

interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: any) => Promise<void>;
  initialQuestion?: Question | null;
  bankId: string;
  subjects: Subject[];
  materials: SubjectMaterial[];
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
  bankId,
  subjects,
  materials
}) => {
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialQuestion?.question_type || 'pilihan_ganda'
  );
  const [materialId, setMaterialId] = useState(
    initialQuestion?.material_id || (materials[0]?.id ?? '')
  );
  const [content, setContent] = useState(initialQuestion?.content || '');
  const [imageUrl, setImageUrl] = useState(initialQuestion?.image_url || '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    initialQuestion?.difficulty || 'sedang'
  );
  const [weight, setWeight] = useState(initialQuestion?.weight || 2.0);
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');
  const [competency, setCompetency] = useState(initialQuestion?.competency || '');

  // Options state
  const [options, setOptions] = useState<QuestionOption[]>(
    initialQuestion?.options || [
      { id: 'opt-a', option_label: 'A', content: '', is_correct: true },
      { id: 'opt-b', option_label: 'B', content: '', is_correct: false },
      { id: 'opt-c', option_label: 'C', content: '', is_correct: false },
      { id: 'opt-d', option_label: 'D', content: '', is_correct: false }
    ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOptionContentChange = (index: number, val: string) => {
    const next = [...options];
    next[index].content = val;
    setOptions(next);
  };

  const handleToggleCorrect = (index: number) => {
    if (questionType === 'pg_kompleks') {
      const next = [...options];
      next[index].is_correct = !next[index].is_correct;
      setOptions(next);
    } else {
      // Single correct answer
      const next = options.map((opt, idx) => ({
        ...opt,
        is_correct: idx === index
      }));
      setOptions(next);
    }
  };

  const addOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLetter = letters[options.length] || 'X';
    setOptions([
      ...options,
      { id: 'opt-' + Date.now(), option_label: nextLetter, content: '', is_correct: false }
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleSelectPredefinedDiagram = (svgData: string) => {
    setImageUrl(svgData);
  };

  const handleSave = async () => {
    setError(null);
    if (!content.trim()) {
      setError('Pertanyaan tidak boleh kosong');
      return;
    }

    if (questionType !== 'isian_singkat') {
      const hasEmptyOpt = options.some(o => !o.content.trim());
      if (hasEmptyOpt) {
        setError('Semua opsi jawaban harus diisi');
        return;
      }

      const hasCorrect = options.some(o => o.is_correct);
      if (!hasCorrect) {
        setError('Tentukan minimal satu kunci jawaban yang benar');
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave({
        id: initialQuestion?.id,
        bank_id: bankId,
        material_id: materialId,
        question_type: questionType,
        content,
        image_url: imageUrl,
        difficulty,
        weight: Number(weight),
        explanation,
        competency,
        options
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan soal');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {initialQuestion ? 'Edit Butir Soal Kejuruan' : 'Tambah Butir Soal Kejuruan'}
            </h3>
            <p className="text-xs text-slate-500">
              Formulir terstandarisasi untuk bank soal digital SMK Mitra CBT
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Meta selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Jenis Soal
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="pilihan_ganda">Pilihan Ganda (Single Choice)</option>
                <option value="pg_kompleks">Pilihan Ganda Kompleks (Multi)</option>
                <option value="benar_salah">Benar / Salah</option>
                <option value="isian_singkat">Isian Singkat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Materi Pokok / KD
              </label>
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tingkat Kesulitan
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="mudah">🟢 Mudah (C1 - C2)</option>
                <option value="sedang">🟡 Sedang (C3)</option>
                <option value="sulit">🔴 Sulit / HOTS (C4 - C6)</option>
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Isi Pertanyaan / Narasi Soal
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan pertanyaan soal secara jelas..."
              className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Image & Technical Diagram Support */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">
                  Lampiran Gambar Diagram Teknik (Penting untuk SMK)
                </span>
              </div>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Hapus Gambar
                </button>
              )}
            </div>

            {/* Diagram Presets for SMK */}
            <div>
              <p className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Pilih Diagram Teknik SMK Cepat:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPredefinedDiagram(DIAGRAM_PROYEKSI_EROPA)}
                  className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium transition"
                >
                  📐 Proyeksi Eropa (ISO)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPredefinedDiagram(DIAGRAM_SIKLUS_ENGINE)}
                  className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium transition"
                >
                  ⚙️ Diagram Siklus 4-Tak
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPredefinedDiagram(DIAGRAM_ETIKET)}
                  className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium transition"
                >
                  📋 Etiket Gambar Kerja ISO
                </button>
              </div>
            </div>

            {/* Custom URL or upload */}
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl.startsWith('data:') ? '[Diagram Vektor Terpasang]' : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Atau tempel URL gambar / diagram..."
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            {/* Preview Box */}
            {imageUrl && (
              <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-center max-h-48 overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-44 object-contain rounded"
                />
              </div>
            )}
          </div>

          {/* Options Section */}
          {questionType !== 'isian_singkat' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Opsi Jawaban & Kunci
                </label>
                <span className="text-[11px] text-slate-500">
                  {questionType === 'pg_kompleks'
                    ? 'Pilih satu atau lebih opsi sebagai kunci'
                    : 'Klik tombol bulat untuk memilih kunci jawaban benar'}
                </span>
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                      opt.is_correct
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleCorrect(idx)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                        opt.is_correct
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.option_label}
                    </button>

                    <input
                      type="text"
                      value={opt.content}
                      onChange={(e) => handleOptionContentChange(idx, e.target.value)}
                      placeholder={`Teks opsi ${opt.option_label}...`}
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 5 && questionType === 'pilihan_ganda' && (
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-semibold hover:text-brand-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Opsi ({String.fromCharCode(65 + options.length)})
                </button>
              )}
            </div>
          )}

          {/* Isian Singkat Answer */}
          {questionType === 'isian_singkat' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Kunci Jawaban Teks (Pencocokan Otomatis)
              </label>
              <input
                type="text"
                value={options[0]?.content || ''}
                onChange={(e) =>
                  setOptions([
                    {
                      id: 'opt-isian',
                      option_label: 'A',
                      content: e.target.value,
                      is_correct: true
                    }
                  ])
                }
                placeholder="Contoh: TMA (Sistem tidak peka huruf besar/kecil)"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          )}

          {/* Bobot & Pembahasan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Bobot Poin Soal
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Target Capaian Kompetensi
              </label>
              <input
                type="text"
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
                placeholder="Contoh: Menjelaskan siklus 4-langkah engine"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pembahasan / Solusi Jawaban
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Tuliskan pembahasan atau dasar teori jawaban..."
              className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/25 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Butir Soal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
