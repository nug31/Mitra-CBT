-- ================================================================
-- MITRA CBT — SETUP LENGKAP DATABASE SUPABASE
-- Jalankan SATU KALI di: Supabase → SQL Editor → New Query
-- ================================================================

-- Aktifkan extension yang dibutuhkan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 0. PASTIKAN CONSTRAINT UNIQUE PADA PROFILE_ID ─────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teachers_profile_id_key'
  ) THEN
    BEGIN
      ALTER TABLE public.teachers ADD CONSTRAINT teachers_profile_id_key UNIQUE (profile_id);
    EXCEPTION
      WHEN duplicate_table OR duplicate_object THEN NULL;
      WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_profile_id_key'
  ) THEN
    BEGIN
      ALTER TABLE public.students ADD CONSTRAINT students_profile_id_key UNIQUE (profile_id);
    EXCEPTION
      WHEN duplicate_table OR duplicate_object THEN NULL;
      WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ── BERSIHKAN DATA LAMA (aman dijalankan ulang) ─────────────────
TRUNCATE public.audit_logs          CASCADE;
TRUNCATE public.exam_results        CASCADE;
TRUNCATE public.exam_events         CASCADE;
TRUNCATE public.answers             CASCADE;
TRUNCATE public.exam_participants   CASCADE;
TRUNCATE public.exam_questions      CASCADE;
TRUNCATE public.exams               CASCADE;
TRUNCATE public.question_options    CASCADE;
TRUNCATE public.questions           CASCADE;
TRUNCATE public.question_banks      CASCADE;
TRUNCATE public.subject_materials   CASCADE;
TRUNCATE public.subjects            CASCADE;
TRUNCATE public.assessment_types    CASCADE;
TRUNCATE public.students            CASCADE;
TRUNCATE public.teachers            CASCADE;
TRUNCATE public.classes             CASCADE;

-- ── 1. JENIS PENILAIAN ──────────────────────────────────────────
INSERT INTO public.assessment_types (id, name, code, description, is_default) VALUES
  ('11111111-1111-1111-1111-111111111001', 'Sumatif Tengah Semester',  'STS',      'Penilaian sumatif di pertengahan semester', true),
  ('11111111-1111-1111-1111-111111111002', 'Sumatif Akhir Semester',   'SAS',      'Penilaian sumatif di akhir semester untuk nilai raport', true),
  ('11111111-1111-1111-1111-111111111003', 'Ulangan Harian',           'UH',       'Evaluasi periodik per pokok bahasan/materi', true),
  ('11111111-1111-1111-1111-111111111004', 'Quiz',                     'QUIZ',     'Kuis cepat untuk pemahaman konsep harian', true),
  ('11111111-1111-1111-1111-111111111005', 'Remedial',                 'REMEDIAL', 'Ujian perbaikan bagi siswa yang belum mencapai KKM', true),
  ('11111111-1111-1111-1111-111111111006', 'Try Out',                  'TRYOUT',   'Simulasi ujian kelulusan atau sertifikasi kejuruan', true),
  ('11111111-1111-1111-1111-111111111007', 'Ujian Teori Praktik',      'UPT',      'Ujian teori pengantar praktik kejuruan di bengkel', true),
  ('11111111-1111-1111-1111-111111111008', 'Evaluasi Pembelajaran',    'EVAL',     'Evaluasi pembelajaran fleksibel', true)
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  code        = EXCLUDED.code,
  description = EXCLUDED.description,
  is_default  = EXCLUDED.is_default;

-- ── 2. KELAS (8 Jurusan × 3 Tingkat = 24 Kelas) ────────────────
-- Jurusan: TKR, Mesin, TSM, Elind, Akuntansi, Listrik, Hotel, TKI
INSERT INTO public.classes (id, name, grade, major, academic_year) VALUES
  -- TKR
  ('c0000001-0000-0000-0000-000000000001', 'X TKR',         'X',   'TKR',       '2024/2025'),
  ('c0000001-0000-0000-0000-000000000002', 'XI TKR',        'XI',  'TKR',       '2024/2025'),
  ('c0000001-0000-0000-0000-000000000003', 'XII TKR',       'XII', 'TKR',       '2024/2025'),
  -- Mesin
  ('c0000002-0000-0000-0000-000000000001', 'X Mesin',       'X',   'Mesin',     '2024/2025'),
  ('c0000002-0000-0000-0000-000000000002', 'XI Mesin',      'XI',  'Mesin',     '2024/2025'),
  ('c0000002-0000-0000-0000-000000000003', 'XII Mesin',     'XII', 'Mesin',     '2024/2025'),
  -- TSM
  ('c0000003-0000-0000-0000-000000000001', 'X TSM',         'X',   'TSM',       '2024/2025'),
  ('c0000003-0000-0000-0000-000000000002', 'XI TSM',        'XI',  'TSM',       '2024/2025'),
  ('c0000003-0000-0000-0000-000000000003', 'XII TSM',       'XII', 'TSM',       '2024/2025'),
  -- Elind
  ('c0000004-0000-0000-0000-000000000001', 'X Elind',       'X',   'Elind',     '2024/2025'),
  ('c0000004-0000-0000-0000-000000000002', 'XI Elind',      'XI',  'Elind',     '2024/2025'),
  ('c0000004-0000-0000-0000-000000000003', 'XII Elind',     'XII', 'Elind',     '2024/2025'),
  -- Akuntansi
  ('c0000005-0000-0000-0000-000000000001', 'X Akuntansi',   'X',   'Akuntansi', '2024/2025'),
  ('c0000005-0000-0000-0000-000000000002', 'XI Akuntansi',  'XI',  'Akuntansi', '2024/2025'),
  ('c0000005-0000-0000-0000-000000000003', 'XII Akuntansi', 'XII', 'Akuntansi', '2024/2025'),
  -- Listrik
  ('c0000006-0000-0000-0000-000000000001', 'X Listrik',     'X',   'Listrik',   '2024/2025'),
  ('c0000006-0000-0000-0000-000000000002', 'XI Listrik',    'XI',  'Listrik',   '2024/2025'),
  ('c0000006-0000-0000-0000-000000000003', 'XII Listrik',   'XII', 'Listrik',   '2024/2025'),
  -- Hotel
  ('c0000007-0000-0000-0000-000000000001', 'X Hotel',       'X',   'Hotel',     '2024/2025'),
  ('c0000007-0000-0000-0000-000000000002', 'XI Hotel',      'XI',  'Hotel',     '2024/2025'),
  ('c0000007-0000-0000-0000-000000000003', 'XII Hotel',     'XII', 'Hotel',     '2024/2025'),
  -- TKI
  ('c0000008-0000-0000-0000-000000000001', 'X TKI',         'X',   'TKI',       '2024/2025'),
  ('c0000008-0000-0000-0000-000000000002', 'XI TKI',        'XI',  'TKI',       '2024/2025'),
  ('c0000008-0000-0000-0000-000000000003', 'XII TKI',       'XII', 'TKI',       '2024/2025')
ON CONFLICT (id) DO UPDATE SET
  name          = EXCLUDED.name,
  grade         = EXCLUDED.grade,
  major         = EXCLUDED.major,
  academic_year = EXCLUDED.academic_year;

-- ── 3. MATA PELAJARAN ───────────────────────────────────────────
INSERT INTO public.subjects (id, name, code, major, description) VALUES
  ('33333333-3333-3333-3333-333333333001', 'Gambar Teknik Mesin & Otomotif',     'GT-TKR',   'Teknik Otomotif', 'Standar gambar teknik, etiket, skala, proyeksi Eropa/Amerika, potongan, CAD'),
  ('33333333-3333-3333-3333-333333333002', 'Dasar Konversi Energi & Engine',      'DKE-TKR',  'Teknik Otomotif', 'Termodinamika motor bakar, siklus 2/4 langkah, mesin bensin dan diesel'),
  ('33333333-3333-3333-3333-333333333003', 'Pemeliharaan Mesin Kendaraan Ringan', 'PMKR-TKR', 'Teknik Otomotif', 'Tune-up, sistem pendinginan, pelumasan, bahan bakar EFI, mekanisme katup'),
  ('33333333-3333-3333-3333-333333333004', 'Matematika Terapan Kejuruan',         'MTK-SMK',  'Umum',            'Geometri, trigonometri, aljabar, dan kalkulasi mekanika teknik'),
  ('33333333-3333-3333-3333-333333333005', 'Bahasa Indonesia Kejuruan',           'BIN-SMK',  'Umum',            'Laporan kerja bengkel, SOP perbengkelan, dan komunikasi profesional')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  code        = EXCLUDED.code,
  major       = EXCLUDED.major,
  description = EXCLUDED.description;

-- ── 4. MATERI AJAR ──────────────────────────────────────────────
INSERT INTO public.subject_materials (id, subject_id, name, order_index) VALUES
  ('44444444-4444-4444-4444-444444444001', '33333333-3333-3333-3333-333333333001', 'Fungsi & Standarisasi Garis Gambar Teknik',    1),
  ('44444444-4444-4444-4444-444444444002', '33333333-3333-3333-3333-333333333001', 'Etiket Gambar & Skala Pengukuran (ISO)',         2),
  ('44444444-4444-4444-4444-444444444003', '33333333-3333-3333-3333-333333333001', 'Proyeksi Piktorial & Orthogonal (Eropa & Amerika)', 3),
  ('44444444-4444-4444-4444-444444444004', '33333333-3333-3333-3333-333333333001', 'Potongan / Irisan dan Dimensi Toleransi',       4),
  ('44444444-4444-4444-4444-444444444005', '33333333-3333-3333-3333-333333333002', 'Prinsip Termodinamika & Motor Bakar',            1),
  ('44444444-4444-4444-4444-444444444006', '33333333-3333-3333-3333-333333333002', 'Siklus Kerja Mesin 4 Langkah (Otto & Diesel)',   2),
  ('44444444-4444-4444-4444-444444444007', '33333333-3333-3333-3333-333333333002', 'Sistem Pelumasan, Pendinginan & Bahan Bakar',    3),
  ('44444444-4444-4444-4444-444444444008', '33333333-3333-3333-3333-333333333002', 'Efisiensi Volumetrik & Performa Engine',         4)
ON CONFLICT (id) DO UPDATE SET
  subject_id  = EXCLUDED.subject_id,
  name        = EXCLUDED.name,
  order_index = EXCLUDED.order_index;

-- ════════════════════════════════════════════════════════════════
-- 5. AKUN AUTH GURU & ADMIN (DIBUAT OTOMATIS BESERTA PASSWORD)
--
--    Akun Guru : joko.setyo@mitracbt.id / MitraSMK@2024
--    Akun Admin: admin@mitracbt.id      / MitraSMK@2024
-- ════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_guru_id   UUID := 'a0000001-beef-beef-beef-000000000001';
  v_admin_id  UUID := 'a0000001-beef-beef-beef-000000000002';
BEGIN

  -- ── Hapus user lama jika ada (agar idempotent dan bersih) ──────
  DELETE FROM auth.users WHERE email IN (
    'joko.setyo@mitracbt.id',
    'admin@mitracbt.id'
  );

  -- ── Buat user GURU di auth.users ──────────────────────────────
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_guru_id,
    '00000000-0000-0000-0000-000000000000',
    'joko.setyo@mitracbt.id',
    crypt('MitraSMK@2024', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Joko Setyo Nugroho, S.T.","role":"guru"}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
  );

  -- ── Buat user ADMIN di auth.users ─────────────────────────────
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@mitracbt.id',
    crypt('MitraSMK@2024', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Administrator","role":"admin"}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
  );

  -- ── Daftarkan di auth.identities jika tabel ada (untuk GoTrue) ──
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') THEN
    DELETE FROM auth.identities WHERE user_id IN (v_guru_id, v_admin_id);

    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES
        (
          v_guru_id::text,
          v_guru_id,
          format('{"sub":"%s","email":"%s"}', v_guru_id, 'joko.setyo@mitracbt.id')::jsonb,
          'email',
          v_guru_id::text,
          NOW(),
          NOW(),
          NOW()
        ),
        (
          v_admin_id::text,
          v_admin_id,
          format('{"sub":"%s","email":"%s"}', v_admin_id, 'admin@mitracbt.id')::jsonb,
          'email',
          v_admin_id::text,
          NOW(),
          NOW(),
          NOW()
        );
    EXCEPTION
      WHEN undefined_column THEN
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES
          (
            v_guru_id::text,
            v_guru_id,
            format('{"sub":"%s","email":"%s"}', v_guru_id, 'joko.setyo@mitracbt.id')::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
          ),
          (
            v_admin_id::text,
            v_admin_id,
            format('{"sub":"%s","email":"%s"}', v_admin_id, 'admin@mitracbt.id')::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
          );
      WHEN OTHERS THEN
        NULL;
    END;
  END IF;

  -- ── Profil GURU ───────────────────────────────────────────────
  INSERT INTO public.profiles (id, email, full_name, role, phone, created_at)
  VALUES (
    v_guru_id,
    'joko.setyo@mitracbt.id',
    'Joko Setyo Nugroho, S.T.',
    'guru',
    '081234567890',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role      = EXCLUDED.role,
    phone     = EXCLUDED.phone;

  -- ── Profil ADMIN ──────────────────────────────────────────────
  INSERT INTO public.profiles (id, email, full_name, role, phone, created_at)
  VALUES (
    v_admin_id,
    'admin@mitracbt.id',
    'Administrator',
    'admin',
    '081234567890',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role      = EXCLUDED.role,
    phone     = EXCLUDED.phone;

  -- ── Data Guru (NIP & Spesialisasi) ────────────────────────────
  -- Hapus dahulu bila ada berdasarkan profile_id atau nip agar tidak memicu 42P10
  DELETE FROM public.teachers WHERE profile_id = v_guru_id OR nip = '198506152010011012';

  INSERT INTO public.teachers (profile_id, nip, subject_specialty)
  VALUES (
    v_guru_id,
    '198506152010011012',
    'Teknik Mesin & Rekayasa Kejuruan'
  );

END $$;

-- ── 6. RLS POLICIES ─────────────────────────────────────────────

DROP POLICY IF EXISTS "read_classes"          ON public.classes;
DROP POLICY IF EXISTS "manage_classes"        ON public.classes;
DROP POLICY IF EXISTS "read_assessment_types" ON public.assessment_types;
DROP POLICY IF EXISTS "read_subjects"         ON public.subjects;
DROP POLICY IF EXISTS "read_materials"        ON public.subject_materials;
DROP POLICY IF EXISTS "read_teachers"         ON public.teachers;
DROP POLICY IF EXISTS "manage_teachers"       ON public.teachers;
DROP POLICY IF EXISTS "read_own_profile"      ON public.profiles;
DROP POLICY IF EXISTS "read_all_profiles"     ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile"    ON public.profiles;
DROP POLICY IF EXISTS "manage_profiles"       ON public.profiles;
DROP POLICY IF EXISTS "manage_students"       ON public.students;
DROP POLICY IF EXISTS "student_read_self"     ON public.students;
DROP POLICY IF EXISTS "read_exams"            ON public.exams;
DROP POLICY IF EXISTS "manage_exams"          ON public.exams;
DROP POLICY IF EXISTS "read_questions"        ON public.questions;
DROP POLICY IF EXISTS "read_options"          ON public.question_options;
DROP POLICY IF EXISTS "read_banks"            ON public.question_banks;
DROP POLICY IF EXISTS "manage_banks"          ON public.question_banks;
DROP POLICY IF EXISTS "participant_self"      ON public.exam_participants;
DROP POLICY IF EXISTS "participant_guru"      ON public.exam_participants;
DROP POLICY IF EXISTS "participant_dml"       ON public.exam_participants;
DROP POLICY IF EXISTS "answers_self"          ON public.answers;
DROP POLICY IF EXISTS "event_insert"          ON public.exam_events;
DROP POLICY IF EXISTS "event_guru"            ON public.exam_events;
DROP POLICY IF EXISTS "results_read"          ON public.exam_results;
DROP POLICY IF EXISTS "audit_read"            ON public.audit_logs;
DROP POLICY IF EXISTS "audit_insert"          ON public.audit_logs;

-- Data referensi: bisa dibaca semua user terautentikasi
CREATE POLICY "read_classes"          ON public.classes          FOR SELECT TO authenticated USING (true);
CREATE POLICY "manage_classes"        ON public.classes          FOR ALL    TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "read_assessment_types" ON public.assessment_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_subjects"         ON public.subjects         FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_materials"        ON public.subject_materials FOR SELECT TO authenticated USING (true);

-- Teachers: semua bisa baca, admin bisa kelola
CREATE POLICY "read_teachers"         ON public.teachers         FOR SELECT TO authenticated USING (true);
CREATE POLICY "manage_teachers"       ON public.teachers         FOR ALL    TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "read_questions"        ON public.questions        FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_options"          ON public.question_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_banks"            ON public.question_banks   FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_exams"            ON public.exams            FOR SELECT TO authenticated USING (true);
CREATE POLICY "results_read"          ON public.exam_results     FOR SELECT TO authenticated USING (true);

-- Profiles
CREATE POLICY "read_own_profile"   ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "read_all_profiles"  ON public.profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','guru')));
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "manage_profiles"    ON public.profiles FOR ALL    TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Students: admin/guru kelola semua, siswa baca diri sendiri
CREATE POLICY "manage_students"   ON public.students FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','guru')));
CREATE POLICY "student_read_self" ON public.students FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- Exams: guru/admin bisa kelola
CREATE POLICY "manage_exams" ON public.exams FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','guru')));

-- Question Banks: guru/admin kelola
CREATE POLICY "manage_banks" ON public.question_banks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','guru')));

-- Exam Participants
CREATE POLICY "participant_self" ON public.exam_participants FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid()));
CREATE POLICY "participant_guru" ON public.exam_participants FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','guru')));
CREATE POLICY "participant_dml"  ON public.exam_participants FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid()));

-- Answers
CREATE POLICY "answers_self" ON public.answers FOR ALL TO authenticated
  USING (participant_id IN (
    SELECT ep.id FROM public.exam_participants ep
    JOIN public.students s ON s.id = ep.student_id
    WHERE s.profile_id = auth.uid()
  ));

-- Exam Events
CREATE POLICY "event_insert" ON public.exam_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "event_guru"   ON public.exam_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','guru')));

-- Audit Logs
CREATE POLICY "audit_read"   ON public.audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','guru')));
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════
-- SELESAI ✅
--
-- RINGKASAN AKUN YANG DIBUAT:
-- ┌─────────────────────────────────────────────────────────────┐
-- │  GURU                                                       │
-- │  Email    : joko.setyo@mitracbt.id                         │
-- │  NIP      : 198506152010011012                              │
-- │  Password : MitraSMK@2024                                  │
-- │                                                             │
-- │  ADMIN                                                      │
-- │  Email    : admin@mitracbt.id                              │
-- │  Password : MitraSMK@2024                                  │
-- │                                                             │
-- │  Langkah selanjutnya:                                       │
-- │  → Import siswa via fitur Excel di aplikasi                 │
-- │  → Siswa login dengan NISN sebagai username & password      │
-- └─────────────────────────────────────────────────────────────┘
-- ════════════════════════════════════════════════════════════════
