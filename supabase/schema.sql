-- ========================================================
-- MITRA CBT: DIGITAL ASSESSMENT SYSTEM FOR SMK
-- Complete Supabase PostgreSQL Schema with RLS & Functions
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Pengguna sistem: Admin, Guru, Siswa)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'siswa')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes (Kelas SMK: contoh X TKR 1, X TKR 2, XI TKR, XII TKR)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    grade TEXT NOT NULL, -- X, XI, XII
    major TEXT NOT NULL, -- TKR, TKJ, RPL, TPM, etc.
    academic_year TEXT NOT NULL, -- e.g. 2024/2025
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Teachers (Data Guru)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    nip TEXT UNIQUE,
    subject_specialty TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Students (Data Siswa)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    nis TEXT UNIQUE NOT NULL,
    nisn TEXT UNIQUE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subjects (Mata Pelajaran: Gambar Teknik, Konversi Energi, Pemeliharaan Mesin, dll.)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    major TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Subject Materials (Materi / KD per Mata Pelajaran)
CREATE TABLE IF NOT EXISTS public.subject_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Assessment Types (Jenis Evaluasi: STS, SAS, UH, Quiz, Remedial, Try Out, Ujian Teori, Ujian Praktik, Lainnya)
CREATE TABLE IF NOT EXISTS public.assessment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Question Banks (Bank Soal Pusat)
CREATE TABLE IF NOT EXISTS public.question_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Questions (Butir Soal)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id UUID NOT NULL REFERENCES public.question_banks(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.subject_materials(id) ON DELETE SET NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('pilihan_ganda', 'pg_kompleks', 'benar_salah', 'menjodohkan', 'isian_singkat')),
    content TEXT NOT NULL,
    image_url TEXT,
    explanation TEXT,
    weight NUMERIC(5,2) DEFAULT 1.00,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('mudah', 'sedang', 'sulit')),
    competency TEXT,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Question Options (Opsi Pilihan Jawaban)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_label TEXT NOT NULL, -- A, B, C, D, E
    content TEXT NOT NULL,
    image_url TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0
);

-- 11. Exams (Jadwal & Pengaturan Ujian)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    assessment_type_id UUID NOT NULL REFERENCES public.assessment_types(id),
    subject_id UUID NOT NULL REFERENCES public.subjects(id),
    class_id UUID NOT NULL REFERENCES public.classes(id),
    teacher_id UUID REFERENCES public.teachers(id),
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 90,
    question_count INT NOT NULL DEFAULT 40,
    kkm NUMERIC(5,2) NOT NULL DEFAULT 75.00,
    -- Exam Settings
    randomize_questions BOOLEAN DEFAULT TRUE,
    randomize_options BOOLEAN DEFAULT TRUE,
    allow_backward BOOLEAN DEFAULT TRUE,
    fullscreen_mode BOOLEAN DEFAULT TRUE,
    single_attempt BOOLEAN DEFAULT TRUE,
    show_results_immediately BOOLEAN DEFAULT FALSE,
    show_explanation BOOLEAN DEFAULT FALSE,
    pin_code VARCHAR(10) NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'finished')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Exam Questions (Pemetaan Soal ke Ujian)
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    order_index INT DEFAULT 0,
    UNIQUE(exam_id, question_id)
);

-- 13. Exam Participants (Peserta Ujian & Sesi Pengerjaan)
CREATE TABLE IF NOT EXISTS public.exam_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ,
    finish_time TIMESTAMPTZ,
    server_deadline TIMESTAMPTZ,
    remaining_seconds INT,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'force_submitted')),
    score NUMERIC(5,2) DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    tab_switch_count INT DEFAULT 0,
    cheat_warning_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- 14. Answers (Jawaban Peserta)
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES public.exam_participants(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_ids JSONB DEFAULT '[]'::jsonb,
    text_answer TEXT,
    is_marked_review BOOLEAN DEFAULT FALSE,
    is_correct BOOLEAN,
    points_earned NUMERIC(5,2) DEFAULT 0,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_id, question_id)
);

-- 15. Exam Events (Aktivitas & Anti-Cheating Log)
CREATE TABLE IF NOT EXISTS public.exam_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.exam_participants(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'LOGIN', 'START_EXAM', 'TAB_SWITCH', 'FULLSCREEN_EXIT', 
        'FULLSCREEN_ENTER', 'REFRESH', 'CONNECTION_LOST', 
        'CONNECTION_RESTORED', 'SUBMIT_EXAM', 'FORCE_SUBMIT'
    )),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Exam Results (Hasil & Rekap Nilai Ujian)
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.exam_participants(id) ON DELETE CASCADE,
    total_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    max_possible_score NUMERIC(5,2) NOT NULL DEFAULT 100,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    correct_count INT DEFAULT 0,
    wrong_count INT DEFAULT 0,
    unattempted_count INT DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    graded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_id)
);

-- 17. Remedial Exams (Relasi Ujian Asal & Ujian Remedial)
CREATE TABLE IF NOT EXISTS public.remedial_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    remedial_exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    kkm_threshold NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Audit Logs (Log Aktivitas Admin & Guru)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_questions_bank ON public.questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON public.exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_participants_exam ON public.exam_participants(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_participants_student ON public.exam_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_answers_participant ON public.answers(participant_id);
CREATE INDEX IF NOT EXISTS idx_exam_events_exam_part ON public.exam_events(exam_id, participant_id);

-- RLS setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remedial_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
