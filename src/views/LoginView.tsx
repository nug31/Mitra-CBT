import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import type { ClassRoom } from '../types';
import { 
  Layers, 
  GraduationCap, 
  BookOpen, 
  Lock, 
  UserCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight,
  Info,
  ShieldCheck,
  QrCode,
  School
} from 'lucide-react';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { loginWithNisn, loginWithCredentials } = useAuth();
  
  // URL parameters if opened from QR scan
  const urlParams = new URLSearchParams(window.location.search);
  const examIdParam = urlParams.get('exam');
  const pinParam = urlParams.get('pin');

  // Tab: 'siswa' or 'guru_admin'
  const [activeTab, setActiveTab] = useState<'siswa' | 'guru_admin'>('siswa');

  // Siswa Form
  const [nisn, setNisn] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classes, setClasses] = useState<ClassRoom[]>([]);

  // Guru/Admin Form
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPw, setShowTeacherPw] = useState(false);

  // States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

// 4 Classes required for upcoming CBT exam
const ALLOWED_EXAM_CLASSES: ClassRoom[] = [
  { id: 'cls-tkr-1', name: 'X TKR 1', grade: 'X', major: 'TKR', academic_year: '2024/2025' },
  { id: 'cls-tkr-2', name: 'X TKR 2', grade: 'X', major: 'TKR', academic_year: '2024/2025' },
  { id: 'cls-tkr-1-03', name: 'X TKR 1 03', grade: 'X', major: 'TKR', academic_year: '2024/2025' },
  { id: 'cls-tkr-2-03', name: 'X TKR 2 03', grade: 'X', major: 'TKR', academic_year: '2024/2025' },
];

  // Load available classes (restricted to the 4 exam classes)
  useEffect(() => {
    if (examIdParam) sessionStorage.setItem('qr_exam_id', examIdParam);
    if (pinParam) sessionStorage.setItem('qr_exam_pin', pinParam);

    db.getClasses().then(cls => {
      const targetNames = ['X TKR 1', 'X TKR 2', 'X TKR 1 03', 'X TKR 2 03'];
      const filtered = cls.filter(c => targetNames.includes(c.name));
      const finalClasses = filtered.length > 0 ? filtered : ALLOWED_EXAM_CLASSES;
      setClasses(finalClasses);
      if (finalClasses.length > 0) setSelectedClassId(finalClasses[0].id);
    });
  }, [examIdParam, pinParam]);

  // Submit Siswa — password is always equal to NISN (default convention)
  const handleSubmitSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await loginWithNisn(nisn, nisn, namaLengkap.trim(), selectedClassId);
    setLoading(false);

    if (res.success) {
      // Preserve QR exam params across the login redirect via sessionStorage
      if (examIdParam) {
        sessionStorage.setItem('qr_exam_id', examIdParam);
        if (pinParam) sessionStorage.setItem('qr_exam_pin', pinParam);
      }
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.error || 'Login gagal.');
    }
  };

  // Submit Guru/Admin
  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await loginWithCredentials(teacherEmail, teacherPassword);
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.error || 'Login gagal.');
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 flex flex-col justify-center items-center py-6 px-3.5 sm:p-6 text-slate-100 font-sans overflow-y-auto">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg z-10 my-auto">
        {/* Brand Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center justify-center w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-xl shadow-brand-500/30 mb-2.5 sm:mb-3">
            <Layers className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            MITRA EXAM
          </h1>

        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4.5 sm:p-8 shadow-2xl border border-white/20 text-slate-800">
          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-5 sm:mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('siswa');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'siswa'
                  ? 'bg-white text-emerald-700 shadow-md shadow-emerald-500/10'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Login Siswa (NISN)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('guru_admin');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'guru_admin'
                  ? 'bg-white text-brand-700 shadow-md shadow-brand-500/10'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="truncate">Staf / Guru / Pengawas</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {/* QR Code Detected Alert */}
          {examIdParam && (
            <div className="mb-5 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-start gap-2.5 animate-in fade-in">
              <QrCode className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Ujian Terdeteksi dari Pemindaian QR Code</p>
                <p className="text-[11px] text-sky-700 mt-0.5 leading-relaxed">
                  {pinParam ? `Kode PIN (${pinParam}) otomatis terisi. ` : ''}
                  Silakan masukkan <b>NISN</b> Anda untuk langsung masuk ke ruang asesmen.
                </p>
              </div>
            </div>
          )}

          {/* ── TAB 1: SISWA LOGIN ── */}
          {activeTab === 'siswa' && (
            <form onSubmit={handleSubmitSiswa} className="space-y-4">
              {/* NISN Info Card */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold">Akses Ujian Siswa:</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Isi <strong>Nama Lengkap</strong> dan <strong>NISN</strong>, lalu klik <strong>Masuk</strong>.
                    {examIdParam && ' Ujian dari QR Code akan terbuka otomatis.'}
                  </p>
                </div>
              </div>

              {/* Nama Lengkap Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-nama"
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda..."
                    className="w-full pl-10 pr-4 py-3 sm:py-3 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    autoFocus
                  />
                </div>
              </div>

              {/* NISN Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  NISN Siswa <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-nisn"
                    type="text"
                    inputMode="numeric"
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value.trim())}
                    placeholder="Masukkan NISN Anda..."
                    className="w-full pl-10 pr-4 py-3 sm:py-3 rounded-xl border border-slate-300 text-base sm:text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Kelas Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kelas <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="input-kelas"
                    required
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-3 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white appearance-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-login-siswa"
                type="submit"
                disabled={loading || nisn.length < 5 || namaLengkap.trim().length < 3 || !selectedClassId}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Ruang Ujian</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── TAB 2: GURU, ADMIN, & PENGAWAS LOGIN ── */}
          {activeTab === 'guru_admin' && (
            <form onSubmit={handleSubmitTeacher} className="space-y-4">
              {/* Info card */}
              <div className="p-3 rounded-2xl bg-brand-50 border border-brand-200/80 text-brand-900 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-brand-700 leading-relaxed">
                  Masuk menggunakan <strong>Email</strong> atau <strong>NIP</strong> yang terdaftar di sistem.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email atau NIP
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-teacher-email"
                    type="text"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="Email atau NIP..."
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-teacher-password"
                    type={showTeacherPw ? 'text' : 'password'}
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Masukkan password..."
                    className="w-full pl-10 pr-10 py-3 sm:py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPw(!showTeacherPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showTeacherPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login-guru"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 min-h-[48px]"
              >
                {loading ? <span>Memverifikasi...</span> : <span>Masuk Portal Pendidik</span>}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-4 sm:mt-5">
          &copy; {new Date().getFullYear()} Mitra Exam — SMK Digital Assessment Architecture
        </p>
      </div>
    </div>
  );
};
