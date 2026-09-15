import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  CalendarClock, 
  Activity, 
  BarChart3, 
  RefreshCw, 
  FileSpreadsheet,
  Users,
  GraduationCap,
  Layers,
  History,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  const guruMenus: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'bank_soal', label: 'Bank Soal Kejuruan', icon: BookOpenCheck },
    { id: 'ujian', label: 'Jadwal & Buat Ujian', icon: CalendarClock },
    { id: 'monitoring', label: 'Live Monitoring CBT', icon: Activity, badge: 'Realtime' },
    { id: 'analisis', label: 'Analisis Butir Soal', icon: BarChart3 },
    { id: 'remedial', label: 'Program Remedial', icon: RefreshCw },
    { id: 'laporan', label: 'Rekap Nilai & Cetak', icon: FileSpreadsheet }
  ];

  const adminMenus: MenuItem[] = [
    { id: 'dashboard', label: 'Statistik Sistem', icon: LayoutDashboard },
    { id: 'pengguna', label: 'Guru & Peserta Didik', icon: Users },
    { id: 'akademik', label: 'Kelas & Mata Pelajaran', icon: Layers },
    { id: 'evaluasi', label: 'Kategori Jenis Evaluasi', icon: Sparkles },
    { id: 'audit', label: 'Audit Log & Keamanan', icon: ShieldCheck }
  ];

  const siswaMenus: MenuItem[] = [
    { id: 'dashboard', label: 'Ruang Ujian Tersedia', icon: CalendarClock, badge: 'Aktif' },
    { id: 'riwayat', label: 'Hasil & Riwayat Asesmen', icon: History }
  ];

  const menus = role === 'guru' ? guruMenus : role === 'admin' ? adminMenus : siswaMenus;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Menu {role === 'guru' ? 'Guru Pengampu' : role === 'admin' ? 'Administrator' : 'Siswa'}
          </p>
          <nav className="space-y-1">
            {menus.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Vocational Tips / Info Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-[11px] text-sky-200">Sistem Asesmen SMK</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Mendukung standarisasi ISO gambar teknik & diagram mesin konversi energi.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        <span>MITRA CBT v2.4 • 2024/2025</span>
      </div>
    </aside>
  );
};
