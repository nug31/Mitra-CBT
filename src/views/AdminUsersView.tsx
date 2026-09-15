import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Student, Teacher, ClassRoom } from '../types';
import { Users, GraduationCap, BookOpen, Search, Upload, Trash2, UserCheck } from 'lucide-react';
import { ImportStudentsModal } from '../components/admin/ImportStudentsModal';

export const AdminUsersView: React.FC = () => {
  const [students, setStudents]     = useState<Student[]>([]);
  const [teachers, setTeachers]     = useState<Teacher[]>([]);
  const [classes, setClasses]       = useState<ClassRoom[]>([]);
  const [activeTab, setActiveTab]   = useState<'students' | 'teachers'>('students');
  const [search, setSearch]         = useState('');
  const [showImport, setShowImport] = useState(false);
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [st, tc, cls] = await Promise.all([
      db.getStudents(),
      db.getTeachers(),
      db.getClasses(),
    ]);
    setStudents(st);
    setTeachers(tc);
    setClasses(cls);
  };

  const handleImportSuccess = (count: number) => {
    loadData();
    // Modal tetap terbuka di step "done" — user tutup sendiri
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!confirm(`Hapus siswa "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    // Hapus dari localStorage langsung
    const current = await db.getStudents();
    const updated = current.filter(s => s.id !== studentId);
    localStorage.setItem('mitracbt_students', JSON.stringify(updated));
    loadData();
  };

  const filteredStudents = students.filter(s => {
    const matchSearch =
      (s.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.nisn || '').includes(search) ||
      s.nis.includes(search);
    const matchClass = !filterClass || s.class_id === filterClass;
    return matchSearch && matchClass;
  });

  const filteredTeachers = teachers.filter(t =>
    (t.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.nip || '').includes(search)
  );

  // Group classes by major for filter dropdown
  const majors = [...new Set(classes.map(c => c.major))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Pengguna
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dewan guru dan peserta didik SMK — otorisasi akses Mitra CBT
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'students' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Peserta Didik ({students.length})
              </button>
              <button
                onClick={() => setActiveTab('teachers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'teachers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Guru ({teachers.length})
              </button>
            </div>

            {/* Import button — only on students tab */}
            {activeTab === 'students' && (
              <button
                id="btn-import-siswa"
                onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-200"
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={activeTab === 'students' ? 'Cari nama / NISN / NIS...' : 'Cari nama / NIP...'}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
            />
          </div>
          {activeTab === 'students' && (
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white text-slate-700"
            >
              <option value="">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {activeTab === 'students' ? (
          filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-slate-700">Belum Ada Data Siswa</p>
                <p className="text-xs text-slate-400 mt-1">
                  {students.length === 0
                    ? 'Klik tombol "Import Excel" di atas untuk mengimport data siswa dari file Excel.'
                    : 'Tidak ada siswa yang cocok dengan filter yang dipilih.'}
                </p>
              </div>
              {students.length === 0 && (
                <button
                  onClick={() => setShowImport(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-200"
                >
                  <Upload className="w-4 h-4" />
                  Import Siswa Sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 font-bold">Nama Lengkap Siswa</th>
                    <th className="p-3.5 font-bold">NISN</th>
                    <th className="p-3.5 font-bold">NIS</th>
                    <th className="p-3.5 font-bold">Kelas</th>
                    <th className="p-3.5 font-bold text-center">Status</th>
                    <th className="p-3.5 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                            {(s.profile?.full_name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span>{s.profile?.full_name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 font-semibold">{s.nisn || '-'}</td>
                      <td className="p-3.5 font-mono text-slate-500">{s.nis}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-black rounded-full border border-brand-100">
                          {s.class?.name || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          s.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'graduated' ? 'bg-sky-100 text-sky-800' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {s.status === 'active' ? 'Aktif' : s.status === 'graduated' ? 'Lulus' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDeleteStudent(s.id, s.profile?.full_name || '')}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>Menampilkan {filteredStudents.length} dari {students.length} siswa</span>
                <span>Login siswa: gunakan <span className="font-mono font-bold text-slate-600">NISN</span> sebagai username & password</span>
              </div>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Nama Lengkap Guru</th>
                  <th className="p-3.5 font-bold">NIP</th>
                  <th className="p-3.5 font-bold">Spesialisasi Bidang</th>
                  <th className="p-3.5 font-bold">Email Akun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                          {(t.profile?.full_name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <span>{t.profile?.full_name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{t.nip || '-'}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{t.subject_specialty || '-'}</td>
                    <td className="p-3.5 font-mono text-slate-500">{t.profile?.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImport && (
        <ImportStudentsModal
          classes={classes}
          onSuccess={handleImportSuccess}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
};
