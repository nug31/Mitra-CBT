import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { TeacherDashboardView } from './views/TeacherDashboardView';
import { QuestionBankView } from './views/QuestionBankView';
import { ExamManagementView } from './views/ExamManagementView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { AnalyticsView } from './views/AnalyticsView';
import { StudentPortalView } from './views/StudentPortalView';
import { AdminAcademicView } from './views/AdminAcademicView';
import { AdminUsersView } from './views/AdminUsersView';
import { AuditLogView } from './views/AuditLogView';
import { LoginView } from './views/LoginView';

const MainLayout: React.FC = () => {
  const { role, currentUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>(undefined);

  const handleNavigate = (tab: string, extraId?: string) => {
    setActiveTab(tab);
    if (extraId) setSelectedExamId(extraId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Memuat Sistem Mitra CBT...</p>
        </div>
      </div>
    );
  }

  // If user logged out or unauthenticated, show LoginView
  if (!currentUser) {
    return <LoginView />;
  }

  // Student Experience
  if (role === 'siswa') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <StudentPortalView />
        </div>
      </div>
    );
  }

  // Teacher & Admin Experience
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto items-stretch">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {/* Guru Menus */}
          {role === 'guru' && (
            <>
              {activeTab === 'dashboard' && <TeacherDashboardView onNavigate={handleNavigate} />}
              {activeTab === 'bank_soal' && <QuestionBankView />}
              {activeTab === 'ujian' && (
                <ExamManagementView
                  onNavigateToMonitoring={(id) => handleNavigate('monitoring', id)}
                  onNavigateToAnalytics={(id) => handleNavigate('analisis', id)}
                />
              )}
              {activeTab === 'monitoring' && <LiveMonitoringView initialExamId={selectedExamId} />}
              {activeTab === 'siswa' && <AdminUsersView />}
              {activeTab === 'kelas' && <AdminAcademicView />}
              {(activeTab === 'analisis' || activeTab === 'remedial' || activeTab === 'laporan') && (
                <AnalyticsView initialExamId={selectedExamId} />
              )}
            </>
          )}

          {/* Admin Menus */}
          {role === 'admin' && (
            <>
              {activeTab === 'dashboard' && <TeacherDashboardView onNavigate={handleNavigate} />}
              {activeTab === 'pengguna' && <AdminUsersView />}
              {activeTab === 'akademik' && <AdminAcademicView />}
              {activeTab === 'evaluasi' && <AdminAcademicView />}
              {activeTab === 'audit' && <AuditLogView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
