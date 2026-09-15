import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Role, Student, Teacher } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: Profile | null;
  currentStudent: Student | null;
  currentTeacher: Teacher | null;
  role: Role;
  isLoading: boolean;
  login: (email: string, role?: Role) => Promise<boolean>;
  loginWithNisn: (nisn: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithCredentials: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [role, setRole] = useState<Role>('guru');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const savedRoleId = localStorage.getItem('mitracbt_active_role') as Role | null;
      const savedStudentId = localStorage.getItem('mitracbt_student_id');

      if (savedRoleId === 'siswa' && savedStudentId) {
        const students = await db.getStudents();
        const foundStudent = students.find(s => s.id === savedStudentId);
        if (foundStudent) {
          const profiles = await db.getProfiles();
          const profile = profiles.find(p => p.id === foundStudent.profile_id) || foundStudent.profile;
          if (profile) {
            setCurrentUser(profile);
            setCurrentStudent(foundStudent);
            setCurrentTeacher(null);
            setRole('siswa');
            return;
          }
        }
      }

      if (savedRoleId === 'guru' || savedRoleId === 'admin') {
        const profiles = await db.getProfiles();
        const profile = profiles.find(p => p.role === savedRoleId);
        if (profile) {
          await switchRole(savedRoleId);
          return;
        }
      }

      // If no valid saved session, stay unauthenticated so user must log in
      setCurrentUser(null);
      setCurrentStudent(null);
      setCurrentTeacher(null);
      setRole('siswa');
    } catch (err) {
      console.error('Failed to init auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: Role) => {
    setIsLoading(true);
    try {
      const profiles = await db.getProfiles();
      let targetProfile = profiles.find(p => p.role === targetRole);
      
      if (!targetProfile) {
        targetProfile = profiles[0];
      }

      setCurrentUser(targetProfile);
      setRole(targetProfile.role);
      localStorage.setItem('mitracbt_active_role', targetProfile.role);

      if (targetProfile.role === 'siswa') {
        const students = await db.getStudents();
        const student = students.find(s => s.profile_id === targetProfile!.id) || students[0];
        setCurrentStudent(student);
        setCurrentTeacher(null);
        if (student) {
          localStorage.setItem('mitracbt_student_id', student.id);
        }
      } else if (targetProfile.role === 'guru') {
        const teachers = await db.getTeachers();
        const teacher = teachers.find(t => t.profile_id === targetProfile!.id) || teachers[0];
        setCurrentTeacher(teacher);
        setCurrentStudent(null);
        localStorage.removeItem('mitracbt_student_id');
      } else {
        setCurrentStudent(null);
        setCurrentTeacher(null);
        localStorage.removeItem('mitracbt_student_id');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Student Login using NISN
  const loginWithNisn = async (nisn: string, _password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanNisn = nisn.trim();

      if (!cleanNisn || cleanNisn.length < 5) {
        return { success: false, error: 'NISN harus diisi (minimal 5 digit).' };
      }

      const students = await db.getStudents();
      let foundStudent = students.find(
        s => (s.nisn && s.nisn.toLowerCase() === cleanNisn.toLowerCase()) ||
             (s.nis && s.nis.toLowerCase() === cleanNisn.toLowerCase()) ||
             (s.profile?.full_name && s.profile.full_name.toLowerCase().includes(cleanNisn.toLowerCase()))
      );

      // If student not found, create a temporary guest profile so QR scan still works
      if (!foundStudent) {
        const guestProfileId = `guest-${cleanNisn.replace(/\s+/g, '-')}`;
        const guestStudentId = `student-guest-${cleanNisn.replace(/\s+/g, '-')}`;

        const isName = /[a-zA-Z]/.test(cleanNisn);
        const displayName = isName ? cleanNisn : `Siswa (${cleanNisn})`;

        const guestProfile: Profile = {
          id: guestProfileId,
          email: `${cleanNisn.replace(/\s+/g, '_')}@siswa.mitracbt.id`,
          full_name: displayName,
          role: 'siswa',
          created_at: new Date().toISOString()
        };

        foundStudent = {
          id: guestStudentId,
          profile_id: guestProfileId,
          nis: cleanNisn,
          nisn: cleanNisn,
          class_id: 'cls-tkr-10',
          status: 'active',
          profile: guestProfile
        };

        // Save guest profile and student to localStorage so session persists
        const existingProfiles = await db.getProfiles();
        if (!existingProfiles.find(p => p.id === guestProfileId)) {
          existingProfiles.push(guestProfile);
          localStorage.setItem('mitracbt_profiles', JSON.stringify(existingProfiles));
          fetch('/api/cbt-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'profiles', data: existingProfiles })
          }).catch(() => {});
        }

        const existingStudents = students.filter(s => s.id !== guestStudentId);
        existingStudents.push(foundStudent);
        localStorage.setItem('mitracbt_students', JSON.stringify(existingStudents));
        fetch('/api/cbt-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'students', data: existingStudents })
        }).catch(() => {});
      }

      const profiles = await db.getProfiles();
      const profile = profiles.find(p => p.id === foundStudent!.profile_id)
        || foundStudent.profile
        || {
          id: foundStudent.profile_id,
          email: `${cleanNisn}@siswa.mitracbt.id`,
          full_name: foundStudent.profile?.full_name || `Siswa (${cleanNisn})`,
          role: 'siswa' as Role,
          created_at: new Date().toISOString()
        };

      setCurrentUser(profile);
      setCurrentStudent(foundStudent);
      setCurrentTeacher(null);
      setRole('siswa');
      localStorage.setItem('mitracbt_active_role', 'siswa');
      localStorage.setItem('mitracbt_student_id', foundStudent.id);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan sistem saat verifikasi login.' };
    } finally {
      setIsLoading(false);
    }
  };


  // Login for Guru & Admin
  const loginWithCredentials = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanId = identifier.trim().toLowerCase();
      const cleanPw = password.trim();

      if (!cleanId || !cleanPw) {
        return { success: false, error: 'Email/NIP dan Password harus diisi.' };
      }

      const profiles = await db.getProfiles();
      const teachers = await db.getTeachers();

      // Check teacher by email or NIP
      const teacherByNip = teachers.find(t => t.nip && t.nip.toLowerCase() === cleanId);
      let matchedProfile = teacherByNip ? profiles.find(p => p.id === teacherByNip.profile_id) : undefined;

      if (!matchedProfile) {
        matchedProfile = profiles.find(p => p.email.toLowerCase() === cleanId);
      }

      if (!matchedProfile) {
        return { success: false, error: 'Akun pengajar atau administrator tidak ditemukan.' };
      }

      setCurrentUser(matchedProfile);
      setRole(matchedProfile.role);
      localStorage.setItem('mitracbt_active_role', matchedProfile.role);

      if (matchedProfile.role === 'guru') {
        const teacher = teachers.find(t => t.profile_id === matchedProfile!.id) || teachers[0];
        setCurrentTeacher(teacher);
        setCurrentStudent(null);
        localStorage.removeItem('mitracbt_student_id');
      } else if (matchedProfile.role === 'admin') {
        setCurrentTeacher(null);
        setCurrentStudent(null);
        localStorage.removeItem('mitracbt_student_id');
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, forcedRole?: Role): Promise<boolean> => {
    setIsLoading(true);
    try {
      const profiles = await db.getProfiles();
      let found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      
      if (!found && forcedRole) {
        found = profiles.find(p => p.role === forcedRole);
      }

      if (found) {
        await switchRole(found.role);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentStudent(null);
    setCurrentTeacher(null);
    localStorage.removeItem('mitracbt_active_role');
    localStorage.removeItem('mitracbt_student_id');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentStudent,
        currentTeacher,
        role,
        isLoading,
        login,
        loginWithNisn,
        loginWithCredentials,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
