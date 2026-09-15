import { 
  Profile, ClassRoom, Teacher, Student, Subject, SubjectMaterial, 
  AssessmentType, QuestionBank, Question, Exam, ExamParticipant, 
  Answer, ExamResult, AuditLog, ExamEvent 
} from '../types';

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

// Pre-seeded Demo Profiles
export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-admin-01',
    email: 'admin@mitracbt.id',
    full_name: 'Bambang Sudiro, S.T.',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    phone: '081234567890',
    created_at: '2024-07-01T08:00:00Z'
  },
  {
    id: 'user-guru-01',
    email: 'guru@mitracbt.id',
    full_name: 'Hartono, S.Pd., M.T.',
    role: 'guru',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '081298765432',
    created_at: '2024-07-01T08:30:00Z'
  },
  {
    id: 'user-siswa-01',
    email: 'siswa@mitracbt.id',
    full_name: 'Andi Prasetyo',
    role: 'siswa',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    phone: '085711223344',
    created_at: '2024-07-15T09:00:00Z'
  },
  {
    id: 'user-siswa-02',
    email: 'budi@mitracbt.id',
    full_name: 'Budi Santoso',
    role: 'siswa',
    phone: '085711223345',
    created_at: '2024-07-15T09:00:00Z'
  },
  {
    id: 'user-siswa-03',
    email: 'candra@mitracbt.id',
    full_name: 'Candra Wijaya',
    role: 'siswa',
    phone: '085711223346',
    created_at: '2024-07-15T09:00:00Z'
  },
  {
    id: 'user-siswa-04',
    email: 'deni@mitracbt.id',
    full_name: 'Deni Saputra',
    role: 'siswa',
    phone: '085711223347',
    created_at: '2024-07-15T09:00:00Z'
  },
  {
    id: 'user-siswa-05',
    email: 'eko@mitracbt.id',
    full_name: 'Eko Kurniawan',
    role: 'siswa',
    phone: '085711223348',
    created_at: '2024-07-15T09:00:00Z'
  }
];

export const INITIAL_CLASSES: ClassRoom[] = [
  { id: 'class-01', name: 'X TKR 1', grade: 'X', major: 'Teknik Kendaraan Ringan Otomotif', academic_year: '2024/2025' },
  { id: 'class-02', name: 'X TKR 2', grade: 'X', major: 'Teknik Kendaraan Ringan Otomotif', academic_year: '2024/2025' },
  { id: 'class-03', name: 'XI TKR', grade: 'XI', major: 'Teknik Kendaraan Ringan Otomotif', academic_year: '2024/2025' },
  { id: 'class-04', name: 'XII TKR', grade: 'XII', major: 'Teknik Kendaraan Ringan Otomotif', academic_year: '2024/2025' }
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 'student-01', profile_id: 'user-siswa-01', nis: '20241001', nisn: '0071234561', class_id: 'class-02', status: 'active', profile: INITIAL_PROFILES[2], class: INITIAL_CLASSES[1] },
  { id: 'student-02', profile_id: 'user-siswa-02', nis: '20241002', nisn: '0071234562', class_id: 'class-02', status: 'active', profile: INITIAL_PROFILES[3], class: INITIAL_CLASSES[1] },
  { id: 'student-03', profile_id: 'user-siswa-03', nis: '20241003', nisn: '0071234563', class_id: 'class-02', status: 'active', profile: INITIAL_PROFILES[4], class: INITIAL_CLASSES[1] },
  { id: 'student-04', profile_id: 'user-siswa-04', nis: '20241004', nisn: '0071234564', class_id: 'class-02', status: 'active', profile: INITIAL_PROFILES[5], class: INITIAL_CLASSES[1] },
  { id: 'student-05', profile_id: 'user-siswa-05', nis: '20241005', nisn: '0071234565', class_id: 'class-02', status: 'active', profile: INITIAL_PROFILES[6], class: INITIAL_CLASSES[1] }
];

export const INITIAL_TEACHERS: Teacher[] = [
  { id: 'teacher-01', profile_id: 'user-guru-01', nip: '197905142005011003', subject_specialty: 'Teknik Otomotif & Gambar Teknik', profile: INITIAL_PROFILES[1] }
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
    created_at: '2024-08-01T08:00:00Z',
    question_count: 5
  },
  {
    id: 'bank-02',
    teacher_id: 'teacher-01',
    subject_id: 'subj-02',
    title: 'Bank Soal Motor Bakar & Dasar Konversi Energi Engine',
    description: 'Kumpulan butir soal termodinamika mesin, siklus motor 4-tak & 2-tak, dan sistem penunjang engine.',
    created_at: '2024-08-05T09:00:00Z',
    question_count: 5
  }
];

export const INITIAL_QUESTIONS: Question[] = [
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
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-01',
    title: 'STS Gambar Teknik X TKR 2',
    assessment_type_id: 'eval-01',
    subject_id: 'subj-01',
    class_id: 'class-02',
    teacher_id: 'teacher-01',
    academic_year: '2024/2025',
    semester: 'Ganjil',
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    duration_minutes: 90,
    question_count: 4,
    kkm: 75,
    randomize_questions: true,
    randomize_options: true,
    allow_backward: true,
    fullscreen_mode: true,
    single_attempt: true,
    show_results_immediately: true,
    show_explanation: true,
    pin_code: 'GT902',
    status: 'active',
    assessment_type: INITIAL_ASSESSMENT_TYPES[0],
    subject: INITIAL_SUBJECTS[0],
    class: INITIAL_CLASSES[1],
    questions: [INITIAL_QUESTIONS[0], INITIAL_QUESTIONS[2], INITIAL_QUESTIONS[6]]
  },
  {
    id: 'exam-02',
    title: 'SAS Konversi Energi X TKR 2',
    assessment_type_id: 'eval-02',
    subject_id: 'subj-02',
    class_id: 'class-02',
    teacher_id: 'teacher-01',
    academic_year: '2024/2025',
    semester: 'Ganjil',
    start_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    duration_minutes: 90,
    question_count: 5,
    kkm: 75,
    randomize_questions: true,
    randomize_options: true,
    allow_backward: true,
    fullscreen_mode: true,
    single_attempt: true,
    show_results_immediately: false,
    show_explanation: false,
    pin_code: 'ENG40',
    status: 'scheduled',
    assessment_type: INITIAL_ASSESSMENT_TYPES[1],
    subject: INITIAL_SUBJECTS[1],
    class: INITIAL_CLASSES[1],
    questions: [INITIAL_QUESTIONS[1], INITIAL_QUESTIONS[3], INITIAL_QUESTIONS[4], INITIAL_QUESTIONS[5], INITIAL_QUESTIONS[7]]
  },
  {
    id: 'exam-03',
    title: 'Ulangan Harian Motor Bakar X TKR 2',
    assessment_type_id: 'eval-03',
    subject_id: 'subj-02',
    class_id: 'class-02',
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
    class: INITIAL_CLASSES[1],
    questions: [INITIAL_QUESTIONS[1], INITIAL_QUESTIONS[3], INITIAL_QUESTIONS[4], INITIAL_QUESTIONS[5]]
  }
];

export const INITIAL_PARTICIPANTS: ExamParticipant[] = [
  {
    id: 'part-01',
    exam_id: 'exam-01',
    student_id: 'student-01', // Andi Prasetyo
    status: 'not_started',
    tab_switch_count: 0,
    cheat_warning_count: 0,
    remaining_seconds: 90 * 60,
    student: INITIAL_STUDENTS[0],
    exam: INITIAL_EXAMS[0]
  },
  {
    id: 'part-02',
    exam_id: 'exam-01',
    student_id: 'student-02', // Budi Santoso
    status: 'in_progress',
    tab_switch_count: 1,
    cheat_warning_count: 1,
    remaining_seconds: 45 * 60,
    student: INITIAL_STUDENTS[1],
    exam: INITIAL_EXAMS[0]
  },
  {
    id: 'part-03',
    exam_id: 'exam-01',
    student_id: 'student-03', // Candra Wijaya
    status: 'submitted',
    score: 87.5,
    passed: true,
    tab_switch_count: 0,
    cheat_warning_count: 0,
    remaining_seconds: 0,
    student: INITIAL_STUDENTS[2],
    exam: INITIAL_EXAMS[0]
  },
  {
    id: 'part-04',
    exam_id: 'exam-01',
    student_id: 'student-04', // Deni Saputra
    status: 'in_progress',
    tab_switch_count: 4,
    cheat_warning_count: 3,
    remaining_seconds: 22 * 60,
    student: INITIAL_STUDENTS[3],
    exam: INITIAL_EXAMS[0]
  },
  {
    id: 'part-05',
    exam_id: 'exam-01',
    student_id: 'student-05', // Eko Kurniawan
    status: 'not_started',
    tab_switch_count: 0,
    cheat_warning_count: 0,
    remaining_seconds: 90 * 60,
    student: INITIAL_STUDENTS[4],
    exam: INITIAL_EXAMS[0]
  }
];

export const INITIAL_EVENTS: ExamEvent[] = [
  {
    id: 'ev-01',
    exam_id: 'exam-01',
    participant_id: 'part-02',
    event_type: 'START_EXAM',
    details: { browser: 'Chrome 128 (Chromebook)' },
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    participant_name: 'Budi Santoso'
  },
  {
    id: 'ev-02',
    exam_id: 'exam-01',
    participant_id: 'part-04',
    event_type: 'TAB_SWITCH',
    details: { reason: 'Siswa berpindah jendela / tab browser' },
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    participant_name: 'Deni Saputra'
  },
  {
    id: 'ev-03',
    exam_id: 'exam-01',
    participant_id: 'part-04',
    event_type: 'FULLSCREEN_EXIT',
    details: { reason: 'Keluar dari mode layar penuh (fullscreen)' },
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    participant_name: 'Deni Saputra'
  },
  {
    id: 'ev-04',
    exam_id: 'exam-01',
    participant_id: 'part-03',
    event_type: 'SUBMIT_EXAM',
    details: { answered: 3, total: 3, finish_time: '25m 10s' },
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    participant_name: 'Candra Wijaya'
  }
];

export const INITIAL_EXAM_RESULTS: ExamResult[] = [
  {
    id: 'res-01',
    exam_id: 'exam-03',
    participant_id: 'part-03',
    total_score: 87.5,
    max_possible_score: 100,
    percentage: 87.5,
    correct_count: 3,
    wrong_count: 1,
    unattempted_count: 0,
    passed: true,
    graded_at: '2024-09-01T10:00:00Z',
    participant: INITIAL_PARTICIPANTS[2]
  },
  {
    id: 'res-02',
    exam_id: 'exam-03',
    participant_id: 'part-02',
    total_score: 65.0,
    max_possible_score: 100,
    percentage: 65.0,
    correct_count: 2,
    wrong_count: 2,
    unattempted_count: 0,
    passed: false, // Perlu remedial (KKM 75)
    graded_at: '2024-09-01T10:00:00Z',
    participant: INITIAL_PARTICIPANTS[1]
  },
  {
    id: 'res-03',
    exam_id: 'exam-03',
    participant_id: 'part-04',
    total_score: 60.0,
    max_possible_score: 100,
    percentage: 60.0,
    correct_count: 2,
    wrong_count: 2,
    unattempted_count: 0,
    passed: false, // Perlu remedial (KKM 75)
    graded_at: '2024-09-01T10:00:00Z',
    participant: INITIAL_PARTICIPANTS[3]
  },
  {
    id: 'res-04',
    exam_id: 'exam-03',
    participant_id: 'part-01',
    total_score: 92.5,
    max_possible_score: 100,
    percentage: 92.5,
    correct_count: 4,
    wrong_count: 0,
    unattempted_count: 0,
    passed: true,
    graded_at: '2024-09-01T10:00:00Z',
    participant: INITIAL_PARTICIPANTS[0]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-01',
    user_id: 'user-admin-01',
    user_name: 'Bambang S. (Admin)',
    action: 'CREATE_EXAM',
    entity_type: 'exam',
    entity_id: 'exam-01',
    details: { exam_title: 'STS Gambar Teknik X TKR 2', pin: 'GT902' },
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'audit-02',
    user_id: 'user-guru-01',
    user_name: 'Hartono, S.Pd. (Guru)',
    action: 'CREATE_QUESTION',
    entity_type: 'question',
    entity_id: 'q-01',
    details: { subject: 'Gambar Teknik', topic: 'Proyeksi Ortogonal' },
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'audit-03',
    user_id: 'user-admin-01',
    user_name: 'Bambang S. (Admin)',
    action: 'IMPORT_STUDENTS',
    entity_type: 'student',
    details: { count: 36, class_name: 'X TKR 2' },
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  }
];
