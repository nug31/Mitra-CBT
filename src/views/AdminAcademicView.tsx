import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { ClassRoom, Subject, AssessmentType } from '../types';
import { 
  Layers, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Plus, 
  Check, 
  X,
  Trash2
} from 'lucide-react';

export const AdminAcademicView: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'subjects' | 'types'>('classes');

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('X');
  const [newClassMajor, setNewClassMajor] = useState('Teknik Kendaraan Ringan Otomotif');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // New Subject Form State
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjMajor, setNewSubjMajor] = useState('Teknik Otomotif');
  const [isSubjModalOpen, setIsSubjModalOpen] = useState(false);

  // New Assessment Type State
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cls, subjs, types] = await Promise.all([
      db.getClasses(),
      db.getSubjects(),
      db.getAssessmentTypes()
    ]);
    setClasses(cls);
    setSubjects(subjs);
    setAssessmentTypes(types);
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    await db.addClass({
      name: newClassName,
      grade: newClassGrade,
      major: newClassMajor,
      academic_year: '2024/2025'
    });
    setNewClassName('');
    setIsClassModalOpen(false);
    await loadData();
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim() || !newSubjCode.trim()) return;
    await db.addSubject({
      name: newSubjName,
      code: newSubjCode,
      major: newSubjMajor,
      description: 'Mata pelajaran kejuruan SMK'
    });
    setNewSubjName('');
    setNewSubjCode('');
    setIsSubjModalOpen(false);
    await loadData();
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim() || !newTypeCode.trim()) return;
    await db.addAssessmentType({
      name: newTypeName,
      code: newTypeCode.toUpperCase(),
      description: newTypeDesc || 'Kategori evaluasi asesmen sekolah',
      is_default: false
    });
    setNewTypeName('');
    setNewTypeCode('');
    setNewTypeDesc('');
    setIsTypeModalOpen(false);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Data Akademik SMK
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi data master: Rombongan Belajar / Kelas, Mata Pelajaran, dan Kategori Jenis Evaluasi
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'classes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Kelas ({classes.length})
          </button>
          <button
            onClick={() => setActiveSubTab('subjects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'subjects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Mata Pelajaran ({subjects.length})
          </button>
          <button
            onClick={() => setActiveSubTab('types')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'types' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Jenis Evaluasi ({assessmentTypes.length})
          </button>
        </div>
      </div>

      {/* 1. Classes Tab */}
      {activeSubTab === 'classes' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              <span>Daftar Rombongan Belajar (Kelas)</span>
            </h3>
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-300 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 font-extrabold text-xs flex items-center justify-center">
                    {cls.grade}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {cls.academic_year}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {cls.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {cls.major}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Subjects Tab */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              <span>Daftar Mata Pelajaran & Kejuruan</span>
            </h3>
            <button
              onClick={() => setIsSubjModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mata Pelajaran</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-300 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200 font-mono">
                    {s.code}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{s.major}</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{s.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Assessment Types Tab */}
      {activeSubTab === 'types' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Kategori Jenis Evaluasi Pembelajaran</span>
            </h3>
            <button
              onClick={() => setIsTypeModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jenis Evaluasi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assessmentTypes.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-300 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-brand-600 text-white font-mono">
                    {t.code}
                  </span>
                  {t.is_default && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Default</span>
                  )}
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{t.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Tambah Kelas */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <form onSubmit={handleAddClass} className="max-w-md w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Tambah Rombel / Kelas Baru</h3>
              <button type="button" onClick={() => setIsClassModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Kelas</label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Contoh: X TKR 3"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tingkat</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jurusan</label>
                <input
                  type="text"
                  value={newClassMajor}
                  onChange={(e) => setNewClassMajor(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClassModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs"
              >
                Simpan Kelas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Tambah Mapel */}
      {isSubjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <form onSubmit={handleAddSubject} className="max-w-md w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Tambah Mata Pelajaran Baru</h3>
              <button type="button" onClick={() => setIsSubjModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Mata Pelajaran</label>
              <input
                type="text"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                placeholder="Contoh: Kelistrikan Otomotif"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kode Mapel</label>
                <input
                  type="text"
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value.toUpperCase())}
                  placeholder="KLS-TKR"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bidang Keahlian</label>
                <input
                  type="text"
                  value={newSubjMajor}
                  onChange={(e) => setNewSubjMajor(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubjModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs"
              >
                Simpan Mapel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Tambah Jenis Evaluasi */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <form onSubmit={handleAddType} className="max-w-md w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Tambah Kategori Jenis Evaluasi</h3>
              <button type="button" onClick={() => setIsTypeModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kode Singkat</label>
                <input
                  type="text"
                  value={newTypeCode}
                  onChange={(e) => setNewTypeCode(e.target.value.toUpperCase())}
                  placeholder="USK"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Evaluasi</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Uji Sertifikasi Kejuruan"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi / Catatan</label>
              <textarea
                rows={2}
                value={newTypeDesc}
                onChange={(e) => setNewTypeDesc(e.target.value)}
                placeholder="Penilaian uji kompetensi keahlian bengkel..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTypeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs"
              >
                Simpan Jenis Evaluasi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
