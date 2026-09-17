import { 
  Profile, ClassRoom, Teacher, Student, Subject, SubjectMaterial, 
  AssessmentType, QuestionBank, Question, Exam, ExamParticipant, 
  Answer, ExamResult, AuditLog, ExamEvent 
} from '../types';
import gtoQuestionsData from './gtoInitialQuestions.json';

export const GTO_INITIAL_QUESTIONS: Question[] = gtoQuestionsData as Question[];

// SVG Diagram Assets for Vocational SMK (Gambar Teknik & Konversi Energi Engine)
export const DIAGRAM_PROYEKSI_EROPA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="none">
  <rect width="400" height="240" fill="%23f8fafc" rx="8"/>
  <rect x="20" y="20" width="360" height="200" stroke="%230284c7" stroke-width="2" fill="white" rx="6"/>
  <text x="200" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230f172a" text-anchor="middle">STANDAR PROYEKSI ORTOGONAL (ISO)</text>
  <!-- Symbol Proyeksi Eropa: Kerucut Terpancung -->
  <circle cx="120" cy="130" r="45" stroke="%23334155" stroke-width="2" fill="none"/>
  <circle cx="120" cy="130" r="22" stroke="%23334155" stroke-width="2" stroke-dasharray="4 3" fill="none"/>
  <line x1="60" y1="130" x2="180" y2="130" stroke="%2394a3b8" stroke-dasharray="6 3"/>
  <line x1="120" y1="70" x2="120" y2="190" stroke="%2394a3b8" stroke-dasharray="6 3"/>
  
  <polygon points="210,95 210,165 310,185 310,75" stroke="%23334155" stroke-width="2" fill="%23e0f2fe"/>
  <line x1="200" y1="130" x2="330" y2="130" stroke="%2394a3b8" stroke-dasharray="6 3"/>
  <text x="120" y="205" font-family="sans-serif" font-size="12" fill="%2364748b" text-anchor="middle">Pandangan Kiri</text>
  <text x="260" y="205" font-family="sans-serif" font-size="12" fill="%2364748b" text-anchor="middle">Tampak Depan (Kuadran I)</text>
</svg>`;

export const DIAGRAM_SIKLUS_ENGINE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280" fill="none">
  <rect width="500" height="280" fill="%23f8fafc" rx="8"/>
  <text x="250" y="32" font-family="sans-serif" font-size="15" font-weight="bold" fill="%230f172a" text-anchor="middle">DIAGRAM LANGKAH KERJA MOTOR 4-LANGKAH (4-STROKE ENGINE)</text>
  
  <!-- Step 1 Hisap -->
  <g transform="translate(25, 55)">
    <rect width="100" height="170" rx="4" fill="white" stroke="%23cbd5e1" stroke-width="2"/>
    <rect x="25" y="40" width="50" height="30" fill="%2338bdf8" rx="2"/>
    <line x1="50" y1="70" x2="50" y2="120" stroke="%23334155" stroke-width="4"/>
    <circle cx="50" cy="130" r="14" stroke="%230284c7" stroke-width="3" fill="none"/>
    <path d="M50,45 L50,65" stroke="%23f43f5e" stroke-width="3"/>
    <text x="50" y="25" font-size="11" font-weight="bold" fill="%230369a1" text-anchor="middle">1. HISAP</text>
    <text x="50" y="160" font-size="10" fill="%2364748b" text-anchor="middle">TMA → TMB</text>
  </g>

  <!-- Step 2 Kompresi -->
  <g transform="translate(145, 55)">
    <rect width="100" height="170" rx="4" fill="white" stroke="%23cbd5e1" stroke-width="2"/>
    <rect x="25" y="20" width="50" height="30" fill="%2338bdf8" rx="2"/>
    <line x1="50" y1="50" x2="50" y2="105" stroke="%23334155" stroke-width="4"/>
    <circle cx="50" cy="120" r="14" stroke="%230284c7" stroke-width="3" fill="none"/>
    <text x="50" y="20" font-size="11" font-weight="bold" fill="%230369a1" text-anchor="middle">2. KOMPRESI</text>
    <text x="50" y="160" font-size="10" fill="%2364748b" text-anchor="middle">TMB → TMA</text>
  </g>

  <!-- Step 3 Usaha -->
  <g transform="translate(265, 55)">
    <rect width="100" height="170" rx="4" fill="%23fffbeb" stroke="%23f59e0b" stroke-width="2"/>
    <polygon points="50,15 45,25 55,25" fill="%23ef4444"/>
    <rect x="25" y="30" width="50" height="30" fill="%23f97316" rx="2"/>
    <line x1="50" y1="60" x2="50" y2="115" stroke="%23334155" stroke-width="4"/>
    <circle cx="50" cy="125" r="14" stroke="%23d97706" stroke-width="3" fill="none"/>
    <text x="50" y="15" font-size="11" font-weight="bold" fill="%23b45309" text-anchor="middle">3. USAHA</text>
    <text x="50" y="160" font-size="10" fill="%2364748b" text-anchor="middle">TMA → TMB (Spark)</text>
  </g>

  <!-- Step 4 Buang -->
  <g transform="translate(385, 55)">
    <rect width="100" height="170" rx="4" fill="white" stroke="%23cbd5e1" stroke-width="2"/>
    <rect x="25" y="20" width="50" height="30" fill="%2394a3b8" rx="2"/>
    <line x1="50" y1="50" x2="50" y2="105" stroke="%23334155" stroke-width="4"/>
    <circle cx="50" cy="120" r="14" stroke="%230284c7" stroke-width="3" fill="none"/>
    <text x="50" y="20" font-size="11" font-weight="bold" fill="%23475569" text-anchor="middle">4. BUANG</text>
    <text x="50" y="160" font-size="10" fill="%2364748b" text-anchor="middle">TMB → TMA</text>
  </g>
</svg>`;

export const DIAGRAM_ETIKET = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 200" fill="none">
  <rect width="440" height="200" fill="%23ffffff" stroke="%23334155" stroke-width="2"/>
  <line x1="0" y1="50" x2="440" y2="50" stroke="%23334155" stroke-width="1.5"/>
  <line x1="0" y1="100" x2="440" y2="100" stroke="%23334155" stroke-width="1.5"/>
  <line x1="0" y1="150" x2="440" y2="150" stroke="%23334155" stroke-width="1.5"/>
  <line x1="160" y1="0" x2="160" y2="200" stroke="%23334155" stroke-width="1.5"/>
  <line x1="280" y1="50" x2="280" y2="200" stroke="%23334155" stroke-width="1.5"/>
  <text x="80" y="30" font-size="12" font-weight="bold" fill="%230f172a" text-anchor="middle">SKALA: 1:1</text>
  <text x="80" y="80" font-size="12" fill="%230f172a" text-anchor="middle">DIGAMBAR: ANDI</text>
  <text x="80" y="130" font-size="12" fill="%230f172a" text-anchor="middle">DIPERIKSA: GURU</text>
  <text x="80" y="180" font-size="12" fill="%230f172a" text-anchor="middle">SMK NEGERI 1 TEKNIK</text>
  <text x="300" y="30" font-size="14" font-weight="bold" fill="%230284c7" text-anchor="middle">POROS ENGKOL (CRANKSHAFT)</text>
  <text x="220" y="80" font-size="11" fill="%2364748b" text-anchor="middle">TANGGAL: 12-09-2024</text>
  <text x="360" y="80" font-size="11" fill="%2364748b" text-anchor="middle">PROYEKSI: EROPA</text>
  <text x="360" y="130" font-size="12" font-weight="bold" fill="%230f172a" text-anchor="middle">NO. GAMBAR: GT-04/TKR</text>
  <text x="220" y="130" font-size="11" fill="%2364748b" text-anchor="middle">BAHAN: ST 42</text>
  <text x="360" y="180" font-size="11" fill="%2364748b" text-anchor="middle">LEMBAR: 1 DARI 2</text>
</svg>`;

// Pre-seeded Real Profiles
export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-guru-01',
    email: 'joko.setyo@mitracbt.id',
    full_name: 'Joko Setyo Nugroho, S.T.',
    role: 'guru',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '081234567890',
    created_at: '2024-07-01T08:00:00Z'
  },
  {
    id: 'user-admin-01',
    email: 'admin@mitracbt.id',
    full_name: 'Joko Setyo Nugroho, S.T.',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    phone: '081234567890',
    created_at: '2024-07-01T08:00:00Z'
  },
  {
    id: 'user-pengawas-01',
    email: 'pengawas@mitracbt.id',
    full_name: 'Pengawas Ruangan',
    role: 'pengawas',
    avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
    phone: '081234567892',
    created_at: '2024-07-01T08:00:00Z'
  }
];

// Classes for Exam: X TKR 1, X TKR 2, X TKR 1 03, and X TKR 2 03
export const INITIAL_CLASSES: ClassRoom[] = [
  { id: 'cls-tkr-1', name: 'X TKR 1', grade: 'X', major: 'TKR', academic_year: '2024/2025' },
  { id: 'cls-tkr-2', name: 'X TKR 2', grade: 'X', major: 'TKR', academic_year: '2024/2025' },
  { id: 'cls-tkr-1-03', name: 'X TKR 1 03', grade: 'X', major: 'TKR', academic_year: '2024/2025' },
  { id: 'cls-tkr-2-03', name: 'X TKR 2 03', grade: 'X', major: 'TKR', academic_year: '2024/2025' },
];

// Real Students: Initially empty, populated by user Excel Import
export const INITIAL_STUDENTS: Student[] = [];

// Real Teacher: Joko Setyo Nugroho, S.T.
export const INITIAL_TEACHERS: Teacher[] = [
  { 
    id: 'teacher-01', 
    profile_id: 'user-guru-01', 
    nip: '198506152010011012', 
    subject_specialty: 'Teknik Mesin & Rekayasa Kejuruan', 
    profile: INITIAL_PROFILES[0] 
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'subj-01', name: 'Gambar Teknik Mesin & Otomotif', code: 'GT-TKR', major: 'Teknik Otomotif', description: 'Standar gambar teknik, etiket, skala, proyeksi Eropa/Amerika, potongan, CAD' },
  { id: 'subj-02', name: 'Dasar Konversi Energi & Engine', code: 'DKE-TKR', major: 'Teknik Otomotif', description: 'Termodinamika motor bakar, siklus 2/4 langkah, mesin bensin dan diesel' },
  { id: 'subj-03', name: 'Pemeliharaan Mesin Kendaraan Ringan', code: 'PMKR-TKR', major: 'Teknik Otomotif', description: 'Tune-up, sistem pendinginan, pelumasan, bahan bakar EFI, mekanisme katup' },
  { id: 'subj-04', name: 'Matematika Terapan Kejuruan', code: 'MTK-SMK', major: 'Umum', description: 'Geometri, trigonometri, aljabar, dan kalkulasi mekanika teknik' },
  { id: 'subj-05', name: 'Bahasa Indonesia Kejuruan', code: 'BIN-SMK', major: 'Umum', description: 'Laporan kerja bengkel, SOP perbengkelan, dan komunikasi profesional' }
];

export const INITIAL_MATERIALS: SubjectMaterial[] = [
  { id: 'mat-01', subject_id: 'subj-01', name: 'Fungsi & Standarisasi Garis Gambar Teknik', order_index: 1 },
  { id: 'mat-02', subject_id: 'subj-01', name: 'Etiket Gambar & Skala Pengukuran (ISO)', order_index: 2 },
  { id: 'mat-03', subject_id: 'subj-01', name: 'Proyeksi Piktorial & Orthogonal (Eropa & Amerika)', order_index: 3 },
  { id: 'mat-04', subject_id: 'subj-01', name: 'Potongan / Irisan dan Dimensi Toleransi', order_index: 4 },
  { id: 'mat-05', subject_id: 'subj-02', name: 'Prinsip Termodinamika & Motor Bakar', order_index: 1 },
  { id: 'mat-06', subject_id: 'subj-02', name: 'Siklus Kerja Mesin 4 Langkah (Otto & Diesel)', order_index: 2 },
  { id: 'mat-07', subject_id: 'subj-02', name: 'Sistem Pelumasan, Pendinginan & Bahan Bakar', order_index: 3 },
  { id: 'mat-08', subject_id: 'subj-02', name: 'Efisiensi Volumetrik & Performa Engine', order_index: 4 }
];

export const INITIAL_ASSESSMENT_TYPES: AssessmentType[] = [
  { id: 'eval-01', name: 'Sumatif Tengah Semester', code: 'STS', description: 'Penilaian sumatif di pertengahan semester', is_default: true },
  { id: 'eval-02', name: 'Sumatif Akhir Semester', code: 'SAS', description: 'Penilaian sumatif di akhir semester untuk penentuan nilai raport', is_default: true },
  { id: 'eval-03', name: 'Ulangan Harian', code: 'UH', description: 'Evaluasi periodik per pokok bahasan/materi', is_default: true },
  { id: 'eval-04', name: 'Quiz', code: 'QUIZ', description: 'Kuis cepat untuk pemahaman konsep harian', is_default: true },
  { id: 'eval-05', name: 'Remedial', code: 'REMEDIAL', description: 'Ujian perbaikan bagi siswa yang belum mencapai KKM', is_default: true },
  { id: 'eval-06', name: 'Try Out', code: 'TRYOUT', description: 'Simulasi ujian kelulusan atau sertifikasi kejuruan', is_default: true },
  { id: 'eval-07', name: 'Ujian Teori Praktik', code: 'UPT', description: 'Ujian teori pengantar praktik kejuruan di bengkel', is_default: true },
  { id: 'eval-08', name: 'Evaluasi Pembelajaran', code: 'EVAL', description: 'Evaluasi pembelajaran fleksibel', is_default: true }
];

export const INITIAL_QUESTION_BANKS: QuestionBank[] = [
  {
    id: 'bank-01',
    teacher_id: 'teacher-01',
    subject_id: 'subj-01',
    title: 'Bank Soal Komprehensif Gambar Teknik Otomotif Kelas X',
    description: 'Kumpulan soal standar ISO untuk proyeksi, etiket, garis kerja, dan potongan mesin.',
    target_grades: ['X'],
    created_at: '2024-08-01T08:00:00Z',
    question_count: 25
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  ...GTO_INITIAL_QUESTIONS
];

export const INITIAL_EXAMS: Exam[] = [
  {
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
    question_count: 25,
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
    assessment_type: INITIAL_ASSESSMENT_TYPES[0],
    subject: INITIAL_SUBJECTS[0],
    class: { id: 'all', name: 'Semua Kelas', grade: 'X', major: 'TKR', academic_year: '2024/2025' },
    questions: GTO_INITIAL_QUESTIONS
  }
];

export const INITIAL_PARTICIPANTS: ExamParticipant[] = [];

export const INITIAL_EVENTS: ExamEvent[] = [];

// Hasil ujian: kosong — akan terisi setelah siswa diimport dan mengerjakan ujian
export const INITIAL_EXAM_RESULTS: ExamResult[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-01',
    user_id: 'user-admin-01',
    user_name: 'Joko Setyo Nugroho, S.T.',
    action: 'CREATE_EXAM',
    entity_type: 'exam',
    entity_id: 'exam-01',
    details: { exam_title: 'STS Gambar Teknik XI TKR', pin: 'GT902' },
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'audit-02',
    user_id: 'user-guru-01',
    user_name: 'Joko Setyo Nugroho, S.T.',
    action: 'CREATE_QUESTION',
    entity_type: 'question',
    entity_id: 'q-01',
    details: { subject: 'Gambar Teknik', topic: 'Proyeksi Ortogonal' },
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'audit-03',
    user_id: 'user-admin-01',
    user_name: 'Joko Setyo Nugroho, S.T.',
    action: 'SETUP_SYSTEM',
    entity_type: 'system',
    details: { message: 'Sistem Mitra CBT diinisialisasi. Siswa akan diimport via Excel.' },
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  }
];

