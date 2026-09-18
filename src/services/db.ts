import { 
  Profile, ClassRoom, Teacher, Student, Subject, SubjectMaterial, 
  AssessmentType, QuestionBank, Question, Exam, ExamParticipant, ExamParticipantStatus,
  Answer, ExamEvent, ExamResult, AuditLog 
} from '../types';
import { 
  INITIAL_PROFILES, INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_TEACHERS,
  INITIAL_SUBJECTS, INITIAL_MATERIALS, INITIAL_ASSESSMENT_TYPES, 
  INITIAL_QUESTION_BANKS, INITIAL_QUESTIONS, INITIAL_EXAMS, 
  INITIAL_PARTICIPANTS, INITIAL_EVENTS, INITIAL_EXAM_RESULTS, INITIAL_AUDIT_LOGS 
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_PREFIX = 'mitracbt_';

// Asynchronous remote sync with Vite dev server sync endpoint
async function pushToSyncServer(key: string, data: any) {
  try {
    await fetch('/api/cbt-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data })
    });
  } catch (err) {
    // Ignore if offline / detached
  }
}

async function fetchFromSyncServer<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/cbt-sync?key=${encodeURIComponent(key)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data !== null && json.data !== undefined) {
        return json.data as T;
      }
    }
  } catch (err) {
    // Offline fallback
  }
  return null;
}

// ─── Supabase Persistence Helpers ──────────────────────────────────────────
// Tabel: cbt_participants & cbt_results (TEXT IDs, kompatibel dengan ID lokal)

async function upsertParticipantToSupabase(participant: ExamParticipant): Promise<void> {
  if (!supabase) return;
  try {
    const row = {
      local_id: participant.id,
      exam_id: participant.exam_id,
      student_id: participant.student_id,
      student_name: participant.student?.profile?.full_name || '',
      class_name: participant.class_name || participant.student?.class?.name || '',
      nis: participant.student?.nis || '',
      status: participant.status,
      start_time: participant.start_time || null,
      finish_time: participant.finish_time || null,
      score: participant.score ?? null,
      passed: participant.passed ?? null,
      tab_switch_count: participant.tab_switch_count,
      cheat_warning_count: participant.cheat_warning_count,
      remaining_seconds: participant.remaining_seconds ?? null,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase
      .from('cbt_participants')
      .upsert(row, { onConflict: 'exam_id,student_id' });
    if (error) console.warn('[Supabase] upsert participant:', error.message);
  } catch (err) {
    console.warn('[Supabase] upsertParticipant failed:', err);
  }
}

async function upsertResultToSupabase(result: ExamResult): Promise<void> {
  if (!supabase) return;
  try {
    const p = result.participant;
    const row = {
      local_id: result.id,
      exam_id: result.exam_id,
      participant_local_id: result.participant_id,
      student_name: p?.student?.profile?.full_name || '',
      class_name: p?.class_name || p?.student?.class?.name || '',
      nis: p?.student?.nis || '',
      total_score: result.total_score,
      max_possible_score: result.max_possible_score,
      percentage: result.percentage,
      correct_count: result.correct_count,
      wrong_count: result.wrong_count,
      unattempted_count: result.unattempted_count,
      passed: result.passed,
      graded_at: result.graded_at
    };
    const { error } = await supabase
      .from('cbt_results')
      .upsert(row, { onConflict: 'local_id' });
    if (error) console.warn('[Supabase] upsert result:', error.message);
  } catch (err) {
    console.warn('[Supabase] upsertResult failed:', err);
  }
}

async function fetchParticipantsFromSupabase(examId: string): Promise<Partial<ExamParticipant>[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('cbt_participants')
      .select('*')
      .eq('exam_id', examId);
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.local_id,
      exam_id: row.exam_id,
      student_id: row.student_id,
      class_name: row.class_name,
      status: row.status as ExamParticipantStatus,
      start_time: row.start_time,
      finish_time: row.finish_time,
      score: row.score,
      passed: row.passed,
      tab_switch_count: row.tab_switch_count,
      cheat_warning_count: row.cheat_warning_count,
      remaining_seconds: row.remaining_seconds
    }));
  } catch (err) {
    console.warn('[Supabase] fetchParticipants failed:', err);
    return [];
  }
}

async function fetchResultsFromSupabase(examId: string): Promise<Partial<ExamResult>[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('cbt_results')
      .select('*')
      .eq('exam_id', examId);
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.local_id,
      exam_id: row.exam_id,
      participant_id: row.participant_local_id,
      total_score: row.total_score,
      max_possible_score: row.max_possible_score,
      percentage: row.percentage,
      correct_count: row.correct_count,
      wrong_count: row.wrong_count,
      unattempted_count: row.unattempted_count,
      passed: row.passed,
      graded_at: row.graded_at
    }));
  } catch (err) {
    console.warn('[Supabase] fetchResults failed:', err);
    return [];
  }
}

async function fetchParticipantFromSupabase(
  examId: string,
  studentId: string
): Promise<Partial<ExamParticipant> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('cbt_participants')
      .select('*')
      .eq('exam_id', examId)
      .eq('student_id', studentId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.local_id,
      exam_id: data.exam_id,
      student_id: data.student_id,
      class_name: data.class_name,
      status: data.status as ExamParticipantStatus,
      start_time: data.start_time,
      finish_time: data.finish_time,
      score: data.score,
      passed: data.passed,
      tab_switch_count: data.tab_switch_count,
      cheat_warning_count: data.cheat_warning_count,
      remaining_seconds: data.remaining_seconds
    };
  } catch (err) {
    console.warn('[Supabase] fetchParticipant failed:', err);
    return null;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading storage for ${key}:`, err);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    // Asynchronously push to server sync so other devices receive it
    pushToSyncServer(key, value);
  } catch (err) {
    console.error(`Error writing storage for ${key}:`, err);
  }
}

// Event Emitter for Realtime Simulation & Cross-Device Broadcast
type ListenerCallback = (payload: any) => void;
class EventBus {
  private listeners: Map<string, Set<ListenerCallback>> = new Map();

  subscribe(event: string, callback: ListenerCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, payload: any, shouldBroadcast = true) {
    this.listeners.get(event)?.forEach(cb => cb(payload));
    if (shouldBroadcast && realtimeChannel) {
      try {
        realtimeChannel.send({
          type: 'broadcast',
          event,
          payload
        }).catch(() => {});
      } catch (err) {
        // Broadcast fail safe
      }
    }
  }
}

export const realtimeBus = new EventBus();

// Broadcast channel via Supabase Realtime across devices
let realtimeChannel: any = null;
if (supabase) {
  try {
    realtimeChannel = supabase.channel('mitracbt-live-room');
    realtimeChannel
      .on('presence', { event: 'sync' }, () => {
        try {
          const state = realtimeChannel.presenceState();
          const activeList: any[] = [];
          Object.values(state).forEach((items: any) => {
            items.forEach((p: any) => {
              if (p.student_id || p.student_name) activeList.push(p);
            });
          });
          realtimeBus.emit('presence_synced', activeList, false);
        } catch (e) {}
      })
      .on('presence', { event: 'join' }, () => {
        try {
          const state = realtimeChannel.presenceState();
          const activeList: any[] = [];
          Object.values(state).forEach((items: any) => {
            items.forEach((p: any) => {
              if (p.student_id || p.student_name) activeList.push(p);
            });
          });
          realtimeBus.emit('presence_synced', activeList, false);
        } catch (e) {}
      })
      .on('presence', { event: 'leave' }, () => {
        try {
          const state = realtimeChannel.presenceState();
          const activeList: any[] = [];
          Object.values(state).forEach((items: any) => {
            items.forEach((p: any) => {
              if (p.student_id || p.student_name) activeList.push(p);
            });
          });
          realtimeBus.emit('presence_synced', activeList, false);
        } catch (e) {}
      })
      .on('broadcast', { event: 'participant_updated' }, ({ payload }: any) => {
        if (!payload || !payload.id) return;
        const parts = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
        const idx = parts.findIndex(p => p.id === payload.id);
        if (idx >= 0) {
          parts[idx] = { ...parts[idx], ...payload };
        } else {
          parts.push(payload);
        }
        localStorage.setItem(STORAGE_PREFIX + 'participants', JSON.stringify(parts));
        realtimeBus.emit('participant_updated', payload, false);
      })
      .on('broadcast', { event: 'event_logged' }, ({ payload }: any) => {
        if (!payload || !payload.id) return;
        const events = getStorage<ExamEvent[]>('events', INITIAL_EVENTS);
        if (!events.find(e => e.id === payload.id)) {
          events.unshift(payload);
          localStorage.setItem(STORAGE_PREFIX + 'events', JSON.stringify(events));
        }
        realtimeBus.emit('event_logged', payload, false);
      })
      .on('broadcast', { event: 'ping_active_students' }, ({ payload }: any) => {
        realtimeBus.emit('ping_active_students', payload, false);
      })
      .on('broadcast', { event: 'exam_updated' }, ({ payload }: any) => {
        if (!payload || !payload.id) return;
        const exams = getStorage<Exam[]>('exams', INITIAL_EXAMS);
        const idx = exams.findIndex(e => e.id === payload.id);
        if (idx >= 0) {
          exams[idx] = { ...exams[idx], ...payload };
        } else {
          exams.push(payload);
        }
        localStorage.setItem(STORAGE_PREFIX + 'exams', JSON.stringify(exams));
        realtimeBus.emit('exams_updated', payload, false);
      })
      .subscribe();
  } catch (e) {
    console.error('Supabase broadcast channel failed:', e);
  }
}

export function getRealtimeChannel() {
  return realtimeChannel;
}

class DBService {
  // Profiles
  async getProfiles(): Promise<Profile[]> {
    const serverProfiles = await fetchFromSyncServer<Profile[]>('profiles');
    const localProfiles = getStorage<Profile[]>('profiles', INITIAL_PROFILES);
    if (serverProfiles && serverProfiles.length > 0) {
      for (const sp of serverProfiles) {
        if (!localProfiles.find(p => p.id === sp.id)) {
          localProfiles.push(sp);
        }
      }
      setStorage('profiles', localProfiles);
    }
    return localProfiles;
  }

  async getProfileById(id: string): Promise<Profile | undefined> {
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === id);
  }

  // Classes
  async getClasses(): Promise<ClassRoom[]> {
    let classes = getStorage<ClassRoom[]>('classes', INITIAL_CLASSES);
    // If stored classes don't contain the target exam classes ('X TKR 1', 'X TKR 2', 'X TKR 1 03', 'X TKR 2 03'), reset/update to INITIAL_CLASSES
    const hasTargetClasses = classes && classes.some(c => c.name === 'X TKR 1' || c.name === 'X TKR 1 03');
    if (!hasTargetClasses) {
      classes = INITIAL_CLASSES;
      setStorage('classes', INITIAL_CLASSES);
    }
    return classes;
  }

  async addClass(cls: Omit<ClassRoom, 'id'>): Promise<ClassRoom> {
    const classes = await this.getClasses();
    const newClass: ClassRoom = { ...cls, id: 'class-' + Date.now() };
    classes.push(newClass);
    setStorage('classes', classes);
    this.logAudit('CREATE_CLASS', 'class', newClass.id, { name: newClass.name });
    return newClass;
  }

  // Students & Teachers
  async getStudents(): Promise<Student[]> {
    const serverStudents = await fetchFromSyncServer<Student[]>('students');
    let students = getStorage<Student[]>('students', INITIAL_STUDENTS);
    if (serverStudents && serverStudents.length > 0) {
      for (const ss of serverStudents) {
        const idx = students.findIndex(s => s.id === ss.id);
        if (idx >= 0) {
          students[idx] = ss;
        } else {
          students.push(ss);
        }
      }
      setStorage('students', students);
    }
    const classes = await this.getClasses();
    return students.map(s => ({
      ...s,
      class: classes.find(c => c.id === s.class_id),
    }));
  }

  async getTeachers(): Promise<Teacher[]> {
    return getStorage<Teacher[]>('teachers', INITIAL_TEACHERS);
  }

  /**
   * Batch-import siswa dari hasil parsing Excel.
   * Membuat Profile (role=siswa, email=nisn@siswa.mitracbt.id) dan Student record.
   * Siswa yang NISN-nya sudah ada di database akan dilewati (tidak duplikat).
   * Kembalikan jumlah siswa yang berhasil diimport.
   */
  async importStudents(rows: import('../utils/excelImport').StudentImportRow[]): Promise<number> {
    const profiles  = await this.getProfiles();
    const students  = getStorage<Student[]>('students', INITIAL_STUDENTS);

    // Index existing NISNs
    const existingNisns = new Set(students.map(s => s.nisn));

    const newProfiles: Profile[]  = [];
    const newStudents: Student[]  = [];

    for (const row of rows) {
      if (!row.valid || !row.class_id) continue;
      if (existingNisns.has(row.nisn)) continue; // skip duplikat

      const profileId = 'profile-siswa-' + row.nisn;
      const studentId = 'student-' + row.nisn;

      const profile: Profile = {
        id:         profileId,
        email:      row.nisn + '@siswa.mitracbt.id',
        full_name:  row.full_name,
        role:       'siswa',
        created_at: new Date().toISOString(),
      };

      const student: Student = {
        id:         studentId,
        profile_id: profileId,
        nis:        row.nis || row.nisn,
        nisn:       row.nisn,
        class_id:   row.class_id,
        status:     'active',
        profile,
      };

      newProfiles.push(profile);
      newStudents.push(student);
      existingNisns.add(row.nisn);
    }

    if (newProfiles.length === 0) return 0;

    setStorage('profiles', [...profiles, ...newProfiles]);
    setStorage('students', [...students, ...newStudents]);

    this.logAudit('IMPORT_STUDENTS', 'student', undefined, {
      count:   newStudents.length,
      classes: [...new Set(newStudents.map(s => s.class_id))],
    });

    return newStudents.length;
  }

  // Update teacher profile & teacher record
  async updateTeacher(
    teacherId: string,
    data: { full_name: string; email: string; nip: string; subject_specialty: string; phone?: string }
  ): Promise<void> {
    const teachers = getStorage<Teacher[]>('teachers', INITIAL_TEACHERS);
    const profiles  = await this.getProfiles();

    const teacherIdx = teachers.findIndex(t => t.id === teacherId);
    if (teacherIdx === -1) throw new Error('Guru tidak ditemukan');

    const teacher = teachers[teacherIdx];
    teachers[teacherIdx] = {
      ...teacher,
      nip: data.nip,
      subject_specialty: data.subject_specialty,
    };

    const profileIdx = profiles.findIndex(p => p.id === teacher.profile_id);
    if (profileIdx !== -1) {
      profiles[profileIdx] = {
        ...profiles[profileIdx],
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
      };
    }

    setStorage('teachers', teachers);
    setStorage('profiles', profiles);
    this.logAudit('UPDATE_TEACHER', 'teacher', teacherId, { name: data.full_name });
  }


  // Subjects & Materials
  async getSubjects(): Promise<Subject[]> {
    return getStorage<Subject[]>('subjects', INITIAL_SUBJECTS);
  }

  async addSubject(subj: Omit<Subject, 'id'>): Promise<Subject> {
    const subjects = await this.getSubjects();
    const newSubj: Subject = { ...subj, id: 'subj-' + Date.now() };
    subjects.push(newSubj);
    setStorage('subjects', subjects);
    this.logAudit('CREATE_SUBJECT', 'subject', newSubj.id, { name: newSubj.name });
    return newSubj;
  }

  async getMaterials(subjectId?: string): Promise<SubjectMaterial[]> {
    const materials = getStorage<SubjectMaterial[]>('materials', INITIAL_MATERIALS);
    if (!subjectId) return materials;
    return materials.filter(m => m.subject_id === subjectId);
  }

  async addMaterial(mat: Omit<SubjectMaterial, 'id'>): Promise<SubjectMaterial> {
    const materials = await this.getMaterials();
    const newMat: SubjectMaterial = { ...mat, id: 'mat-' + Date.now() };
    materials.push(newMat);
    setStorage('materials', materials);
    return newMat;
  }

  // Assessment Types
  async getAssessmentTypes(): Promise<AssessmentType[]> {
    return getStorage<AssessmentType[]>('assessment_types', INITIAL_ASSESSMENT_TYPES);
  }

  async addAssessmentType(item: Omit<AssessmentType, 'id'>): Promise<AssessmentType> {
    const types = await this.getAssessmentTypes();
    const newType: AssessmentType = { ...item, id: 'eval-' + Date.now() };
    types.push(newType);
    setStorage('assessment_types', types);
    this.logAudit('CREATE_ASSESSMENT_TYPE', 'assessment_type', newType.id, { code: newType.code });
    return newType;
  }

  // Question Banks
  async getQuestionBanks(): Promise<QuestionBank[]> {
    let banks = getStorage<QuestionBank[]>('question_banks', INITIAL_QUESTION_BANKS);
    
    // Ensure both bank-01 (GTO) and bank-02 (Engine) exist in localStorage
    const defaultEngineBank = INITIAL_QUESTION_BANKS.find(b => b.id === 'bank-02');
    if (defaultEngineBank && !banks.some(b => b.id === 'bank-02')) {
      banks.push(defaultEngineBank);
      setStorage('question_banks', banks);
    }

    const questions = await this.getQuestions();
    const subjects = await this.getSubjects();

    return banks.map(b => ({
      ...b,
      subject: subjects.find(s => s.id === b.subject_id),
      question_count: questions.filter(q => q.bank_id === b.id).length
    }));
  }

  async addQuestionBank(bank: Omit<QuestionBank, 'id' | 'created_at'>): Promise<QuestionBank> {
    const banks = await this.getQuestionBanks();
    const newBank: QuestionBank = {
      ...bank,
      id: 'bank-' + Date.now(),
      created_at: new Date().toISOString()
    };
    banks.push(newBank);
    setStorage('question_banks', banks);
    this.logAudit('CREATE_QUESTION_BANK', 'question_bank', newBank.id, { title: newBank.title });
    return newBank;
  }

  async updateQuestionBank(bank: QuestionBank): Promise<QuestionBank> {
    const banks = getStorage<QuestionBank[]>('question_banks', INITIAL_QUESTION_BANKS);
    const idx = banks.findIndex(b => b.id === bank.id);
    if (idx >= 0) {
      banks[idx] = { ...banks[idx], ...bank };
    } else {
      banks.push(bank);
    }
    setStorage('question_banks', banks);
    this.logAudit('UPDATE_QUESTION_BANK', 'question_bank', bank.id, { title: bank.title });
    return banks[idx >= 0 ? idx : banks.length - 1];
  }

  // Questions
  async getQuestions(bankId?: string): Promise<Question[]> {
    const serverQuestions = await fetchFromSyncServer<Question[]>('questions');
    let localQuestions = getStorage<Question[]>('questions', INITIAL_QUESTIONS);

    if (serverQuestions && serverQuestions.length > 0) {
      for (const sq of serverQuestions) {
        const idx = localQuestions.findIndex(q => q.id === sq.id);
        if (idx >= 0) {
          localQuestions[idx] = sq;
        } else {
          localQuestions.push(sq);
        }
      }
      setStorage('questions', localQuestions);
    }

    // Auto-clean: purge mock old placeholder questions ('q-01' through 'q-28' only if they aren't part of bank-02)
    const mockOldIds = ['q-01', 'q-02', 'q-03', 'q-04', 'q-05', 'q-06', 'q-07', 'q-08', 'q-09', 'q-10'];
    const cleaned = localQuestions.filter(
      q => !(mockOldIds.includes(q.id) && q.bank_id !== 'bank-02')
    );
    if (cleaned.length !== localQuestions.length) {
      localQuestions = cleaned;
      setStorage('questions', localQuestions);
    }

    // Auto-Repair: Separate imported Engine questions from bank-01 (GTO)
    // All 25 authentic GTO questions have IDs starting with 'q-gto-'
    // Any question currently filed under bank-01 with a non-GTO ID (e.g. imported questions)
    // belongs to bank-02 (Engine). Move them safely!
    let hasMoved = false;
    for (const q of localQuestions) {
      if (q.bank_id === 'bank-01' && !q.id.startsWith('q-gto-')) {
        q.bank_id = 'bank-02';
        hasMoved = true;
      }
    }
    if (hasMoved) {
      setStorage('questions', localQuestions);
      const banks = getStorage<QuestionBank[]>('question_banks', INITIAL_QUESTION_BANKS);
      banks.forEach(b => {
        b.question_count = localQuestions.filter(item => item.bank_id === b.id).length;
      });
      setStorage('question_banks', banks);
    }

    if (!bankId) return localQuestions;
    return localQuestions.filter(q => q.bank_id === bankId);
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const questions = await this.getQuestions();
    return questions.find(q => q.id === id);
  }

  async saveQuestion(q: Omit<Question, 'id' | 'created_at'> & { id?: string }): Promise<Question> {
    const questions = await this.getQuestions();
    let saved: Question;

    if (q.id) {
      const idx = questions.findIndex(item => item.id === q.id);
      if (idx >= 0) {
        saved = { ...questions[idx], ...q, id: q.id };
        questions[idx] = saved;
      } else {
        saved = { ...q, id: q.id, created_at: new Date().toISOString() };
        questions.push(saved);
      }
      this.logAudit('EDIT_QUESTION', 'question', saved.id, { type: saved.question_type });
    } else {
      saved = {
        ...q,
        id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString()
      };
      questions.push(saved);
      this.logAudit('CREATE_QUESTION', 'question', saved.id, { type: saved.question_type });
    }

    setStorage('questions', questions);

    // Sync question bank counts
    const banks = getStorage<QuestionBank[]>('question_banks', INITIAL_QUESTION_BANKS);
    banks.forEach(b => {
      b.question_count = questions.filter(item => item.bank_id === b.id).length;
    });
    setStorage('question_banks', banks);

    return saved;
  }

  async deleteQuestion(id: string): Promise<void> {
    let questions = await this.getQuestions();
    questions = questions.filter(q => q.id !== id);
    setStorage('questions', questions);

    // Sync question bank counts immediately
    const banks = getStorage<QuestionBank[]>('question_banks', INITIAL_QUESTION_BANKS);
    banks.forEach(b => {
      b.question_count = questions.filter(item => item.bank_id === b.id).length;
    });
    setStorage('question_banks', banks);

    // Also update any exams referencing this question
    const exams = getStorage<Exam[]>('exams', INITIAL_EXAMS);
    let examsUpdated = false;
    exams.forEach(ex => {
      if (ex.questions && ex.questions.some(q => q.id === id)) {
        ex.questions = ex.questions.filter(q => q.id !== id);
        ex.question_count = ex.questions.length;
        examsUpdated = true;
      }
    });
    if (examsUpdated) {
      setStorage('exams', exams);
    }

    this.logAudit('DELETE_QUESTION', 'question', id, {});
  }

  // Exams
  async getExams(): Promise<Exam[]> {
    const serverExams = await fetchFromSyncServer<Exam[]>('exams');
    const localExams = getStorage<Exam[]>('exams', INITIAL_EXAMS);

    if (serverExams && serverExams.length > 0) {
      for (const se of serverExams) {
        const idx = localExams.findIndex(e => e.id === se.id);
        if (idx >= 0) {
          localExams[idx] = se;
        } else {
          localExams.push(se);
        }
      }
      setStorage('exams', localExams);
    }

    // Purge only legacy mock dummy exam IDs if present
    const dummyIds = ['exam-01', 'exam-02', 'exam-03', 'exam-04'];
    const filteredExams = localExams.filter(e => !dummyIds.includes(e.id));

    if (filteredExams.length !== localExams.length) {
      localExams.splice(0, localExams.length, ...filteredExams);
      setStorage('exams', localExams);
    }

    // Auto-migrate: ensure STS Gambar Teknik Otomotif Kelas X exists with 25 questions from bank-01 and PIN GT010
    const storedQuestions = getStorage<Question[]>('questions', INITIAL_QUESTIONS);
    const gtoQuestions = storedQuestions.filter(q => q.bank_id === 'bank-01');
    let gtoExam = localExams.find(e => e.id === 'exam-gto-x' || e.title.toLowerCase().includes('gambar teknik') || e.title.toLowerCase().includes('gto'));

    if (!gtoExam) {
      const newGtoExam: Exam = {
        id: 'exam-gto-x',
        title: 'STS Gambar Teknik Otomotif Kelas X',
        assessment_type_id: 'eval-01',
        subject_id: 'subj-01',
        class_id: 'all',
        teacher_id: 'teacher-01',
        academic_year: '2024/2025',
        semester: 'Ganjil',
        start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        duration_minutes: 90,
        question_count: gtoQuestions.length || 25,
        kkm: 75,
        randomize_questions: true,
        randomize_options: true,
        allow_backward: true,
        fullscreen_mode: true,
        single_attempt: true,
        show_results_immediately: true,
        show_explanation: true,
        pin_code: 'GT010',
        status: 'active',
        questions: gtoQuestions
      };
      localExams.unshift(newGtoExam);
      setStorage('exams', localExams);
    } else {
      // Keep GTO active, ensure pin_code is GT010, class is all, and questions are strictly GTO (25 questions)
      gtoExam.status = 'active';
      gtoExam.pin_code = 'GT010';
      gtoExam.class_id = 'all';
      gtoExam.question_count = gtoQuestions.length || 25;
      gtoExam.questions = gtoQuestions;
      setStorage('exams', localExams);
    }

    // Auto-sync: If Engine questions exist in bank-02, ensure STS Engine exam exists or is updated with 25 questions
    const engineQuestions = storedQuestions.filter(q => q.bank_id === 'bank-02');
    if (engineQuestions.length > 0) {
      let engineExam = localExams.find(e => e.id === 'exam-engine-x' || (e.title.toLowerCase().includes('engine') && !e.title.toLowerCase().includes('gambar teknik')));
      if (!engineExam) {
        const newEngineExam: Exam = {
          id: 'exam-engine-x',
          title: 'STS Dasar Konversi Energi & Engine Otomotif Kelas X',
          assessment_type_id: 'eval-01',
          subject_id: 'subj-02',
          class_id: 'all',
          teacher_id: 'teacher-01',
          academic_year: '2024/2025',
          semester: 'Ganjil',
          start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          duration_minutes: 90,
          question_count: engineQuestions.length,
          kkm: 75,
          randomize_questions: true,
          randomize_options: true,
          allow_backward: true,
          fullscreen_mode: true,
          single_attempt: true,
          show_results_immediately: true,
          show_explanation: true,
          pin_code: 'ENG40',
          status: 'active',
          questions: engineQuestions
        };
        localExams.push(newEngineExam);
        setStorage('exams', localExams);
      } else {
        engineExam.questions = engineQuestions;
        engineExam.question_count = engineQuestions.length;
        if (!engineExam.pin_code) engineExam.pin_code = 'ENG40';
        setStorage('exams', localExams);
      }
    }

    const types = await this.getAssessmentTypes();
    const subjects = await this.getSubjects();
    const classes = await this.getClasses();
    const questions = await this.getQuestions();

    return localExams.map(e => ({
      ...e,
      assessment_type: types.find(t => t.id === e.assessment_type_id),
      subject: subjects.find(s => s.id === e.subject_id),
      class: e.class_id === 'all'
        ? { id: 'all', name: 'Semua Kelas', grade: 'X', major: 'TKR', academic_year: '2024/2025' }
        : classes.find(c => c.id === e.class_id),
      questions: e.questions && e.questions.length > 0 ? e.questions : questions.slice(0, e.question_count)
    }));
  }

  async getExamById(id: string): Promise<Exam | undefined> {
    const exams = await this.getExams();
    return exams.find(e => e.id === id);
  }

  async saveExam(examData: Partial<Exam>): Promise<Exam> {
    const exams = await this.getExams();
    let saved: Exam;

    if (examData.id) {
      const idx = exams.findIndex(e => e.id === examData.id);
      if (idx >= 0) {
        saved = { ...exams[idx], ...examData } as Exam;
        exams[idx] = saved;
      } else {
        saved = examData as Exam;
        exams.push(saved);
      }
      this.logAudit('EDIT_EXAM', 'exam', saved.id, { title: saved.title });
    } else {
      saved = {
        ...examData,
        id: 'exam-' + Date.now(),
        status: examData.status || 'active',
        pin_code: examData.pin_code || Math.random().toString(36).substring(2, 7).toUpperCase(),
        kkm: examData.kkm || 75
      } as Exam;
      exams.push(saved);
      this.logAudit('CREATE_EXAM', 'exam', saved.id, { title: saved.title, pin: saved.pin_code });
    }

    setStorage('exams', exams);
    realtimeBus.emit('exams_updated', saved);
    if (realtimeChannel) {
      try {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'exam_updated',
          payload: saved
        }).catch(() => {});
      } catch (err) {}
    }
    return saved;
  }

  async deleteExam(id: string): Promise<void> {
    const exams = getStorage<Exam[]>('exams', INITIAL_EXAMS);
    const filtered = exams.filter(e => e.id !== id);
    setStorage('exams', filtered);
    this.logAudit('DELETE_EXAM', 'exam', id, {});
    realtimeBus.emit('exams_updated', { id, deleted: true });
  }

  // Participants & Sessions
  async getExamParticipants(examId: string): Promise<ExamParticipant[]> {
    const serverParts = await fetchFromSyncServer<ExamParticipant[]>('participants');
    let participants = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
    if (serverParts && serverParts.length > 0) {
      for (const sp of serverParts) {
        const idx = participants.findIndex(p => p.id === sp.id);
        if (idx >= 0) {
          participants[idx] = sp;
        } else {
          participants.push(sp);
        }
      }
      setStorage('participants', participants);
    }

    // Merge dari Supabase (sumber kebenaran permanen)
    const supabaseParts = await fetchParticipantsFromSupabase(examId);
    if (supabaseParts.length > 0) {
      let changed = false;
      for (const sp of supabaseParts) {
        const idx = participants.findIndex(p => p.id === sp.id);
        if (idx >= 0) {
          // Perbarui hanya jika status di Supabase lebih final
          const curr = participants[idx];
          const statusRank: Record<string, number> = { not_started: 0, in_progress: 1, submitted: 2, force_submitted: 2 };
          if ((statusRank[sp.status!] ?? 0) >= (statusRank[curr.status] ?? 0)) {
            participants[idx] = { ...curr, ...sp };
            changed = true;
          }
        } else {
          participants.push(sp as ExamParticipant);
          changed = true;
        }
      }
      if (changed) setStorage('participants', participants);
    }

    const students = await this.getStudents();
    const exam = await this.getExamById(examId);

    return participants
      .filter(p => p.exam_id === examId)
      .map(p => ({
        ...p,
        student: students.find(s => s.id === p.student_id) || p.student,
        exam
      }));
  }

  async getParticipantSession(examId: string, studentId: string): Promise<ExamParticipant> {
    const serverParts = await fetchFromSyncServer<ExamParticipant[]>('participants');
    let participants = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
    if (serverParts && serverParts.length > 0) {
      for (const sp of serverParts) {
        const idx = participants.findIndex(p => p.id === sp.id);
        if (idx >= 0) {
          participants[idx] = sp;
        } else {
          participants.push(sp);
        }
      }
      setStorage('participants', participants);
    }
    let session = participants.find(p => p.exam_id === examId && p.student_id === studentId);

    const students = await this.getStudents();
    const exam = await this.getExamById(examId);

    if (!session) {
      // Coba restore dari Supabase sebelum buat sesi baru
      const sbSession = await fetchParticipantFromSupabase(examId, studentId);
      if (sbSession && sbSession.id) {
        session = {
          ...sbSession,
          student: students.find(s => s.id === studentId),
          exam
        } as ExamParticipant;
        participants.push(session);
        setStorage('participants', participants);
        console.log('[MitraExam] Sesi ujian dipulihkan dari Supabase:', session.id);
      } else {
        // Sesi baru
        session = {
          id: 'part-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          exam_id: examId,
          student_id: studentId,
          status: 'not_started',
          tab_switch_count: 0,
          cheat_warning_count: 0,
          remaining_seconds: (exam?.duration_minutes || 90) * 60,
          student: students.find(s => s.id === studentId),
          exam
        };
        participants.push(session);
        setStorage('participants', participants);
        // Simpan sesi baru ke Supabase
        upsertParticipantToSupabase(session);
      }
    }

    return session;
  }

  async updateParticipantSession(participantId: string, updates: Partial<ExamParticipant>): Promise<ExamParticipant> {
    const participants = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
    const idx = participants.findIndex(p => p.id === participantId);
    if (idx === -1) throw new Error('Participant session not found');

    const updated = { ...participants[idx], ...updates };
    participants[idx] = updated;
    setStorage('participants', participants);

    // Simpan ke Supabase (async, tidak block UI)
    upsertParticipantToSupabase(updated);

    // Emit realtime update for teacher live monitoring
    realtimeBus.emit('participant_updated', updated);
    return updated;
  }

  // Answers & Auto-save
  async getAnswers(participantId: string): Promise<Answer[]> {
    const allAnswers = getStorage<Answer[]>('answers', []);
    return allAnswers.filter(a => a.participant_id === participantId);
  }

  async saveAnswer(answerData: Omit<Answer, 'id' | 'saved_at'>): Promise<Answer> {
    const allAnswers = getStorage<Answer[]>('answers', []);
    const idx = allAnswers.findIndex(
      a => a.participant_id === answerData.participant_id && a.question_id === answerData.question_id
    );

    const saved: Answer = {
      ...answerData,
      id: idx >= 0 ? allAnswers[idx].id : 'ans-' + Date.now(),
      saved_at: new Date().toISOString()
    };

    if (idx >= 0) {
      allAnswers[idx] = saved;
    } else {
      allAnswers.push(saved);
    }

    setStorage('answers', allAnswers);

    // Update remaining seconds and activity in participant session
    const participants = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
    const pIdx = participants.findIndex(p => p.id === answerData.participant_id);
    if (pIdx >= 0 && participants[pIdx].status === 'not_started') {
      participants[pIdx].status = 'in_progress';
      participants[pIdx].start_time = new Date().toISOString();
      setStorage('participants', participants);
      realtimeBus.emit('participant_updated', participants[pIdx]);
    }

    return saved;
  }

  // Exam Events & Anti-cheating
  async logEvent(
    examId: string, 
    participantId: string, 
    eventType: ExamEvent['event_type'], 
    details: Record<string, any> = {},
    participantName?: string
  ): Promise<ExamEvent> {
    const events = getStorage<ExamEvent[]>('events', INITIAL_EVENTS);
    const newEvent: ExamEvent = {
      id: 'ev-' + Date.now(),
      exam_id: examId,
      participant_id: participantId,
      event_type: eventType,
      details,
      created_at: new Date().toISOString(),
      participant_name: participantName
    };

    events.unshift(newEvent); // newest first
    setStorage('events', events);

    // If it's an integrity violation (tab switch, fullscreen exit, multi-screen, voice AI), update counters
    if (
      eventType === 'TAB_SWITCH' || 
      eventType === 'FULLSCREEN_EXIT' || 
      eventType === 'MULTI_SCREEN_SPLIT' || 
      eventType === 'VOICE_AI_DETECTED'
    ) {
      const participants = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
      const pIdx = participants.findIndex(p => p.id === participantId);
      if (pIdx >= 0) {
        participants[pIdx].tab_switch_count += 1;
        participants[pIdx].cheat_warning_count += 1;
        setStorage('participants', participants);
        realtimeBus.emit('participant_updated', participants[pIdx]);
      }
    }

    realtimeBus.emit('event_logged', newEvent);
    return newEvent;
  }

  async getEvents(examId: string): Promise<ExamEvent[]> {
    const serverEvents = await fetchFromSyncServer<ExamEvent[]>('events');
    let events = getStorage<ExamEvent[]>('events', INITIAL_EVENTS);
    if (serverEvents && serverEvents.length > 0) {
      for (const se of serverEvents) {
        if (!events.find(e => e.id === se.id)) {
          events.push(se);
        }
      }
      setStorage('events', events);
    }
    return events.filter(e => e.exam_id === examId);
  }

  async getAllEvents(): Promise<ExamEvent[]> {
    const serverEvents = await fetchFromSyncServer<ExamEvent[]>('events');
    let events = getStorage<ExamEvent[]>('events', INITIAL_EVENTS);
    if (serverEvents && serverEvents.length > 0) {
      for (const se of serverEvents) {
        if (!events.find(e => e.id === se.id)) {
          events.push(se);
        }
      }
      setStorage('events', events);
    }
    return events;
  }

  // Grading & Submitting Exam
  async submitExam(participantId: string, status?: ExamParticipantStatus): Promise<ExamResult> {
    const participants = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
    const pIdx = participants.findIndex(p => p.id === participantId);
    if (pIdx === -1) throw new Error('Participant not found');

    const participant = participants[pIdx];
    const exam = await this.getExamById(participant.exam_id);
    if (!exam) throw new Error('Exam not found');

    const questions = exam.questions || (await this.getQuestions());
    const answers = await this.getAnswers(participantId);

    let totalScore = 0;
    let maxPossibleScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    questions.forEach(q => {
      const weight = Number(q.weight) || 1;
      maxPossibleScore += weight;

      const ans = answers.find(a => a.question_id === q.id);
      if (!ans || (!ans.selected_option_ids?.length && !ans.text_answer?.trim())) {
        unattemptedCount++;
        return;
      }

      let isCorrect = false;

      if (q.question_type === 'pilihan_ganda' || q.question_type === 'benar_salah') {
        const correctOpt = q.options.find(o => o.is_correct);
        if (correctOpt && ans.selected_option_ids[0] === correctOpt.id) {
          isCorrect = true;
        }
      } else if (q.question_type === 'pg_kompleks') {
        const correctOptIds = q.options.filter(o => o.is_correct).map(o => o.id).sort();
        const studentOptIds = [...ans.selected_option_ids].sort();
        if (
          correctOptIds.length === studentOptIds.length &&
          correctOptIds.every((id, i) => id === studentOptIds[i])
        ) {
          isCorrect = true;
        }
      } else if (q.question_type === 'isian_singkat') {
        const correctTexts = q.options.map(o => o.content.trim().toLowerCase());
        const studentText = (ans.text_answer || '').trim().toLowerCase();
        if (correctTexts.includes(studentText)) {
          isCorrect = true;
        }
      } else {
        // Menjodohkan or other fallback
        isCorrect = true;
      }

      if (isCorrect) {
        correctCount++;
        totalScore += weight;
      } else {
        wrongCount++;
      }
    });

    const scaledPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    const finalScore = Math.round(scaledPercentage * 10) / 10;
    const passed = finalScore >= (exam.kkm || 75);

    // Update participant
    participant.status = status || 'submitted';
    participant.finish_time = new Date().toISOString();
    participant.score = finalScore;
    participant.passed = passed;
    participants[pIdx] = participant;
    setStorage('participants', participants);

    // Save result
    const results = getStorage<ExamResult[]>('exam_results', INITIAL_EXAM_RESULTS);
    const existingResultIdx = results.findIndex(r => r.participant_id === participantId);

    const newResult: ExamResult = {
      id: existingResultIdx >= 0 ? results[existingResultIdx].id : 'res-' + Date.now(),
      exam_id: exam.id,
      participant_id: participantId,
      total_score: finalScore,
      max_possible_score: 100,
      percentage: finalScore,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unattempted_count: unattemptedCount,
      passed,
      graded_at: new Date().toISOString(),
      participant
    };

    if (existingResultIdx >= 0) {
      results[existingResultIdx] = newResult;
    } else {
      results.push(newResult);
    }
    setStorage('exam_results', results);

    // Simpan hasil & peserta ke Supabase secara permanen
    await upsertParticipantToSupabase(participant);
    await upsertResultToSupabase(newResult);

    // Log submit event
    await this.logEvent(
      exam.id, 
      participantId, 
      'SUBMIT_EXAM', 
      { finalScore, passed, correctCount, wrongCount, unattemptedCount },
      participant.student?.profile?.full_name
    );

    realtimeBus.emit('participant_updated', participant);
    return newResult;
  }

  async getExamResults(examId: string): Promise<ExamResult[]> {
    const serverResults = await fetchFromSyncServer<ExamResult[]>('exam_results');
    let results = getStorage<ExamResult[]>('exam_results', INITIAL_EXAM_RESULTS);
    if (serverResults && serverResults.length > 0) {
      for (const sr of serverResults) {
        const idx = results.findIndex(r => r.id === sr.id);
        if (idx >= 0) {
          results[idx] = sr;
        } else {
          results.push(sr);
        }
      }
      setStorage('exam_results', results);
    }

    // Merge dari Supabase (sumber kebenaran permanen)
    const supabaseResults = await fetchResultsFromSupabase(examId);
    if (supabaseResults.length > 0) {
      let changed = false;
      for (const sr of supabaseResults) {
        const idx = results.findIndex(r => r.id === sr.id);
        if (idx >= 0) {
          results[idx] = { ...results[idx], ...sr };
          changed = true;
        } else {
          results.push(sr as ExamResult);
          changed = true;
        }
      }
      if (changed) setStorage('exam_results', results);
    }

    const participants = await this.getExamParticipants(examId);

    return results
      .filter(r => r.exam_id === examId)
      .map(r => ({
        ...r,
        participant: participants.find(p => p.id === r.participant_id) || r.participant
      }));
  }

  // Remedial Exam Generator
  async createRemedialExam(originalExamId: string): Promise<Exam> {
    const originalExam = await this.getExamById(originalExamId);
    if (!originalExam) throw new Error('Original exam not found');

    const results = await this.getExamResults(originalExamId);
    const failedParticipants = results.filter(r => !r.passed);

    const remedialExamTitle = `Remedial: ${originalExam.title}`;
    const remedialExam: Exam = {
      id: 'exam-rem-' + Date.now(),
      title: remedialExamTitle,
      assessment_type_id: 'eval-05', // Remedial
      subject_id: originalExam.subject_id,
      class_id: originalExam.class_id,
      teacher_id: originalExam.teacher_id,
      academic_year: originalExam.academic_year,
      semester: originalExam.semester,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      duration_minutes: originalExam.duration_minutes,
      question_count: originalExam.question_count,
      kkm: originalExam.kkm,
      randomize_questions: true,
      randomize_options: true,
      allow_backward: true,
      fullscreen_mode: true,
      single_attempt: true,
      show_results_immediately: true,
      show_explanation: true,
      pin_code: 'REM' + Math.floor(100 + Math.random() * 900),
      status: 'active',
      questions: originalExam.questions
    };

    await this.saveExam(remedialExam);

    // Register only failed participants
    const participants = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
    failedParticipants.forEach(fp => {
      if (fp.participant?.student_id) {
        participants.push({
          id: 'part-rem-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          exam_id: remedialExam.id,
          student_id: fp.participant.student_id,
          status: 'not_started',
          tab_switch_count: 0,
          cheat_warning_count: 0,
          remaining_seconds: remedialExam.duration_minutes * 60,
          student: fp.participant.student,
          exam: remedialExam
        });
      }
    });

    setStorage('participants', participants);
    this.logAudit('CREATE_REMEDIAL_EXAM', 'exam', remedialExam.id, {
      original_exam: originalExam.title,
      participant_count: failedParticipants.length
    });

    return remedialExam;
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return getStorage<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }

  async logAudit(action: string, entityType: string, entityId?: string, details: Record<string, any> = {}): Promise<void> {
    const logs = await this.getAuditLogs();
    const newLog: AuditLog = {
      id: 'audit-' + Date.now(),
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    setStorage('audit_logs', logs);
  }
}

// Auto-purge: hanya bersihkan sesi ujian yang tidak selesai dari hari SEBELUMNYA.
// TIDAK pernah menghapus data yang sudah submit atau data hari ini.
(function autoPurgeOldTestData() {
  try {
    const STORAGE_PREFIX = 'mitracbt_';
    const todayStr = new Date().toDateString();
    const lastRunStr = localStorage.getItem(STORAGE_PREFIX + 'last_purge_date');

    // Hanya jalankan sekali per hari
    if (lastRunStr === todayStr) return;

    // ── 1. Participants: hapus hanya yang NOT_STARTED dari hari sebelumnya
    const rawParts = localStorage.getItem(STORAGE_PREFIX + 'participants');
    if (rawParts) {
      try {
        const parts = JSON.parse(rawParts);
        const kept = parts.filter((p: any) => {
          // Pertahankan semua yang sudah submit atau hari ini
          if (p.status === 'submitted' || p.status === 'force_submitted') return true;
          // Pertahankan jika mulai hari ini
          if (p.start_time && new Date(p.start_time).toDateString() === todayStr) return true;
          // Buang sesi tidak selesai dari hari sebelumnya
          return false;
        });
        localStorage.setItem(STORAGE_PREFIX + 'participants', JSON.stringify(kept));
      } catch (_) {}
    }

    // ── 2. Exam results: jangan hapus sama sekali — tetap pertahankan semua hasil
    // (exam_results hanya berisi data yang sudah final/graded, tidak perlu dibersihkan)

    // ── 3. Answers: hapus hanya jawaban dari sesi in_progress yang sudah dibuang
    const rawAnswers = localStorage.getItem(STORAGE_PREFIX + 'answers');
    if (rawAnswers) {
      try {
        const answers = JSON.parse(rawAnswers);
        const rawPartsKept = localStorage.getItem(STORAGE_PREFIX + 'participants');
        const keptPartIds = new Set(
          (rawPartsKept ? JSON.parse(rawPartsKept) : []).map((p: any) => p.id)
        );
        const keptAnswers = answers.filter((a: any) => keptPartIds.has(a.participant_id));
        localStorage.setItem(STORAGE_PREFIX + 'answers', JSON.stringify(keptAnswers));
      } catch (_) {}
    }

    // ── 4. Events: pertahankan semua events hari ini, hapus yang terlalu lama (> 7 hari)
    const rawEvents = localStorage.getItem(STORAGE_PREFIX + 'events');
    if (rawEvents) {
      try {
        const events = JSON.parse(rawEvents);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const keptEvents = events.filter((ev: any) =>
          !ev.created_at || new Date(ev.created_at).getTime() >= sevenDaysAgo
        );
        localStorage.setItem(STORAGE_PREFIX + 'events', JSON.stringify(keptEvents));
      } catch (_) {}
    }

    localStorage.setItem(STORAGE_PREFIX + 'last_purge_date', todayStr);
    console.log('[MitraExam] Daily purge: cleaned up stale sessions from previous days.');
  } catch (e) {
    console.error('Auto purge failed', e);
  }
})();

export const db = new DBService();
