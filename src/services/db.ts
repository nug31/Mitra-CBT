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
  } catch (err) {
    console.error(`Error writing storage for ${key}:`, err);
  }
}

// Event Emitter for Local Realtime Simulation
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

  emit(event: string, payload: any) {
    this.listeners.get(event)?.forEach(cb => cb(payload));
  }
}

export const realtimeBus = new EventBus();

class DBService {
  // Profiles
  async getProfiles(): Promise<Profile[]> {
    return getStorage<Profile[]>('profiles', INITIAL_PROFILES);
  }

  async getProfileById(id: string): Promise<Profile | undefined> {
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === id);
  }

  // Classes
  async getClasses(): Promise<ClassRoom[]> {
    return getStorage<ClassRoom[]>('classes', INITIAL_CLASSES);
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
    return getStorage<Student[]>('students', INITIAL_STUDENTS);
  }

  async getTeachers(): Promise<Teacher[]> {
    return getStorage<Teacher[]>('teachers', INITIAL_TEACHERS);
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
    const banks = getStorage<QuestionBank[]>('question_banks', INITIAL_QUESTION_BANKS);
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

  // Questions
  async getQuestions(bankId?: string): Promise<Question[]> {
    const questions = getStorage<Question[]>('questions', INITIAL_QUESTIONS);
    if (!bankId) return questions;
    return questions.filter(q => q.bank_id === bankId);
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
    return saved;
  }

  async deleteQuestion(id: string): Promise<void> {
    let questions = await this.getQuestions();
    questions = questions.filter(q => q.id !== id);
    setStorage('questions', questions);
    this.logAudit('DELETE_QUESTION', 'question', id, {});
  }

  // Exams
  async getExams(): Promise<Exam[]> {
    const exams = getStorage<Exam[]>('exams', INITIAL_EXAMS);
    const types = await this.getAssessmentTypes();
    const subjects = await this.getSubjects();
    const classes = await this.getClasses();
    const questions = await this.getQuestions();

    return exams.map(e => ({
      ...e,
      assessment_type: types.find(t => t.id === e.assessment_type_id),
      subject: subjects.find(s => s.id === e.subject_id),
      class: classes.find(c => c.id === e.class_id),
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
    return saved;
  }

  // Participants & Sessions
  async getExamParticipants(examId: string): Promise<ExamParticipant[]> {
    const participants = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
    const students = await this.getStudents();
    const exam = await this.getExamById(examId);

    return participants
      .filter(p => p.exam_id === examId)
      .map(p => ({
        ...p,
        student: students.find(s => s.id === p.student_id),
        exam
      }));
  }

  async getParticipantSession(examId: string, studentId: string): Promise<ExamParticipant> {
    const participants = getStorage<ExamParticipant[]>('participants', INITIAL_PARTICIPANTS);
    let session = participants.find(p => p.exam_id === examId && p.student_id === studentId);

    if (!session) {
      const students = await this.getStudents();
      const exam = await this.getExamById(examId);
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

    // If it's a tab switch or fullscreen exit, update participant counters
    if (eventType === 'TAB_SWITCH' || eventType === 'FULLSCREEN_EXIT') {
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
    const events = getStorage<ExamEvent[]>('events', INITIAL_EVENTS);
    return events.filter(e => e.exam_id === examId);
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
    const results = getStorage<ExamResult[]>('exam_results', INITIAL_EXAM_RESULTS);
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

export const db = new DBService();
