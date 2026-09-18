import {
  Profile, ClassRoom, Teacher, Student, Subject, SubjectMaterial,
  AssessmentType, QuestionBank, Question, QuestionOption, Exam, ExamParticipant, ExamParticipantStatus,
  Answer, ExamEvent, ExamResult, AuditLog
} from '../types';
import { supabase } from './supabaseClient';

function requireClient() {
  if (!supabase) {
    throw new Error(
      'Supabase belum dikonfigurasi. Cek VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di file .env.'
    );
  }
  return supabase;
}

// ─── Row → App-type mappers ────────────────────────────────────────────────

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    avatar_url: row.avatar_url || undefined,
    phone: row.phone || undefined,
    created_at: row.created_at
  };
}

function mapClass(row: any): ClassRoom {
  return { id: row.id, name: row.name, grade: row.grade, major: row.major, academic_year: row.academic_year };
}

function mapSubject(row: any): Subject {
  return { id: row.id, name: row.name, code: row.code, major: row.major || undefined, description: row.description || undefined };
}

function mapMaterial(row: any): SubjectMaterial {
  return { id: row.id, subject_id: row.subject_id, name: row.name, order_index: row.order_index };
}

function mapAssessmentType(row: any): AssessmentType {
  return { id: row.id, name: row.name, code: row.code, description: row.description || undefined, is_default: !!row.is_default };
}

function mapBankRow(row: any): QuestionBank {
  return {
    id: row.id,
    teacher_id: row.teacher_id || undefined,
    subject_id: row.subject_id,
    title: row.title,
    description: row.description || undefined,
    target_grades: row.target_grades || undefined,
    created_at: row.created_at,
    subject: row.subject ? mapSubject(row.subject) : undefined
  };
}

function mapOption(row: any): QuestionOption {
  return {
    id: row.id,
    question_id: row.question_id || undefined,
    option_label: row.option_label,
    content: row.content,
    image_url: row.image_url || undefined,
    is_correct: !!row.is_correct,
    order_index: row.order_index ?? undefined
  };
}

function mapQuestion(row: any): Question {
  const options = (row.options || row.question_options || [])
    .slice()
    .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map(mapOption);
  return {
    id: row.id,
    bank_id: row.bank_id,
    material_id: row.material_id || undefined,
    target_grades: row.target_grades || undefined,
    question_type: row.question_type,
    content: row.content,
    image_url: row.image_url || undefined,
    explanation: row.explanation || undefined,
    weight: Number(row.weight),
    difficulty: row.difficulty,
    competency: row.competency || undefined,
    creator_id: row.creator_id || undefined,
    created_at: row.created_at,
    options
  };
}

function mapStudent(row: any): Student {
  return {
    id: row.id,
    profile_id: row.profile_id,
    nis: row.nis,
    nisn: row.nisn || undefined,
    class_id: row.class_id,
    status: row.status,
    profile: row.profile ? mapProfile(row.profile) : undefined,
    class: row.class ? mapClass(row.class) : undefined
  };
}

function mapExam(row: any): Exam {
  const questions = (row.exam_questions || [])
    .slice()
    .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((eq: any) => eq.question)
    .filter(Boolean)
    .map(mapQuestion);

  return {
    id: row.id,
    title: row.title,
    assessment_type_id: row.assessment_type_id,
    subject_id: row.subject_id,
    class_id: row.class_id,
    teacher_id: row.teacher_id || undefined,
    academic_year: row.academic_year,
    semester: row.semester,
    start_time: row.start_time,
    end_time: row.end_time,
    duration_minutes: row.duration_minutes,
    question_count: row.question_count,
    kkm: Number(row.kkm),
    randomize_questions: row.randomize_questions,
    randomize_options: row.randomize_options,
    allow_backward: row.allow_backward,
    fullscreen_mode: row.fullscreen_mode,
    single_attempt: row.single_attempt,
    show_results_immediately: row.show_results_immediately,
    show_explanation: row.show_explanation,
    pin_code: row.pin_code,
    status: row.status,
    assessment_type: row.assessment_type ? mapAssessmentType(row.assessment_type) : undefined,
    subject: row.subject ? mapSubject(row.subject) : undefined,
    class: row.class ? mapClass(row.class) : undefined,
    questions
  };
}

function mapParticipant(row: any, exam?: Exam): ExamParticipant {
  return {
    id: row.id,
    exam_id: row.exam_id,
    student_id: row.student_id,
    start_time: row.start_time || undefined,
    finish_time: row.finish_time || undefined,
    server_deadline: row.server_deadline || undefined,
    remaining_seconds: row.remaining_seconds ?? undefined,
    status: row.status,
    score: row.score ?? undefined,
    passed: row.passed ?? undefined,
    tab_switch_count: row.tab_switch_count,
    cheat_warning_count: row.cheat_warning_count,
    student: row.student ? mapStudent(row.student) : undefined,
    exam
  };
}

function mapAnswer(row: any): Answer {
  return {
    id: row.id,
    participant_id: row.participant_id,
    question_id: row.question_id,
    selected_option_ids: row.selected_option_ids || [],
    text_answer: row.text_answer || undefined,
    is_marked_review: !!row.is_marked_review,
    is_correct: row.is_correct ?? undefined,
    points_earned: row.points_earned ?? undefined,
    saved_at: row.saved_at
  };
}

function mapEvent(row: any, participantNameOverride?: string): ExamEvent {
  const joinedName = row.participant?.student?.profile?.full_name;
  return {
    id: row.id,
    exam_id: row.exam_id,
    participant_id: row.participant_id,
    event_type: row.event_type,
    details: row.details || {},
    created_at: row.created_at,
    participant_name: participantNameOverride || joinedName || undefined
  };
}

const PARTICIPANT_SELECT = '*, student:students(*, profile:profiles(*), class:classes(*))';
const EXAM_SELECT = '*, assessment_type:assessment_types(*), subject:subjects(*), class:classes(*), exam_questions(order_index, question:questions(*, options:question_options(*)))';
const RESULT_SELECT = `*, participant:exam_participants(${PARTICIPANT_SELECT})`;

// ─── Realtime broadcast (cross-device live monitoring) ─────────────────────

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
        realtimeChannel.send({ type: 'broadcast', event, payload }).catch(() => {});
      } catch (err) {
        // Broadcast fail safe
      }
    }
  }
}

export const realtimeBus = new EventBus();

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
        if (payload) realtimeBus.emit('participant_updated', payload, false);
      })
      .on('broadcast', { event: 'event_logged' }, ({ payload }: any) => {
        if (payload) realtimeBus.emit('event_logged', payload, false);
      })
      .on('broadcast', { event: 'ping_active_students' }, ({ payload }: any) => {
        realtimeBus.emit('ping_active_students', payload, false);
      })
      .on('broadcast', { event: 'exam_updated' }, ({ payload }: any) => {
        if (payload) realtimeBus.emit('exams_updated', payload, false);
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
    const client = requireClient();
    const { data, error } = await client.from('profiles').select('*');
    if (error) throw error;
    return (data || []).map(mapProfile);
  }

  async getProfileById(id: string): Promise<Profile | undefined> {
    const client = requireClient();
    const { data, error } = await client.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data) : undefined;
  }

  // Classes
  async getClasses(): Promise<ClassRoom[]> {
    const client = requireClient();
    const { data, error } = await client.from('classes').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapClass);
  }

  async addClass(cls: Omit<ClassRoom, 'id'>): Promise<ClassRoom> {
    const client = requireClient();
    const { data, error } = await client
      .from('classes')
      .insert({ name: cls.name, grade: cls.grade, major: cls.major, academic_year: cls.academic_year })
      .select()
      .single();
    if (error) throw error;
    this.logAudit('CREATE_CLASS', 'class', data.id, { name: data.name });
    return mapClass(data);
  }

  // Students & Teachers
  async getStudents(): Promise<Student[]> {
    const client = requireClient();
    const { data, error } = await client
      .from('students')
      .select('*, profile:profiles(*), class:classes(*)')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapStudent);
  }

  async getTeachers(): Promise<Teacher[]> {
    const client = requireClient();
    const { data, error } = await client.from('teachers').select('*, profile:profiles(*)');
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      profile_id: row.profile_id,
      nip: row.nip || undefined,
      subject_specialty: row.subject_specialty || undefined,
      profile: row.profile ? mapProfile(row.profile) : undefined
    }));
  }

  /**
   * Batch-import siswa dari hasil parsing Excel. Siswa yang NISN-nya sudah
   * ada di database akan dilewati (tidak duplikat).
   */
  async importStudents(rows: import('../utils/excelImport').StudentImportRow[]): Promise<number> {
    const client = requireClient();

    const { data: existing, error: exErr } = await client.from('students').select('nisn');
    if (exErr) throw exErr;
    const existingNisns = new Set((existing || []).map((s: any) => s.nisn));

    const validRows = rows.filter(r => r.valid && r.class_id && !existingNisns.has(r.nisn));
    if (validRows.length === 0) return 0;

    const profileRows = validRows.map(r => ({
      email: `${r.nisn}@siswa.mitracbt.id`,
      full_name: r.full_name,
      role: 'siswa' as const
    }));
    const { data: insertedProfiles, error: pErr } = await client
      .from('profiles')
      .insert(profileRows)
      .select('id, email');
    if (pErr) throw pErr;

    const emailToProfileId = new Map((insertedProfiles || []).map((p: any) => [p.email, p.id]));
    const studentRows = validRows.map(r => ({
      profile_id: emailToProfileId.get(`${r.nisn}@siswa.mitracbt.id`),
      nis: r.nis || r.nisn,
      nisn: r.nisn,
      class_id: r.class_id,
      status: 'active' as const
    }));
    const { error: sErr } = await client.from('students').insert(studentRows);
    if (sErr) throw sErr;

    this.logAudit('IMPORT_STUDENTS', 'student', undefined, {
      count: studentRows.length,
      classes: [...new Set(studentRows.map(s => s.class_id))]
    });

    return studentRows.length;
  }

  async deleteStudent(studentId: string): Promise<void> {
    const client = requireClient();
    const { data: student } = await client.from('students').select('profile_id').eq('id', studentId).maybeSingle();
    if (student?.profile_id) {
      // Deleting the profile cascades to students/exam_participants/answers/exam_events/exam_results.
      const { error } = await client.from('profiles').delete().eq('id', student.profile_id);
      if (error) throw error;
    } else {
      const { error } = await client.from('students').delete().eq('id', studentId);
      if (error) throw error;
    }
    this.logAudit('DELETE_STUDENT', 'student', studentId, {});
  }

  /** Cari siswa via NISN/NIS untuk alur login QR/tamu; buat profile+student baru jika belum ada. */
  async findOrCreateStudentByNisn(nisn: string, displayName?: string, classId?: string): Promise<Student> {
    const client = requireClient();
    const cleanNisn = nisn.trim();
    const selectStr = '*, profile:profiles(*), class:classes(*)';

    let { data: row } = await client.from('students').select(selectStr).eq('nisn', cleanNisn).maybeSingle();
    if (!row) {
      ({ data: row } = await client.from('students').select(selectStr).eq('nis', cleanNisn).maybeSingle());
    }

    if (row) {
      const student = mapStudent(row);
      if (classId && classId !== student.class_id) {
        await client.from('students').update({ class_id: classId }).eq('id', student.id);
        student.class_id = classId;
      }
      if (displayName && student.profile_id) {
        await client.from('profiles').update({ full_name: displayName }).eq('id', student.profile_id);
        if (student.profile) student.profile = { ...student.profile, full_name: displayName };
      }
      if (classId) {
        const { data: cls } = await client.from('classes').select('*').eq('id', classId).maybeSingle();
        if (cls) student.class = mapClass(cls);
      }
      return student;
    }

    const resolvedName = displayName || `Siswa (${cleanNisn})`;
    const { data: newProfile, error: pErr } = await client
      .from('profiles')
      .insert({ email: `${cleanNisn}@siswa.mitracbt.id`, full_name: resolvedName, role: 'siswa' })
      .select()
      .single();
    if (pErr) throw pErr;

    const { data: newStudentRow, error: sErr } = await client
      .from('students')
      .insert({
        profile_id: newProfile.id,
        nis: cleanNisn,
        nisn: cleanNisn,
        class_id: classId || null,
        status: 'active'
      })
      .select(selectStr)
      .single();
    if (sErr) throw sErr;

    return mapStudent(newStudentRow);
  }

  // Update teacher profile & teacher record
  async updateTeacher(
    teacherId: string,
    data: { full_name: string; email: string; nip: string; subject_specialty: string; phone?: string }
  ): Promise<void> {
    const client = requireClient();
    const { data: teacherRow, error: tErr } = await client
      .from('teachers')
      .select('profile_id')
      .eq('id', teacherId)
      .maybeSingle();
    if (tErr) throw tErr;
    if (!teacherRow) throw new Error('Guru tidak ditemukan');

    const { error: upErr } = await client
      .from('teachers')
      .update({ nip: data.nip, subject_specialty: data.subject_specialty })
      .eq('id', teacherId);
    if (upErr) throw upErr;

    const { error: pErr } = await client
      .from('profiles')
      .update({ full_name: data.full_name, email: data.email, phone: data.phone || null })
      .eq('id', teacherRow.profile_id);
    if (pErr) throw pErr;

    this.logAudit('UPDATE_TEACHER', 'teacher', teacherId, { name: data.full_name });
  }

  // Subjects & Materials
  async getSubjects(): Promise<Subject[]> {
    const client = requireClient();
    const { data, error } = await client.from('subjects').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapSubject);
  }

  async addSubject(subj: Omit<Subject, 'id'>): Promise<Subject> {
    const client = requireClient();
    const { data, error } = await client
      .from('subjects')
      .insert({ name: subj.name, code: subj.code, major: subj.major || null, description: subj.description || null })
      .select()
      .single();
    if (error) throw error;
    this.logAudit('CREATE_SUBJECT', 'subject', data.id, { name: data.name });
    return mapSubject(data);
  }

  async getMaterials(subjectId?: string): Promise<SubjectMaterial[]> {
    const client = requireClient();
    let query = client.from('subject_materials').select('*').order('order_index', { ascending: true });
    if (subjectId) query = query.eq('subject_id', subjectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapMaterial);
  }

  async addMaterial(mat: Omit<SubjectMaterial, 'id'>): Promise<SubjectMaterial> {
    const client = requireClient();
    const { data, error } = await client
      .from('subject_materials')
      .insert({ subject_id: mat.subject_id, name: mat.name, order_index: mat.order_index })
      .select()
      .single();
    if (error) throw error;
    return mapMaterial(data);
  }

  // Assessment Types
  async getAssessmentTypes(): Promise<AssessmentType[]> {
    const client = requireClient();
    const { data, error } = await client.from('assessment_types').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapAssessmentType);
  }

  async addAssessmentType(item: Omit<AssessmentType, 'id'>): Promise<AssessmentType> {
    const client = requireClient();
    const { data, error } = await client
      .from('assessment_types')
      .insert({ name: item.name, code: item.code, description: item.description || null, is_default: item.is_default ?? false })
      .select()
      .single();
    if (error) throw error;
    this.logAudit('CREATE_ASSESSMENT_TYPE', 'assessment_type', data.id, { code: data.code });
    return mapAssessmentType(data);
  }

  // Question Banks
  async getQuestionBanks(): Promise<QuestionBank[]> {
    const client = requireClient();
    const [{ data: banks, error }, { data: qCounts, error: qErr }] = await Promise.all([
      client.from('question_banks').select('*, subject:subjects(*)').order('created_at', { ascending: true }),
      client.from('questions').select('bank_id')
    ]);
    if (error) throw error;
    if (qErr) throw qErr;

    const countMap = new Map<string, number>();
    (qCounts || []).forEach((q: any) => countMap.set(q.bank_id, (countMap.get(q.bank_id) || 0) + 1));

    return (banks || []).map((b: any) => ({ ...mapBankRow(b), question_count: countMap.get(b.id) || 0 }));
  }

  async addQuestionBank(bank: Omit<QuestionBank, 'id' | 'created_at'>): Promise<QuestionBank> {
    const client = requireClient();
    let teacherId = bank.teacher_id;
    if (!teacherId) {
      const { data } = await client.from('teachers').select('id').limit(1).maybeSingle();
      teacherId = data?.id;
    }
    const { data, error } = await client
      .from('question_banks')
      .insert({
        teacher_id: teacherId || null,
        subject_id: bank.subject_id,
        title: bank.title,
        description: bank.description || null,
        target_grades: bank.target_grades || []
      })
      .select('*, subject:subjects(*)')
      .single();
    if (error) throw error;
    this.logAudit('CREATE_QUESTION_BANK', 'question_bank', data.id, { title: data.title });
    return { ...mapBankRow(data), question_count: 0 };
  }

  async updateQuestionBank(bank: QuestionBank): Promise<QuestionBank> {
    const client = requireClient();
    const { data, error } = await client
      .from('question_banks')
      .update({
        subject_id: bank.subject_id,
        title: bank.title,
        description: bank.description || null,
        target_grades: bank.target_grades || []
      })
      .eq('id', bank.id)
      .select('*, subject:subjects(*)')
      .single();
    if (error) throw error;
    this.logAudit('UPDATE_QUESTION_BANK', 'question_bank', bank.id, { title: bank.title });
    const questions = await this.getQuestions(bank.id);
    return { ...mapBankRow(data), question_count: questions.length };
  }

  async deleteQuestionBank(bankId: string): Promise<void> {
    const client = requireClient();
    // Questions & their options cascade automatically via FK ON DELETE CASCADE.
    const { error } = await client.from('question_banks').delete().eq('id', bankId);
    if (error) throw error;
    this.logAudit('DELETE_QUESTION_BANK', 'question_bank', bankId, {});
  }

  // Questions
  async getQuestions(bankId?: string): Promise<Question[]> {
    const client = requireClient();
    let query = client.from('questions').select('*, options:question_options(*)').order('created_at', { ascending: true });
    if (bankId) query = query.eq('bank_id', bankId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapQuestion);
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const client = requireClient();
    const { data, error } = await client
      .from('questions')
      .select('*, options:question_options(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapQuestion(data) : undefined;
  }

  async saveQuestion(q: Omit<Question, 'id' | 'created_at'> & { id?: string }): Promise<Question> {
    const client = requireClient();
    const baseRow = {
      bank_id: q.bank_id,
      material_id: q.material_id || null,
      target_grades: q.target_grades || [],
      question_type: q.question_type,
      content: q.content,
      image_url: q.image_url || null,
      explanation: q.explanation || null,
      weight: q.weight,
      difficulty: q.difficulty,
      competency: q.competency || null,
      creator_id: q.creator_id || null
    };

    let questionId = q.id;
    if (questionId) {
      const { error } = await client.from('questions').update(baseRow).eq('id', questionId);
      if (error) throw error;
      this.logAudit('EDIT_QUESTION', 'question', questionId, { type: q.question_type });
    } else {
      const { data, error } = await client.from('questions').insert(baseRow).select('id').single();
      if (error) throw error;
      questionId = data.id;
      this.logAudit('CREATE_QUESTION', 'question', questionId, { type: q.question_type });
    }

    // Replace options wholesale — simplest way to keep them in sync with the editor.
    await client.from('question_options').delete().eq('question_id', questionId);
    if (q.options && q.options.length > 0) {
      const optionRows = q.options.map((o, i) => ({
        question_id: questionId,
        option_label: o.option_label,
        content: o.content,
        image_url: o.image_url || null,
        is_correct: !!o.is_correct,
        order_index: o.order_index ?? i + 1
      }));
      const { error: optErr } = await client.from('question_options').insert(optionRows);
      if (optErr) throw optErr;
    }

    const saved = await this.getQuestionById(questionId!);
    return saved!;
  }

  async deleteQuestion(id: string): Promise<void> {
    const client = requireClient();
    // Options & exam_questions references cascade automatically via FK.
    const { error } = await client.from('questions').delete().eq('id', id);
    if (error) throw error;
    this.logAudit('DELETE_QUESTION', 'question', id, {});
  }

  // Exams
  async getExams(): Promise<Exam[]> {
    const client = requireClient();
    const { data, error } = await client.from('exams').select(EXAM_SELECT).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapExam);
  }

  async getExamById(id: string): Promise<Exam | undefined> {
    const client = requireClient();
    const { data, error } = await client.from('exams').select(EXAM_SELECT).eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapExam(data) : undefined;
  }

  async saveExam(examData: Partial<Exam>): Promise<Exam> {
    const client = requireClient();
    const row: Record<string, any> = {
      title: examData.title,
      assessment_type_id: examData.assessment_type_id,
      subject_id: examData.subject_id,
      class_id: examData.class_id,
      teacher_id: examData.teacher_id || null,
      academic_year: examData.academic_year,
      semester: examData.semester,
      start_time: examData.start_time,
      end_time: examData.end_time,
      duration_minutes: examData.duration_minutes,
      question_count: examData.question_count,
      kkm: examData.kkm ?? 75,
      randomize_questions: examData.randomize_questions,
      randomize_options: examData.randomize_options,
      allow_backward: examData.allow_backward,
      fullscreen_mode: examData.fullscreen_mode,
      single_attempt: examData.single_attempt,
      show_results_immediately: examData.show_results_immediately,
      show_explanation: examData.show_explanation,
      pin_code: examData.pin_code || Math.random().toString(36).substring(2, 7).toUpperCase(),
      status: examData.status || 'active'
    };
    Object.keys(row).forEach(k => row[k] === undefined && delete row[k]);

    let examId = examData.id;
    if (examId) {
      const { error } = await client.from('exams').update(row).eq('id', examId);
      if (error) throw error;
      this.logAudit('EDIT_EXAM', 'exam', examId, { title: row.title });
    } else {
      const { data, error } = await client.from('exams').insert(row).select('id').single();
      if (error) throw error;
      examId = data.id;
      this.logAudit('CREATE_EXAM', 'exam', examId, { title: row.title, pin: row.pin_code });
    }

    if (examData.questions) {
      await client.from('exam_questions').delete().eq('exam_id', examId);
      if (examData.questions.length > 0) {
        const junctionRows = examData.questions.map((q, i) => ({
          exam_id: examId,
          question_id: q.id,
          order_index: i
        }));
        const { error: jErr } = await client.from('exam_questions').insert(junctionRows);
        if (jErr) throw jErr;
      }
    }

    const saved = await this.getExamById(examId!);
    realtimeBus.emit('exams_updated', saved);
    return saved!;
  }

  async deleteExam(id: string): Promise<void> {
    const client = requireClient();
    // Participants/answers/events/results cascade automatically via FK.
    const { error } = await client.from('exams').delete().eq('id', id);
    if (error) throw error;
    this.logAudit('DELETE_EXAM', 'exam', id, {});
    realtimeBus.emit('exams_updated', { id, deleted: true });
  }

  // Participants & Sessions
  async getExamParticipants(examId: string): Promise<ExamParticipant[]> {
    const client = requireClient();
    const { data, error } = await client
      .from('exam_participants')
      .select(PARTICIPANT_SELECT)
      .eq('exam_id', examId);
    if (error) throw error;
    const exam = await this.getExamById(examId);
    return (data || []).map((row: any) => mapParticipant(row, exam));
  }

  async getParticipantSession(examId: string, studentId: string): Promise<ExamParticipant> {
    const client = requireClient();
    const { data: existing, error } = await client
      .from('exam_participants')
      .select(PARTICIPANT_SELECT)
      .eq('exam_id', examId)
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;

    const exam = await this.getExamById(examId);
    if (existing) return mapParticipant(existing, exam);

    const { data: created, error: cErr } = await client
      .from('exam_participants')
      .insert({
        exam_id: examId,
        student_id: studentId,
        status: 'not_started',
        tab_switch_count: 0,
        cheat_warning_count: 0,
        remaining_seconds: (exam?.duration_minutes || 90) * 60
      })
      .select(PARTICIPANT_SELECT)
      .single();
    if (cErr) throw cErr;
    return mapParticipant(created, exam);
  }

  async updateParticipantSession(participantId: string, updates: Partial<ExamParticipant>): Promise<ExamParticipant> {
    const client = requireClient();
    const row: Record<string, any> = {
      status: updates.status,
      start_time: updates.start_time,
      finish_time: updates.finish_time,
      remaining_seconds: updates.remaining_seconds,
      score: updates.score,
      passed: updates.passed,
      tab_switch_count: updates.tab_switch_count,
      cheat_warning_count: updates.cheat_warning_count
    };
    Object.keys(row).forEach(k => row[k] === undefined && delete row[k]);

    const { data, error } = await client
      .from('exam_participants')
      .update(row)
      .eq('id', participantId)
      .select(PARTICIPANT_SELECT)
      .single();
    if (error) throw error;

    const updated = mapParticipant(data);
    realtimeBus.emit('participant_updated', updated);
    return updated;
  }

  /** Riwayat semua percobaan ujian seorang siswa — dipakai fitur "Reset Ujian" di Manajemen Pengguna. */
  async getStudentExamAttempts(studentId: string): Promise<{
    participantId: string;
    examId: string;
    examTitle: string;
    status: ExamParticipantStatus;
    score?: number;
    tab_switch_count: number;
    cheat_warning_count: number;
  }[]> {
    const client = requireClient();
    const { data, error } = await client
      .from('exam_participants')
      .select('id, exam_id, status, score, tab_switch_count, cheat_warning_count, exam:exams(title)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      participantId: row.id,
      examId: row.exam_id,
      examTitle: row.exam?.title || 'Ujian',
      status: row.status,
      score: row.score ?? undefined,
      tab_switch_count: row.tab_switch_count,
      cheat_warning_count: row.cheat_warning_count
    }));
  }

  /**
   * Reset satu sesi ujian siswa ke kondisi awal (belum mulai) supaya bisa
   * mengerjakan ulang — menghapus jawaban, log pelanggaran, dan hasil lama
   * sesi tersebut. Dipakai saat force-submit terjadi karena false-positive
   * (mis. deteksi tab-switch keliru saat proses login/scan QR).
   */
  async resetParticipantSession(participantId: string): Promise<void> {
    const client = requireClient();
    const { data: p, error: pErr } = await client
      .from('exam_participants')
      .select('exam_id')
      .eq('id', participantId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!p) throw new Error('Sesi peserta tidak ditemukan');

    const exam = await this.getExamById(p.exam_id);
    const remainingSeconds = (exam?.duration_minutes || 90) * 60;

    await client.from('answers').delete().eq('participant_id', participantId);
    await client.from('exam_events').delete().eq('participant_id', participantId);
    await client.from('exam_results').delete().eq('participant_id', participantId);

    const { error } = await client
      .from('exam_participants')
      .update({
        status: 'not_started',
        start_time: null,
        finish_time: null,
        score: 0,
        passed: false,
        tab_switch_count: 0,
        cheat_warning_count: 0,
        remaining_seconds: remainingSeconds
      })
      .eq('id', participantId);
    if (error) throw error;

    this.logAudit('RESET_PARTICIPANT_SESSION', 'exam_participant', participantId, {});
    realtimeBus.emit('participant_updated', { id: participantId, status: 'not_started' });
  }

  // Answers & Auto-save
  async getAnswers(participantId: string): Promise<Answer[]> {
    const client = requireClient();
    const { data, error } = await client.from('answers').select('*').eq('participant_id', participantId);
    if (error) throw error;
    return (data || []).map(mapAnswer);
  }

  async saveAnswer(answerData: Omit<Answer, 'id' | 'saved_at'>): Promise<Answer> {
    const client = requireClient();
    const row = {
      participant_id: answerData.participant_id,
      question_id: answerData.question_id,
      selected_option_ids: answerData.selected_option_ids || [],
      text_answer: answerData.text_answer || null,
      is_marked_review: answerData.is_marked_review ?? false
    };
    const { data, error } = await client
      .from('answers')
      .upsert(row, { onConflict: 'participant_id,question_id' })
      .select()
      .single();
    if (error) throw error;

    const { data: participant } = await client
      .from('exam_participants')
      .select('id, status')
      .eq('id', answerData.participant_id)
      .maybeSingle();
    if (participant && participant.status === 'not_started') {
      const { data: updated } = await client
        .from('exam_participants')
        .update({ status: 'in_progress', start_time: new Date().toISOString() })
        .eq('id', answerData.participant_id)
        .select(PARTICIPANT_SELECT)
        .single();
      if (updated) realtimeBus.emit('participant_updated', mapParticipant(updated));
    }

    return mapAnswer(data);
  }

  // Exam Events & Anti-cheating
  async logEvent(
    examId: string,
    participantId: string,
    eventType: ExamEvent['event_type'],
    details: Record<string, any> = {},
    participantName?: string
  ): Promise<ExamEvent> {
    const client = requireClient();
    const { data, error } = await client
      .from('exam_events')
      .insert({ exam_id: examId, participant_id: participantId, event_type: eventType, details })
      .select()
      .single();
    if (error) throw error;

    const newEvent = mapEvent(data, participantName);

    if (
      eventType === 'TAB_SWITCH' ||
      eventType === 'FULLSCREEN_EXIT' ||
      eventType === 'MULTI_SCREEN_SPLIT' ||
      eventType === 'VOICE_AI_DETECTED'
    ) {
      const { data: p } = await client
        .from('exam_participants')
        .select('tab_switch_count, cheat_warning_count')
        .eq('id', participantId)
        .maybeSingle();
      if (p) {
        const { data: updated } = await client
          .from('exam_participants')
          .update({
            tab_switch_count: (p.tab_switch_count || 0) + 1,
            cheat_warning_count: (p.cheat_warning_count || 0) + 1
          })
          .eq('id', participantId)
          .select(PARTICIPANT_SELECT)
          .single();
        if (updated) realtimeBus.emit('participant_updated', mapParticipant(updated));
      }
    }

    realtimeBus.emit('event_logged', newEvent);
    return newEvent;
  }

  async getEvents(examId: string): Promise<ExamEvent[]> {
    const client = requireClient();
    const { data, error } = await client
      .from('exam_events')
      .select(`*, participant:exam_participants(student:students(profile:profiles(full_name)))`)
      .eq('exam_id', examId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r: any) => mapEvent(r));
  }

  async getAllEvents(): Promise<ExamEvent[]> {
    const client = requireClient();
    const { data, error } = await client
      .from('exam_events')
      .select(`*, participant:exam_participants(student:students(profile:profiles(full_name)))`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r: any) => mapEvent(r));
  }

  // Grading & Submitting Exam
  async submitExam(participantId: string, status?: ExamParticipantStatus): Promise<ExamResult> {
    const client = requireClient();
    const { data: pRow, error: pErr } = await client
      .from('exam_participants')
      .select(PARTICIPANT_SELECT)
      .eq('id', participantId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!pRow) throw new Error('Participant not found');

    const exam = await this.getExamById(pRow.exam_id);
    if (!exam) throw new Error('Exam not found');

    const questions = exam.questions && exam.questions.length > 0 ? exam.questions : await this.getQuestions();
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
    const finalStatus = status || 'submitted';

    const { data: updatedP, error: upErr } = await client
      .from('exam_participants')
      .update({ status: finalStatus, finish_time: new Date().toISOString(), score: finalScore, passed })
      .eq('id', participantId)
      .select(PARTICIPANT_SELECT)
      .single();
    if (upErr) throw upErr;

    const participant = mapParticipant(updatedP, exam);

    const { data: resultRow, error: rErr } = await client
      .from('exam_results')
      .upsert(
        {
          exam_id: exam.id,
          participant_id: participantId,
          total_score: finalScore,
          max_possible_score: 100,
          percentage: finalScore,
          correct_count: correctCount,
          wrong_count: wrongCount,
          unattempted_count: unattemptedCount,
          passed
        },
        { onConflict: 'participant_id' }
      )
      .select()
      .single();
    if (rErr) throw rErr;

    const newResult: ExamResult = {
      id: resultRow.id,
      exam_id: resultRow.exam_id,
      participant_id: resultRow.participant_id,
      total_score: Number(resultRow.total_score),
      max_possible_score: Number(resultRow.max_possible_score),
      percentage: Number(resultRow.percentage),
      correct_count: resultRow.correct_count,
      wrong_count: resultRow.wrong_count,
      unattempted_count: resultRow.unattempted_count,
      passed: resultRow.passed,
      graded_at: resultRow.graded_at,
      participant
    };

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
    const client = requireClient();
    const { data, error } = await client.from('exam_results').select(RESULT_SELECT).eq('exam_id', examId);
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      exam_id: row.exam_id,
      participant_id: row.participant_id,
      total_score: Number(row.total_score),
      max_possible_score: Number(row.max_possible_score),
      percentage: Number(row.percentage),
      correct_count: row.correct_count,
      wrong_count: row.wrong_count,
      unattempted_count: row.unattempted_count,
      passed: row.passed,
      graded_at: row.graded_at,
      participant: row.participant ? mapParticipant(row.participant) : undefined
    }));
  }

  // Remedial Exam Generator
  async createRemedialExam(originalExamId: string): Promise<Exam> {
    const client = requireClient();
    const originalExam = await this.getExamById(originalExamId);
    if (!originalExam) throw new Error('Original exam not found');

    const results = await this.getExamResults(originalExamId);
    const failedParticipants = results.filter(r => !r.passed);

    const assessmentTypes = await this.getAssessmentTypes();
    const remedialType = assessmentTypes.find(t => t.code === 'REMEDIAL');

    const remedialExam = await this.saveExam({
      title: `Remedial: ${originalExam.title}`,
      assessment_type_id: remedialType?.id || originalExam.assessment_type_id,
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
    });

    const participantRows = failedParticipants
      .filter(fp => fp.participant?.student_id)
      .map(fp => ({
        exam_id: remedialExam.id,
        student_id: fp.participant!.student_id,
        status: 'not_started' as const,
        tab_switch_count: 0,
        cheat_warning_count: 0,
        remaining_seconds: remedialExam.duration_minutes * 60
      }));
    if (participantRows.length > 0) {
      const { error } = await client.from('exam_participants').insert(participantRows);
      if (error) throw error;
    }

    this.logAudit('CREATE_REMEDIAL_EXAM', 'exam', remedialExam.id, {
      original_exam: originalExam.title,
      participant_count: failedParticipants.length
    });

    return remedialExam;
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const client = requireClient();
    const { data, error } = await client.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id || undefined,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id || undefined,
      details: row.details || {},
      created_at: row.created_at
    }));
  }

  async logAudit(action: string, entityType: string, entityId?: string, details: Record<string, any> = {}): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('audit_logs')
      .insert({ action, entity_type: entityType, entity_id: entityId || null, details });
    if (error) console.warn('[MitraExam] logAudit failed:', error.message);
  }
}

export const db = new DBService();
