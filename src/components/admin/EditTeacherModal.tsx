import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, UserCog, Mail, Hash, BookOpen, Phone } from 'lucide-react';
import { Teacher } from '../../types';
import { db } from '../../services/db';

interface EditTeacherModalProps {
  teacher: Teacher;
  onSuccess: () => void;
  onClose: () => void;
}

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({ teacher, onSuccess, onClose }) => {
  const [fullName, setFullName]         = useState(teacher.profile?.full_name || '');
  const [email, setEmail]               = useState(teacher.profile?.email || '');
  const [nip, setNip]                   = useState(teacher.nip || '');
  const [specialty, setSpecialty]       = useState(teacher.subject_specialty || '');
  const [phone, setPhone]               = useState(teacher.profile?.phone || '');
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError('Nama lengkap wajib diisi.'); return; }
    if (!email.trim())    { setError('Email wajib diisi.'); return; }

    setSaving(true);
    try {
      await db.updateTeacher(teacher.id, {
        full_name:        fullName.trim(),
        email:            email.trim().toLowerCase(),
        nip:              nip.trim(),
        subject_specialty: specialty.trim(),
        phone:            phone.trim(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Edit Data Guru</h2>
              <p className="text-xs text-slate-500">Perbarui profil dan informasi pengajar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Lengkap & Gelar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                id="teacher-name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Contoh: Budi Santoso, S.Pd."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Akun <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                id="teacher-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@mitracbt.id"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
              />
            </div>
          </div>

          {/* NIP */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">NIP</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                id="teacher-nip"
                value={nip}
                onChange={e => setNip(e.target.value)}
                placeholder="Nomor Induk Pegawai"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 font-mono"
              />
            </div>
          </div>

          {/* Spesialisasi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Spesialisasi Bidang</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                id="teacher-specialty"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                placeholder="Contoh: Teknik Kendaraan Ringan"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
              />
            </div>
          </div>

          {/* No HP */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">No. HP / WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                id="teacher-phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <span>{error}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-save-teacher"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-black rounded-xl transition shadow-md shadow-brand-200"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
