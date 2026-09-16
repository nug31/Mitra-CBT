export type Role = 'admin' | 'guru' | 'siswa';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string; // 'X', 'XI', 'XII'
  major: string; // 'Teknik Kendaraan Ringan', etc.
  academic_year: string;
}

export interface Teacher {
  id: string;
  profile_id: string;
  nip?: string;
  subject_specialty?: string;
  profile?: Profile;
}

export interface Student {
  id: string;
  profile_id: string;
  nis: string;
  nisn?: string;
  class_id: string;
  status: 'active' | 'inactive' | 'graduated';
  profile?: Profile;
  class?: ClassRoom;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  major?: string;
  description?: string;
}

export interface SubjectMaterial {
  id: string;
  subject_id: string;
  name: string;
  order_index: number;
}

export interface AssessmentType {
  id: string;
  name: string;
  code: string; // 'STS', 'SAS', 'UH', 'QUIZ', 'REMEDIAL', 'TRYOUT', 'UPT', 'EVAL'
  description?: string;
  is_default: boolean;
}

export interface QuestionBank {
  id: string;
  teacher_id?: string;
  subject_id: string;
  title: string;
  description?: string;
  target_grades?: string[]; // e.g. ['X', 'XII']
  created_at: string;
  subject?: Subject;
  question_count?: number;
}

export type QuestionType = 
  | 'pilihan_ganda' 
  | 'pg_kompleks' 
  | 'benar_salah' 
  | 'menjodohkan' 
  | 'isian_singkat';

export type DifficultyLevel = 'mudah' | 'sedang' | 'sulit';

export interface QuestionOption {
  id: string;
  question_id?: string;
  option_label: string; // 'A', 'B', 'C', 'D', 'E'
  content: string;
  image_url?: string;
  is_correct: boolean;
  order_index?: number;
}

export interface Question {
  id: string;
  bank_id: string;
  material_id?: string;
  target_grades?: string[]; // e.g. ['X', 'XII']
  question_type: QuestionType;
  content: string;
  image_url?: string;
  explanation?: string;
  weight: number;
  difficulty: DifficultyLevel;
  competency?: string;
  creator_id?: string;
  created_at: string;
  options: QuestionOption[];
}

export type ExamStatus = 'draft' | 'scheduled' | 'active' | 'finished';

export interface Exam {
  id: string;
  title: string;
  assessment_type_id: string;
  subject_id: string;
  class_id: string;
  teacher_id?: string;
  academic_year: string;
  semester: string; // 'Ganjil' | 'Genap'
  start_time: string;
  end_time: string;
  duration_minutes: number;
  question_count: number;
  kkm: number;
  // Exam Settings
  randomize_questions: boolean;
  randomize_options: boolean;
  allow_backward: boolean;
  fullscreen_mode: boolean;
  single_attempt: boolean;
  show_results_immediately: boolean;
  show_explanation: boolean;
  pin_code: string;
  status: ExamStatus;
  assessment_type?: AssessmentType;
  subject?: Subject;
  class?: ClassRoom;
  questions?: Question[];
}

export type ExamParticipantStatus = 'not_started' | 'in_progress' | 'submitted' | 'force_submitted';

export interface ExamParticipant {
  id: string;
  exam_id: string;
  student_id: string;
  start_time?: string;
  finish_time?: string;
  server_deadline?: string;
  remaining_seconds?: number;
  status: ExamParticipantStatus;
  score?: number;
  passed?: boolean;
  tab_switch_count: number;
  cheat_warning_count: number;
  student?: Student;
  exam?: Exam;
}

export interface Answer {
  id: string;
  participant_id: string;
  question_id: string;
  selected_option_ids: string[];
  text_answer?: string;
  is_marked_review: boolean;
  is_correct?: boolean;
  points_earned?: number;
  saved_at: string;
}

export type ExamEventType = 
  | 'LOGIN' 
  | 'START_EXAM' 
  | 'TAB_SWITCH' 
  | 'FULLSCREEN_EXIT' 
  | 'FULLSCREEN_ENTER' 
  | 'MULTI_SCREEN_SPLIT'
  | 'VOICE_AI_DETECTED'
  | 'REFRESH' 
  | 'CONNECTION_LOST' 
  | 'CONNECTION_RESTORED' 
  | 'SUBMIT_EXAM' 
  | 'FORCE_SUBMIT';

export interface ExamEvent {
  id: string;
  exam_id: string;
  participant_id: string;
  event_type: ExamEventType;
  details?: Record<string, any>;
  created_at: string;
  participant_name?: string;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  participant_id: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
  passed: boolean;
  graded_at: string;
  participant?: ExamParticipant;
}

export interface RemedialRelation {
  id: string;
  original_exam_id: string;
  remedial_exam_id: string;
  kkm_threshold: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
}
