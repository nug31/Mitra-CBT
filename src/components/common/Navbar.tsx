import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  Wifi, 
  LogOut,
  Layers
} from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export const Navbar: React.FC = () => {
  const { currentUser, currentStudent, role, logout } = useAuth();

  const roleLabels: Record<Role, { title: string; badgeClass: string; icon: any }> = {
    admin: {
      title: 'Administrator',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      icon: ShieldCheck
    },
    guru: {
      title: 'Guru Pengampu',
      badgeClass: 'bg-brand-100 text-brand-700 border-brand-200',
      icon: BookOpen
    },
    siswa: {
      title: 'Siswa / Peserta',
      badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: GraduationCap
    }
  };

  const currentRoleInfo = roleLabels[role] || roleLabels.guru;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">MITRA CBT</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 uppercase tracking-wide">
                SMK VOKASI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              Digital Assessment System
            </p>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-3">
          {/* Cloud / Local indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isSupabaseConfigured ? 'Supabase Realtime' : 'Local Store Engine'}</span>
          </div>

          {/* Active Role Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold shadow-2xs ${currentRoleInfo.badgeClass}`}
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentRoleInfo.title}</span>
              <span className="sm:hidden capitalize">{role}</span>
            </span>
          </div>

          {/* User Profile Mini Card */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={
                currentUser?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'User')}&background=0284c7&color=fff`
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                {currentUser?.full_name || 'Pengguna'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {role === 'siswa' && currentStudent?.nisn 
                  ? `NISN: ${currentStudent.nisn}` 
                  : currentUser?.email}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              title="Keluar / Ganti Akun"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
