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
  },
  {
    id: 'bank-02',
    teacher_id: 'teacher-01',
    subject_id: 'subj-02',
    title: 'Bank Soal Motor Bakar & Dasar Konversi Energi Engine',
    description: 'Kumpulan butir soal termodinamika mesin, siklus motor 4-tak & 2-tak, dan sistem penunjang engine.',
    target_grades: ['X', 'XII'],
    created_at: '2024-08-05T09:00:00Z',
    question_count: 25
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  ...GTO_INITIAL_QUESTIONS,
  {
    id: 'q-01',
    bank_id: 'bank-01',
    material_id: 'mat-03',
    question_type: 'pilihan_ganda',
    content: 'Perhatikan gambar simbol proyeksi berikut ini dengan saksama. Simbol tersebut menandakan standarisasi proyeksi jenis apakah dalam gambar teknik?',
    image_url: DIAGRAM_PROYEKSI_EROPA,
    explanation: 'Simbol kerucut terpancung dengan pandangan samping terletak di sebelah kanan benda merupakan ciri khas Proyeksi Eropa (Sudut Pertama / First Angle Projection).',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Mengidentifikasi jenis proyeksi ortogonal berstandar ISO',
    created_at: '2024-08-02T10:00:00Z',
    options: [
      { id: 'opt-01-a', option_label: 'A', content: 'Proyeksi Amerika (Sudut Ketiga)', is_correct: false },
      { id: 'opt-01-b', option_label: 'B', content: 'Proyeksi Eropa (Sudut Pertama)', is_correct: true },
      { id: 'opt-01-c', option_label: 'C', content: 'Proyeksi Isometri Miring', is_correct: false },
      { id: 'opt-01-d', option_label: 'D', content: 'Proyeksi Dimetri Perspektif', is_correct: false }
    ]
  },
  {
    id: 'q-02',
    bank_id: 'bank-02',
    material_id: 'mat-06',
    question_type: 'pilihan_ganda',
    content: 'Perhatikan diagram siklus kerja motor 4-langkah di bawah ini. Pada langkah nomor berapakah terjadi proses di mana piston bergerak dari Titik Mati Atas (TMA) menuju Titik Mati Bawah (TMB) dengan kedua katup tertutup rapat akibat pembakaran campuran bahan bakar dan udara?',
    image_url: DIAGRAM_SIKLUS_ENGINE,
    explanation: 'Pada Langkah Usaha (Power Stroke / Langkah ke-3), busi memercikkan bunga api, terjadi ledakan yang mendorong piston dari TMA ke TMB dengan kedua katup (in & ex) tertutup rapat.',
    weight: 2.0,
    difficulty: 'mudah',
    competency: 'Menjelaskan mekanisme siklus kerja motor 4 langkah',
    created_at: '2024-08-06T10:30:00Z',
    options: [
      { id: 'opt-02-a', option_label: 'A', content: 'Langkah 1 (Langkah Hisap)', is_correct: false },
      { id: 'opt-02-b', option_label: 'B', content: 'Langkah 2 (Langkah Kompresi)', is_correct: false },
      { id: 'opt-02-c', option_label: 'C', content: 'Langkah 3 (Langkah Usaha / Kerja)', is_correct: true },
      { id: 'opt-02-d', option_label: 'D', content: 'Langkah 4 (Langkah Buang)', is_correct: false }
    ]
  },
  {
    id: 'q-03',
    bank_id: 'bank-01',
    material_id: 'mat-02',
    question_type: 'pilihan_ganda',
    content: 'Perhatikan etiket gambar kerja teknik di bawah ini. Berdasarkan etiket standar industri tersebut, skala gambar yang digunakan adalah ...',
    image_url: DIAGRAM_ETIKET,
    explanation: 'Berdasarkan kolom skala pada etiket, tertera nilai skala 1:1, yang artinya ukuran pada gambar sama dengan ukuran benda sesungguhnya.',
    weight: 1.5,
    difficulty: 'mudah',
    competency: 'Membaca informasi pada kepala gambar (etiket)',
    created_at: '2024-08-02T11:00:00Z',
    options: [
      { id: 'opt-03-a', option_label: 'A', content: '1 : 2 (Diperkecil)', is_correct: false },
      { id: 'opt-03-b', option_label: 'B', content: '1 : 1 (Ukuran Sebenarnya)', is_correct: true },
      { id: 'opt-03-c', option_label: 'C', content: '2 : 1 (Diperbesar)', is_correct: false },
      { id: 'opt-03-d', option_label: 'D', content: '5 : 1 (Detail)', is_correct: false }
    ]
  },
  {
    id: 'q-04',
    bank_id: 'bank-02',
    material_id: 'mat-07',
    question_type: 'pg_kompleks',
    content: 'Pilihlah DUA atau LEBIH komponen yang berfungsi dalam sistem pendinginan air (water cooling system) pada mesin mobil bensin:',
    explanation: 'Komponen utama pendinginan air meliputi Radiator, Termostat, dan Pompa Air (Water Pump). Busi adalah bagian sistem pengapian, sedangkan Karburator adalah sistem bahan bakar.',
    weight: 2.5,
    difficulty: 'sedang',
    competency: 'Mengklasifikasikan komponen sistem pendinginan mesin',
    created_at: '2024-08-07T09:00:00Z',
    options: [
      { id: 'opt-04-a', option_label: 'A', content: 'Radiator & Tutup Radiator', is_correct: true },
      { id: 'opt-04-b', option_label: 'B', content: 'Termostat (Thermostat Valve)', is_correct: true },
      { id: 'opt-04-c', option_label: 'C', content: 'Water Pump (Pompa Air Pendingin)', is_correct: true },
      { id: 'opt-04-d', option_label: 'D', content: 'Spark Plug (Busi Pengapian)', is_correct: false }
    ]
  },
  {
    id: 'q-05',
    bank_id: 'bank-02',
    material_id: 'mat-06',
    question_type: 'benar_salah',
    content: 'Pada motor bensin 4-tak (4-langkah), untuk menyelesaikan satu siklus pembakaran yang sempurna dibutuhkan 2 kali putaran penuh poros engkol (720 derajat).',
    explanation: 'Pernyataan ini BENAR. Mesin 4-tak membutuhkan 4 kali gerakan piston (2 kali naik, 2 kali turun) yang setara dengan 2 putaran penuh crankshaft (720 derajat).',
    weight: 1.5,
    difficulty: 'mudah',
    competency: 'Memahami prinsip putaran poros engkol pada motor 4 tak',
    created_at: '2024-08-07T09:30:00Z',
    options: [
      { id: 'opt-05-true', option_label: 'A', content: 'BENAR', is_correct: true },
      { id: 'opt-05-false', option_label: 'B', content: 'SALAH', is_correct: false }
    ]
  },
  {
    id: 'q-06',
    bank_id: 'bank-02',
    material_id: 'mat-05',
    question_type: 'isian_singkat',
    content: 'Posisi paling atas yang dapat dicapai oleh piston di dalam silinder blok saat bergerak naik disebut Titik Mati ... (Jawab dalam singkatan baku 3 huruf, contoh: TMA).',
    explanation: 'TMA adalah singkatan dari Titik Mati Atas (Top Dead Center / TDC).',
    weight: 2.0,
    difficulty: 'mudah',
    competency: 'Mengenal terminologi dasar silinder mesin',
    created_at: '2024-08-07T10:00:00Z',
    options: [
      { id: 'opt-06-a', option_label: 'A', content: 'TMA', is_correct: true }
    ]
  },
  {
    id: 'q-07',
    bank_id: 'bank-01',
    material_id: 'mat-01',
    question_type: 'pilihan_ganda',
    content: 'Garis strip-titik tipis (— · — · —) dalam standar gambar teknik ISO digunakan khusus untuk menggambarkan:',
    explanation: 'Garis strip-titik tipis digunakan sebagai garis sumbu simetri benda atau lintasan gerak komponen mesin.',
    weight: 1.5,
    difficulty: 'sedang',
    competency: 'Menerapkan standarisasi jenis garis gambar teknik ISO',
    created_at: '2024-08-03T11:00:00Z',
    options: [
      { id: 'opt-07-a', option_label: 'A', content: 'Garis benda nyata / tepi yang terlihat langsung', is_correct: false },
      { id: 'opt-07-b', option_label: 'B', content: 'Garis sumbu simetri benda putar dan lintasan', is_correct: true },
      { id: 'opt-07-c', option_label: 'C', content: 'Garis bayangan benda yang tidak tampak', is_correct: false },
      { id: 'opt-07-d', option_label: 'D', content: 'Garis ukuran dan garis bantu dimensi', is_correct: false }
    ]
  },
  {
    id: 'q-08',
    bank_id: 'bank-02',
    material_id: 'mat-08',
    question_type: 'pilihan_ganda',
    content: 'Perbandingan antara volume total silinder (saat piston di TMB) dengan volume ruang bakar (saat piston di TMA) disebut sebagai:',
    explanation: 'Perbandingan tersebut adalah Perbandingan Kompresi (Compression Ratio), yang dirumuskan r = (Vs + Vc) / Vc.',
    weight: 2.0,
    difficulty: 'sulit',
    competency: 'Menghitung parameter geometri dan volume silinder',
    created_at: '2024-08-08T11:00:00Z',
    options: [
      { id: 'opt-08-a', option_label: 'A', content: 'Efisiensi Termal Mesin', is_correct: false },
      { id: 'opt-08-b', option_label: 'B', content: 'Perbandingan Kompresi (Compression Ratio)', is_correct: true },
      { id: 'opt-08-c', option_label: 'C', content: 'Volume Langkah Piston (Displacement)', is_correct: false },
      { id: 'opt-08-d', option_label: 'D', content: 'Torsi Maksimum Mesin', is_correct: false }
    ]
  },
  {
    id: 'q-09',
    bank_id: 'bank-02',
    material_id: 'mat-05',
    question_type: 'pilihan_ganda',
    content: 'Komponen mekanik pada kepala silinder yang berfungsi untuk membuka dan menutup saluran masuk (intake port) dan saluran buang (exhaust port) secara presisi sesuai dengan siklus kerja mesin adalah ...',
    explanation: 'Katup (Valve / Klep) bertugas membuka dan menutup saluran masuk bahan bakar/udara dan saluran gas buang.',
    weight: 2.0,
    difficulty: 'mudah',
    competency: 'Mengidentifikasi komponen mekanisme katup kepala silinder',
    created_at: '2024-08-08T12:00:00Z',
    options: [
      { id: 'opt-09-a', option_label: 'A', content: 'Katup (Valve / Klep Mesin)', is_correct: true },
      { id: 'opt-09-b', option_label: 'B', content: 'Piston & Batang Torak', is_correct: false },
      { id: 'opt-09-c', option_label: 'C', content: 'Injektor Bahan Bakar', is_correct: false },
      { id: 'opt-09-d', option_label: 'D', content: 'Busi Pengapian', is_correct: false }
    ]
  },
  {
    id: 'q-10',
    bank_id: 'bank-02',
    material_id: 'mat-06',
    question_type: 'pilihan_ganda',
    content: 'Pada motor bensin 2-langkah (2-tak), satu siklus kerja pembakaran yang menghasilkan tenaga diselesaikan dalam berapa kali putaran poros engkol (crankshaft)?',
    explanation: 'Motor 2-tak menyelesaikan 1 siklus kerja dalam 2 langkah gerakan piston yang setara dengan 1 putaran penuh poros engkol (360 derajat).',
    weight: 2.0,
    difficulty: 'mudah',
    competency: 'Menjelaskan prinsip kerja motor bakar 2 langkah',
    created_at: '2024-08-08T12:15:00Z',
    options: [
      { id: 'opt-10-a', option_label: 'A', content: '1 Putaran Poros Engkol (360°)', is_correct: true },
      { id: 'opt-10-b', option_label: 'B', content: '2 Putaran Poros Engkol (720°)', is_correct: false },
      { id: 'opt-10-c', option_label: 'C', content: '4 Putaran Poros Engkol (1440°)', is_correct: false },
      { id: 'opt-10-d', option_label: 'D', content: 'Setengah Putaran Poros Engkol (180°)', is_correct: false }
    ]
  },
  {
    id: 'q-11',
    bank_id: 'bank-02',
    material_id: 'mat-07',
    question_type: 'pilihan_ganda',
    content: 'Pada tutup radiator (radiator cap) terdapat katup pengaman. Katup yang bertugas menyalurkan kelebihan cairan pendingin ke tangki reservoir saat tekanan sistem pendingin melebihi batas standar adalah ...',
    explanation: 'Katup Pelepas (Relief / Pressure Valve) terbuka ketika tekanan air pendingin melebihi 0.9 - 1.1 bar untuk mengalirkan air panas ke reservoir.',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Memahami cara kerja tutup radiator bertekanan',
    created_at: '2024-08-08T12:30:00Z',
    options: [
      { id: 'opt-11-a', option_label: 'A', content: 'Relief Valve (Katup Pelepas Tekanan)', is_correct: true },
      { id: 'opt-11-b', option_label: 'B', content: 'Vacuum Valve (Katup Vakum)', is_correct: false },
      { id: 'opt-11-c', option_label: 'C', content: 'Bypass Valve (Katup Pintas)', is_correct: false },
      { id: 'opt-11-d', option_label: 'D', content: 'Thermostat Valve', is_correct: false }
    ]
  },
  {
    id: 'q-12',
    bank_id: 'bank-02',
    material_id: 'mat-07',
    question_type: 'pg_kompleks',
    content: 'Pilihlah DUA atau LEBIH fungsi utama dari oli mesin (pelumas) pada kendaraan otomotif:',
    explanation: 'Fungsi oli mesin mencakup pelumasan (lubricating), pendinginan (cooling), perapat kompresi (sealing), dan pembersih kotoran sisa gesekan/karbon (cleaning).',
    weight: 2.5,
    difficulty: 'sedang',
    competency: 'Menganalisis fungsi sistem pelumasan mesin',
    created_at: '2024-08-08T12:45:00Z',
    options: [
      { id: 'opt-12-a', option_label: 'A', content: 'Mengurangi gesekan dan keausan antar logam yang bergerak', is_correct: true },
      { id: 'opt-12-b', option_label: 'B', content: 'Membantu mendinginkan komponen mesin yang dilalui oli', is_correct: true },
      { id: 'opt-12-c', option_label: 'C', content: 'Sebagai perapat (sealing) antara dinding silinder dan ring piston', is_correct: true },
      { id: 'opt-12-d', option_label: 'D', content: 'Membakar campuran bahan bakar di ruang bakar', is_correct: false }
    ]
  },
  {
    id: 'q-13',
    bank_id: 'bank-02',
    material_id: 'mat-06',
    question_type: 'pilihan_ganda',
    content: 'Perbedaan paling mendasar dalam proses penyalaan bahan bakar antara motor bensin dan motor diesel adalah ...',
    explanation: 'Motor bensin menggunakan busi (spark ignition), sedangkan motor diesel mengandalkan suhu tinggi udara hasil kompresi tinggi (compression ignition).',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Membedakan karakteristik motor bensin dan diesel',
    created_at: '2024-08-08T13:00:00Z',
    options: [
      { id: 'opt-13-a', option_label: 'A', content: 'Motor diesel menyala akibat kompresi udara tinggi tanpa busi, motor bensin menyala dengan loncatan bunga api busi', is_correct: true },
      { id: 'opt-13-b', option_label: 'B', content: 'Motor bensin memiliki rasio kompresi jauh lebih tinggi dibanding motor diesel', is_correct: false },
      { id: 'opt-13-c', option_label: 'C', content: 'Motor diesel menggunakan karburator untuk mencampur bahan bakar', is_correct: false },
      { id: 'opt-13-d', option_label: 'D', content: 'Motor bensin tidak memerlukan oli mesin untuk pelumasan', is_correct: false }
    ]
  },
  {
    id: 'q-14',
    bank_id: 'bank-02',
    material_id: 'mat-05',
    question_type: 'pilihan_ganda',
    content: 'Pada sistem Electronic Fuel Injection (EFI), sensor yang bertugas mendeteksi tingkat kevakuman atau tekanan udara di intake manifold untuk menentukan suplai bahan bakar dasar adalah ...',
    explanation: 'Sensor MAP (Manifold Absolute Pressure) mengukur tekanan udara absolut pada saluran masuk (intake manifold).',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Mengidentifikasi sensor-sensor pada sistem EFI otomotif',
    created_at: '2024-08-08T13:15:00Z',
    options: [
      { id: 'opt-14-a', option_label: 'A', content: 'MAP (Manifold Absolute Pressure) Sensor', is_correct: true },
      { id: 'opt-14-b', option_label: 'B', content: 'ECT (Engine Coolant Temperature) Sensor', is_correct: false },
      { id: 'opt-14-c', option_label: 'C', content: 'TPS (Throttle Position Sensor)', is_correct: false },
      { id: 'opt-14-d', option_label: 'D', content: 'O2 (Oxygen) Sensor', is_correct: false }
    ]
  },
  {
    id: 'q-15',
    bank_id: 'bank-02',
    material_id: 'mat-05',
    question_type: 'pilihan_ganda',
    content: 'Pada piston motor 4-tak terdapat 3 buah ring piston. Ring yang berada di alur paling bawah (posisi ketiga) dan bertugas mengikis oli berlebih pada dinding silinder adalah ...',
    explanation: 'Ring oli (oil scraper ring) bertugas menyapu kelebihan oli dari dinding silinder agar tidak ikut masuk dan terbakar di ruang bakar.',
    weight: 2.0,
    difficulty: 'mudah',
    competency: 'Mengenal konstruksi dan fungsi ring piston',
    created_at: '2024-08-08T13:30:00Z',
    options: [
      { id: 'opt-15-a', option_label: 'A', content: 'Ring Oli (Oil Control Ring)', is_correct: true },
      { id: 'opt-15-b', option_label: 'B', content: 'Ring Kompresi Nomor 1 (Top Ring)', is_correct: false },
      { id: 'opt-15-c', option_label: 'C', content: 'Ring Kompresi Nomor 2 (Second Ring)', is_correct: false },
      { id: 'opt-15-d', option_label: 'D', content: 'Snap Ring Pengunci Pin Piston', is_correct: false }
    ]
  },
  {
    id: 'q-16',
    bank_id: 'bank-02',
    material_id: 'mat-07',
    question_type: 'pilihan_ganda',
    content: 'Katup termostat (thermostat) pada sistem pendingin mesin umumnya mulai membuka saat suhu air pendingin mesin mencapai kisaran ...',
    explanation: 'Thermostat mulai membuka pada suhu kerja standar mesin sekitar 80°C hingga 85°C dan membuka penuh pada sekitar 95°C.',
    weight: 2.0,
    difficulty: 'mudah',
    competency: 'Memahami temperatur kerja termostat pendingin mesin',
    created_at: '2024-08-08T13:45:00Z',
    options: [
      { id: 'opt-16-a', option_label: 'A', content: '80°C - 85°C', is_correct: true },
      { id: 'opt-16-b', option_label: 'B', content: '40°C - 50°C', is_correct: false },
      { id: 'opt-16-c', option_label: 'C', content: '110°C - 120°C', is_correct: false },
      { id: 'opt-16-d', option_label: 'D', content: '20°C - 30°C', is_correct: false }
    ]
  },
  {
    id: 'q-17',
    bank_id: 'bank-02',
    material_id: 'mat-05',
    question_type: 'pilihan_ganda',
    content: 'Piringan baja pejal dan berat yang terpasang di ujung belakang poros engkol (crankshaft) yang bertugas menyimpan energi inersia putar dan meratakan putaran poros engkol adalah ...',
    explanation: 'Flywheel (roda gila / roda penerus) memanfaatkan momen inersia untuk menjaga putaran mesin tetap halus dan seimbang.',
    weight: 2.0,
    difficulty: 'mudah',
    competency: 'Menjelaskan fungsi Flywheel pada mesin otomotif',
    created_at: '2024-08-08T14:00:00Z',
    options: [
      { id: 'opt-17-a', option_label: 'A', content: 'Flywheel (Roda Penerus / Roda Gila)', is_correct: true },
      { id: 'opt-17-b', option_label: 'B', content: 'Harmonic Damper Pulley', is_correct: false },
      { id: 'opt-17-c', option_label: 'C', content: 'Connecting Rod (Batang Torak)', is_correct: false },
      { id: 'opt-17-d', option_label: 'D', content: 'Camshaft Gear', is_correct: false }
    ]
  },
  {
    id: 'q-18',
    bank_id: 'bank-02',
    material_id: 'mat-06',
    question_type: 'pilihan_ganda',
    content: 'Urutan pengapian (Firing Order - FO) yang paling umum dan standar diaplikasikan pada mesin mobil bensin 4 silinder segaris (in-line 4) adalah ...',
    explanation: 'Urutan pengapian 1 - 3 - 4 - 2 adalah konfigurasi paling standar untuk menjaga keseimbangan momen putar mesin 4 silinder.',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Menentukan Firing Order (FO) mesin 4 silinder segaris',
    created_at: '2024-08-08T14:15:00Z',
    options: [
      { id: 'opt-18-a', option_label: 'A', content: '1 - 3 - 4 - 2', is_correct: true },
      { id: 'opt-18-b', option_label: 'B', content: '1 - 2 - 3 - 4', is_correct: false },
      { id: 'opt-18-c', option_label: 'C', content: '4 - 3 - 2 - 1', is_correct: false },
      { id: 'opt-18-d', option_label: 'D', content: '1 - 4 - 3 - 2', is_correct: false }
    ]
  },
  {
    id: 'q-19',
    bank_id: 'bank-02',
    material_id: 'mat-05',
    question_type: 'pilihan_ganda',
    content: 'Apabila sensor Crankshaft Position (CKP Sensor) rusak atau soketnya lepas pada mobil EFI modern, gejala yang langsung dialami mesin adalah ...',
    explanation: 'Sensor CKP adalah referensi utama ECU untuk mengetahui putaran dan posisi piston; tanpa sinyal CKP, ECU tidak akan menyemprotkan bensin dan tidak memicu api busi (mesin mogok total).',
    weight: 2.0,
    difficulty: 'sulit',
    competency: 'Mendiagnosis kerusakan sistem manajemen mesin EFI',
    created_at: '2024-08-08T14:30:00Z',
    options: [
      { id: 'opt-19-a', option_label: 'A', content: 'Mesin tidak dapat hidup sama sekali saat distarter (starter berputar tetapi tidak ada pengapian & injeksi)', is_correct: true },
      { id: 'opt-19-b', option_label: 'B', content: 'Mesin tetap hidup normal namun lampu kabin mati', is_correct: false },
      { id: 'opt-19-c', option_label: 'C', content: 'Air radiator mendidih dengan cepat', is_correct: false },
      { id: 'opt-19-d', option_label: 'D', content: 'Kipas radiator berputar dengan arah terbalik', is_correct: false }
    ]
  },
  {
    id: 'q-20',
    bank_id: 'bank-02',
    material_id: 'mat-05',
    question_type: 'pilihan_ganda',
    content: 'Jika teknisi melakukan penyetelan celah katup (valve clearance) yang terlalu rapat atau bahkan tanpa celah sama sekali, dampak negatif yang terjadi saat mesin mencapai suhu kerja adalah ...',
    explanation: 'Saat mesin panas, batang katup memuai memanjang. Jika celah terlalu rapat, katup akan terdorong terbuka sedikit sehingga kompresi bocor dan performa mesin anjlok.',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Menganalisis dampak penyetelan celah katup mesin',
    created_at: '2024-08-08T14:45:00Z',
    options: [
      { id: 'opt-20-a', option_label: 'A', content: 'Katup tidak menutup rapat saat panas sehingga terjadi kebocoran kompresi dan kehilangan tenaga', is_correct: true },
      { id: 'opt-20-b', option_label: 'B', content: 'Timbul bunyi gemeretak logam yang sangat keras dari kepala silinder', is_correct: false },
      { id: 'opt-20-c', option_label: 'C', content: 'Bahan bakar menjadi jauh lebih boros hingga 3 kali lipat', is_correct: false },
      { id: 'opt-20-d', option_label: 'D', content: 'Pompa oli berhenti berputar', is_correct: false }
    ]
  },
  {
    id: 'q-21',
    bank_id: 'bank-02',
    material_id: 'mat-06',
    question_type: 'pilihan_ganda',
    content: 'Perangkat induksi paksa (forced induction) yang memanfaatkan energi gas buang knalpot untuk memutar turbin dan memampatkan udara segar ke ruang bakar dinamakan ...',
    explanation: 'Turbocharger digerakkan oleh gas buang (berbeda dengan Supercharger yang digerakkan sabuk/belt puli mesin).',
    weight: 2.0,
    difficulty: 'mudah',
    competency: 'Menjelaskan prinsip kerja Turbocharger pada motor bakar',
    created_at: '2024-08-08T15:00:00Z',
    options: [
      { id: 'opt-21-a', option_label: 'A', content: 'Turbocharger', is_correct: true },
      { id: 'opt-21-b', option_label: 'B', content: 'Alternator', is_correct: false },
      { id: 'opt-21-c', option_label: 'C', content: 'Starter Motor', is_correct: false },
      { id: 'opt-21-d', option_label: 'D', content: 'Power Steering Pump', is_correct: false }
    ]
  },
  {
    id: 'q-22',
    bank_id: 'bank-02',
    material_id: 'mat-07',
    question_type: 'pilihan_ganda',
    content: 'Pada kode kekentalan oli multigrade SAE 10W-40, huruf "W" merupakan singkatan dari ...',
    explanation: 'Huruf "W" berarti "Winter", yang menunjukkan tingkat kekentalan oli saat temperatur rendah/dingin.',
    weight: 1.5,
    difficulty: 'mudah',
    competency: 'Membaca kode spesifikasi SAE minyak pelumas',
    created_at: '2024-08-08T15:15:00Z',
    options: [
      { id: 'opt-22-a', option_label: 'A', content: 'Winter (Kondisi Suhu Dingin)', is_correct: true },
      { id: 'opt-22-b', option_label: 'B', content: 'Water (Ketahanan terhadap Air)', is_correct: false },
      { id: 'opt-22-c', option_label: 'C', content: 'Weight (Berat Jenis Pelumas)', is_correct: false },
      { id: 'opt-22-d', option_label: 'D', content: 'Work (Daya Tahan Mesin Bekerja)', is_correct: false }
    ]
  },
  {
    id: 'q-23',
    bank_id: 'bank-02',
    material_id: 'mat-08',
    question_type: 'pilihan_ganda',
    content: 'Komponen pada saluran pipa gas buang (exhaust system) yang berfungsi mengubah gas buang beracun (CO, HC, NOx) menjadi senyawa yang tidak berbahaya (CO2, H2O, N2) adalah ...',
    explanation: 'Catalytic Converter (Katalisator gas buang) mengkatalisis gas beracun emisi knalpot menggunakan logam mulia platina/rhodium.',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Mengidentifikasi sistem pereduksi emisi gas buang otomotif',
    created_at: '2024-08-08T15:30:00Z',
    options: [
      { id: 'opt-23-a', option_label: 'A', content: 'Catalytic Converter (Katalis Gas Buang)', is_correct: true },
      { id: 'opt-23-b', option_label: 'B', content: 'Muffler Silencer (Knalpot Peredam Suara)', is_correct: false },
      { id: 'opt-23-c', option_label: 'C', content: 'Resonator Knalpot', is_correct: false },
      { id: 'opt-23-d', option_label: 'D', content: 'Exhaust Manifold Header', is_correct: false }
    ]
  },
  {
    id: 'q-24',
    bank_id: 'bank-02',
    material_id: 'mat-06',
    question_type: 'pilihan_ganda',
    content: 'Perbandingan massa campuran udara dan bahan bakar bensin ideal secara teoritis (perbandingan stoikiometri) untuk pembakaran paling sempurna adalah ...',
    explanation: 'Rasio stoikiometri mesin bensin adalah 14,7 : 1 (14,7 gram udara untuk membakar habis 1 gram bensin).',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Memahami rasio campuran bahan bakar stoikiometri',
    created_at: '2024-08-08T15:45:00Z',
    options: [
      { id: 'opt-24-a', option_label: 'A', content: '14,7 : 1 (Udara : Bensin)', is_correct: true },
      { id: 'opt-24-b', option_label: 'B', content: '10,5 : 1 (Udara : Bensin)', is_correct: false },
      { id: 'opt-24-c', option_label: 'C', content: '20,0 : 1 (Udara : Bensin)', is_correct: false },
      { id: 'opt-24-d', option_label: 'D', content: '1 : 14,7 (Udara : Bensin)', is_correct: false }
    ]
  },
  {
    id: 'q-25',
    bank_id: 'bank-02',
    material_id: 'mat-05',
    question_type: 'pilihan_ganda',
    content: 'Alat ukur presisi yang digunakan bersama mikrometer luar (outside micrometer) untuk mengukur ketirusan dan keovalan diameter dinding silinder blok mesin adalah ...',
    explanation: 'Cylinder Bore Gauge (CBG) digunakan khusus untuk mengukur keausan diameter dalam dinding silinder blok mesin.',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Menerapkan alat ukur mekanik presisi otomotif',
    created_at: '2024-08-08T16:00:00Z',
    options: [
      { id: 'opt-25-a', option_label: 'A', content: 'Cylinder Bore Gauge (CBG)', is_correct: true },
      { id: 'opt-25-b', option_label: 'B', content: 'Dial Indicator Stand', is_correct: false },
      { id: 'opt-25-c', option_label: 'C', content: 'Feeler Gauge (Bilah Ukur Celah)', is_correct: false },
      { id: 'opt-25-d', option_label: 'D', content: 'Telescopic Gauge', is_correct: false }
    ]
  },
  {
    id: 'q-26',
    bank_id: 'bank-02',
    material_id: 'mat-05',
    question_type: 'pilihan_ganda',
    content: 'Komponen timing drive (timing belt / timing chain) berfungsi untuk menyinkronkan putaran antara dua poros utama mesin, yaitu ...',
    explanation: 'Timing belt / chain menyelaraskan putaran Poros Engkol (Crankshaft) dan Poros Nok (Camshaft) dengan rasio putaran 2:1.',
    weight: 2.0,
    difficulty: 'mudah',
    competency: 'Menjelaskan mekanisme penghubung timing drive mesin',
    created_at: '2024-08-08T16:15:00Z',
    options: [
      { id: 'opt-26-a', option_label: 'A', content: 'Poros Engkol (Crankshaft) dengan Poros Nok (Camshaft)', is_correct: true },
      { id: 'opt-26-b', option_label: 'B', content: 'Poros Nok dengan Poros Propeller Gardan', is_correct: false },
      { id: 'opt-26-c', option_label: 'C', content: 'Poros Engkol dengan Alternator Pengisian Aki', is_correct: false },
      { id: 'opt-26-d', option_label: 'D', content: 'Piston Silinder 1 dengan Silinder 4', is_correct: false }
    ]
  },
  {
    id: 'q-27',
    bank_id: 'bank-02',
    material_id: 'mat-06',
    question_type: 'pilihan_ganda',
    content: 'Gejala ketukan (knocking / detonasi) pada mesin bensin yang berbunyi seperti logam beradu saat pedal gas ditekan umumnya terjadi karena ...',
    explanation: 'Knocking terjadi akibat pembakaran spontan campuran bahan bakar sebelum busi memercikkan api karena nilai oktan bahan bakar terlalu rendah.',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Menganalisis fenomena knocking dan nilai oktan bahan bakar',
    created_at: '2024-08-08T16:30:00Z',
    options: [
      { id: 'opt-27-a', option_label: 'A', content: 'Penggunaan bahan bakar dengan nilai oktan (RON) yang terlalu rendah dari spesifikasi kompresi mesin', is_correct: true },
      { id: 'opt-27-b', option_label: 'B', content: 'Kandungan oli mesin yang terlalu penuh melebihi batas F', is_correct: false },
      { id: 'opt-27-c', option_label: 'C', content: 'Suhu air radiator yang terlalu dingin di bawah 40°C', is_correct: false },
      { id: 'opt-27-d', option_label: 'D', content: 'Kopling kendaraan yang mengalami selip saat menanjak', is_correct: false }
    ]
  },
  {
    id: 'q-28',
    bank_id: 'bank-02',
    material_id: 'mat-07',
    question_type: 'pilihan_ganda',
    content: 'Pompa oli (oil pump) tipe trochoid atau gear pada sistem pelumasan mesin kendaraan umumnya digerakkan secara langsung oleh putaran ...',
    explanation: 'Pompa oli diputar langsung oleh Poros Engkol (Crankshaft) atau melalui perantara poros nok untuk mensirkulasikan pelumas bertekanan.',
    weight: 2.0,
    difficulty: 'sedang',
    competency: 'Memahami mekanisme penggerak pompa oli mesin',
    created_at: '2024-08-08T16:45:00Z',
    options: [
      { id: 'opt-28-a', option_label: 'A', content: 'Poros Engkol (Crankshaft)', is_correct: true },
      { id: 'opt-28-b', option_label: 'B', content: 'Motor Dinamo Starter Listrik', is_correct: false },
      { id: 'opt-28-c', option_label: 'C', content: 'Kipas Radiator Pendingin', is_correct: false },
      { id: 'opt-28-d', option_label: 'D', content: 'Roda Roda Depan Kendaraan', is_correct: false }
    ]
  }
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
  },
  {
    id: 'exam-01',
    title: 'STS Gambar Teknik Otomotif Kelas X (Cadangan)',
    assessment_type_id: 'eval-01',
    subject_id: 'subj-01',
    class_id: 'all',
    teacher_id: 'teacher-01',
    academic_year: '2024/2025',
    semester: 'Ganjil',
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
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
  },
  {
    id: 'exam-02',
    title: 'SAS Konversi Energi XI TKR',
    assessment_type_id: 'eval-02',
    subject_id: 'subj-02',
    class_id: 'cls-tkr-2',
    teacher_id: 'teacher-01',
    academic_year: '2024/2025',
    semester: 'Ganjil',
    start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    duration_minutes: 90,
    question_count: 25,
    kkm: 75,
    randomize_questions: true,
    randomize_options: true,
    allow_backward: true,
    fullscreen_mode: true,
    single_attempt: true,
    show_results_immediately: false,
    show_explanation: false,
    pin_code: 'NC5NZ',
    status: 'active',
    assessment_type: INITIAL_ASSESSMENT_TYPES[1],
    subject: INITIAL_SUBJECTS[1],
    class: INITIAL_CLASSES[1],
    questions: INITIAL_QUESTIONS.filter(q => q.bank_id === 'bank-02')
  },
  {
    id: 'exam-04',
    title: 'STS Dasar Konversi TKR (XII TKR)',
    assessment_type_id: 'eval-01',
    subject_id: 'subj-02',
    class_id: 'cls-tkr-1-03',
    teacher_id: 'teacher-01',
    academic_year: '2024/2025',
    semester: 'Ganjil',
    start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    duration_minutes: 90,
    question_count: 25,
    kkm: 75,
    randomize_questions: true,
    randomize_options: true,
    allow_backward: true,
    fullscreen_mode: true,
    single_attempt: true,
    show_results_immediately: false,
    show_explanation: false,
    pin_code: 'NC5NZ',
    status: 'active',
    assessment_type: INITIAL_ASSESSMENT_TYPES[0],
    subject: INITIAL_SUBJECTS[1],
    class: INITIAL_CLASSES[2],
    questions: INITIAL_QUESTIONS.filter(q => q.bank_id === 'bank-02')
  },
  {
    id: 'exam-03',
    title: 'Ulangan Harian Motor Bakar X TKR',
    assessment_type_id: 'eval-03',
    subject_id: 'subj-02',
    class_id: 'cls-tkr-2-03',
    teacher_id: 'teacher-01',
    academic_year: '2024/2025',
    semester: 'Ganjil',
    start_time: '2024-09-01T08:00:00Z',
    end_time: '2024-09-01T10:00:00Z',
    duration_minutes: 60,
    question_count: 4,
    kkm: 75,
    randomize_questions: false,
    randomize_options: false,
    allow_backward: true,
    fullscreen_mode: true,
    single_attempt: true,
    show_results_immediately: true,
    show_explanation: true,
    pin_code: 'UH750',
    status: 'finished',
    assessment_type: INITIAL_ASSESSMENT_TYPES[2],
    subject: INITIAL_SUBJECTS[1],
    class: INITIAL_CLASSES[3],
    questions: [INITIAL_QUESTIONS[1], INITIAL_QUESTIONS[3], INITIAL_QUESTIONS[4], INITIAL_QUESTIONS[5]]
  }
];

// Participants & Events: kosong — siswa diimport via Excel
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
