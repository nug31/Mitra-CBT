import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Student, Teacher } from '../types';
import { Users, GraduationCap, BookOpen, Search, UserCheck } from 'lucide-react';

export const AdminUsersView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [st, tc] = await Promise.all([
      db.getStudents(),
      db.getTeachers()
    ]);
    setStudents(st);
    setTeachers(tc);
  };

  const filteredStudents = students.filter(s =>
    (s.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    s.nis.includes(search)
  );

  const filteredTeachers = teachers.filter(t =>
    (t.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.nip || '').includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Pengguna (Guru & Siswa)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data terpadu dewan guru pengampu dan peserta didik SMK untuk otorisasi akses CBT
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              Guru Pengampu ({teachers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {activeTab === 'students' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Nama Lengkap Siswa</th>
                  <th className="p-3.5 font-bold">NIS</th>
                  <th className="p-3.5 font-bold">NISN</th>
                  <th className="p-3.5 font-bold">Kelas</th>
                  <th className="p-3.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {s.profile?.full_name.charAt(0) || 'S'}
                      </div>
                      <span>{s.profile?.full_name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{s.nis}</td>
                    <td className="p-3.5 font-mono text-slate-400">{s.nisn || '-'}</td>
                    <td className="p-3.5 font-bold text-brand-600">{s.class?.name || 'X TKR 2'}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Nama Lengkap Guru</th>
                  <th className="p-3.5 font-bold">NIP</th>
                  <th className="p-3.5 font-bold">Spesialisasi Bidang Kejuruan</th>
                  <th className="p-3.5 font-bold">Email Akun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                        {t.profile?.full_name.charAt(0) || 'G'}
                      </div>
                      <span>{t.profile?.full_name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{t.nip || '-'}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{t.subject_specialty || 'Kejuruan Otomotif'}</td>
                    <td className="p-3.5 font-mono text-slate-500">{t.profile?.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
