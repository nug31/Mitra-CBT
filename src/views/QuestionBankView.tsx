import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { 
  QuestionBank, 
  Question, 
  Subject, 
  SubjectMaterial, 
  DifficultyLevel, 
  QuestionType 
} from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  ZoomIn, 
  Sparkles, 
  BookOpenCheck,
  CheckCircle2,
  HelpCircle,
  BarChart2,
  FileText,
  Settings,
  Layers
} from 'lucide-react';
import { QuestionEditorModal } from '../components/bank/QuestionEditorModal';
import { ExcelImportModal } from '../components/bank/ExcelImportModal';
import { WordImportModal } from '../components/bank/WordImportModal';
import { EditBankModal } from '../components/bank/EditBankModal';
import { ImageModal } from '../components/common/ImageModal';

export const QuestionBankView: React.FC = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<SubjectMaterial[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [isWordOpen, setIsWordOpen] = useState(false);
  const [isEditBankOpen, setIsEditBankOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedBankId) {
      loadQuestions(selectedBankId);
    }
  }, [selectedBankId]);

  const loadInitialData = async () => {
    const [bks, subjs, mats] = await Promise.all([
      db.getQuestionBanks(),
      db.getSubjects(),
      db.getMaterials()
    ]);

    setBanks(bks);
    setSubjects(subjs);
    setMaterials(mats);

    if (bks.length > 0) {
      setSelectedBankId(bks[0].id);
    }
  };

  const loadQuestions = async (bankId: string) => {
    const qList = await db.getQuestions(bankId);
    setQuestions(qList);
  };

  const handleSaveBank = async (updatedBank: QuestionBank) => {
    await db.updateQuestionBank(updatedBank);
    const updatedBanks = await db.getQuestionBanks();
    setBanks(updatedBanks);
  };

  const handleSaveQuestion = async (data: any) => {
    await db.saveQuestion(data);
    await loadQuestions(selectedBankId);
    // Refresh bank count
    const updatedBanks = await db.getQuestionBanks();
    setBanks(updatedBanks);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus butir soal ini?')) {
      await db.deleteQuestion(id);
      await loadQuestions(selectedBankId);
      const updatedBanks = await db.getQuestionBanks();
      setBanks(updatedBanks);
    }
  };

  const handleImportExcelComplete = async (imported: Partial<Question>[]) => {
    for (const q of imported) {
      await db.saveQuestion(q as any);
    }
    await loadQuestions(selectedBankId);
    const updatedBanks = await db.getQuestionBanks();
    setBanks(updatedBanks);
  };

  const handleImportWordComplete = async (imported: Partial<Question>[]) => {
    for (const q of imported) {
      await db.saveQuestion(q as any);
    }
    await loadQuestions(selectedBankId);
    const updatedBanks = await db.getQuestionBanks();
    setBanks(updatedBanks);
  };

  const selectedBank = banks.find(b => b.id === selectedBankId);

  // Derive target grades from bank (target_grades array or title fallback)
  const getBankGrades = (bank: QuestionBank): string[] => {
    if (bank.target_grades && bank.target_grades.length > 0) {
      return bank.target_grades;
    }
    const t = (bank.title + ' ' + (bank.description || '')).toUpperCase();
    const inferred: string[] = [];
    if (t.includes(' XII') || t.includes('KELAS XII')) inferred.push('XII');
    if (t.includes(' XI') || t.includes('KELAS XI')) inferred.push('XI');
    if (t.includes(' X ') || t.includes('KELAS X') || t.includes('KELAS X\n')) inferred.push('X');
    return inferred.length > 0 ? inferred : ['Semua'];
  };

  const filteredBanks = gradeFilter === 'all'
    ? banks
    : banks.filter(b => {
        const grades = getBankGrades(b);
        return grades.includes(gradeFilter) || grades.includes('Semua');
      });

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.explanation && q.explanation.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchType = typeFilter === 'all' || q.question_type === typeFilter;
    return matchSearch && matchDiff && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bank Soal Digital Kejuruan
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pusat penyimpanan & kurasi butir soal terstandarisasi, diagram teknik otomotif, dan evaluasi berbasis HOTS
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsWordOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-semibold transition shadow-2xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Import Word (.docx)</span>
          </button>

          <button
            onClick={() => setIsExcelOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={() => {
              setEditingQuestion(null);
              setIsEditorOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal Baru</span>
          </button>
        </div>
      </div>

      {/* Grade Filter + Bank Selector */}
      <div className="space-y-3">
        {/* Grade level pills */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide shrink-0">Filter Kelas:</span>
          {(['all', 'X', 'XI', 'XII'] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setGradeFilter(grade)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border shrink-0 ${
                gradeFilter === grade
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {grade === 'all' ? 'Semua Kelas' : `Kelas ${grade}`}
            </button>
          ))}
        </div>

        {/* Bank Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filteredBanks.map((b) => {
            const grades = getBankGrades(b);
            const isSelected = selectedBankId === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBankId(b.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1">
                  {grades.map(g => (
                    <span
                      key={g}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                      }`}
                    >
                      Kelas {g}
                    </span>
                  ))}
                </div>
                <span>{b.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {b.question_count || 0} Soal
                </span>
              </button>
            );
          })}
          {filteredBanks.length === 0 && (
            <p className="text-xs text-slate-400 italic px-2">Tidak ada bank soal untuk kelas {gradeFilter}.</p>
          )}
        </div>

        {/* Selected Bank Details & Edit Target Class Banner */}
        {selectedBank && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900">{selectedBank.title}</span>
                {getBankGrades(selectedBank).map(g => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200"
                  >
                    Target Kelas {g}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                {selectedBank.description || 'Materi bank soal kejuruan otomotif & konversi energi.'}
              </p>
            </div>
            <button
              onClick={() => setIsEditBankOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 text-slate-700 text-xs font-bold transition shrink-0 self-start sm:self-auto"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Info & Target Kelas</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari narasi soal atau pembahasan..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Kesulitan</option>
            <option value="mudah">🟢 Mudah</option>
            <option value="sedang">🟡 Sedang</option>
            <option value="sulit">🔴 Sulit (HOTS)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Tipe Soal</option>
            <option value="pilihan_ganda">Pilihan Ganda</option>
            <option value="pg_kompleks">PG Kompleks</option>
            <option value="benar_salah">Benar / Salah</option>
            <option value="isian_singkat">Isian Singkat</option>
          </select>
        </div>
      </div>

      {/* Question List Cards */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <BookOpenCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum Ada Soal</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik "Tambah Soal Baru", "Import Word", atau "Import Excel" untuk menambahkan butir soal ke bank ini.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const material = materials.find(m => m.id === q.material_id);
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-brand-300 transition space-y-4"
              >
                {/* Header row */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                      {q.question_type.replace('_', ' ')}
                    </span>
                    {material && (
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {material.name}
                      </span>
                    )}
                    {q.target_grades && q.target_grades.length > 0 && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        <span>Kelas {q.target_grades.join(', ')}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        q.difficulty === 'mudah'
                          ? 'bg-emerald-100 text-emerald-700'
                          : q.difficulty === 'sedang'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      Bobot: {q.weight}
                    </span>

                    <button
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                      title="Edit Soal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {q.content}
                </p>

                {/* Diagram Preview Thumbnail if any */}
                {q.image_url && (
                  <div className="relative group inline-block">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl max-w-sm max-h-40 overflow-hidden">
                      <img
                        src={q.image_url}
                        alt="Diagram"
                        className="max-h-36 object-contain rounded-lg"
                      />
                    </div>
                    <button
                      onClick={() => setPreviewImage(q.image_url!)}
                      className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center text-white gap-1.5 text-xs font-semibold backdrop-blur-xs"
                    >
                      <ZoomIn className="w-4 h-4" />
                      <span>Perbesar Diagram</span>
                    </button>
                  </div>
                )}

                {/* Options list */}
                {q.question_type !== 'isian_singkat' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`flex items-start gap-2 p-2 rounded-xl text-xs font-medium border ${
                          opt.is_correct
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            opt.is_correct
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {opt.option_label}
                        </span>
                        <span className="flex-1">{opt.content}</span>
                        {opt.is_correct && (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">
                            (Kunci)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Isian Singkat Answer */}
                {q.question_type === 'isian_singkat' && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kunci Jawaban: {q.options[0]?.content || '-'}</span>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Pembahasan Guru: </span>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Editor Modal */}
      <QuestionEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
        bankId={selectedBankId}
        subjects={subjects}
        materials={materials}
      />

      {/* Excel Modal */}
      <ExcelImportModal
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        bankId={selectedBankId}
        onImportComplete={handleImportExcelComplete}
      />

      {/* Word Modal */}
      <WordImportModal
        isOpen={isWordOpen}
        onClose={() => setIsWordOpen(false)}
        bankId={selectedBankId}
        onImportComplete={handleImportWordComplete}
      />

      {/* Edit Bank Modal */}
      <EditBankModal
        isOpen={isEditBankOpen}
        onClose={() => setIsEditBankOpen(false)}
        bank={selectedBank || null}
        subjects={subjects}
        onSave={handleSaveBank}
      />

      {/* Image Zoom Modal */}
      <ImageModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ''}
      />
    </div>
  );
};
