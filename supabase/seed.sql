-- ================================================================
-- MITRA CBT: COMPLETE SETUP SQL
-- Jalankan di Supabase → SQL Editor
-- Urutan: 1) schema.sql  →  2) file ini (seed_real.sql)
-- ================================================================

-- ── STEP 1: BERSIHKAN DATA LAMA (jika ada) ──────────────────────
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
-- JANGAN truncate profiles karena terhubung ke auth.users

-- ── STEP 2: JENIS PENILAIAN ─────────────────────────────────────
INSERT INTO public.assessment_types (id, name, code, description, is_default) VALUES
  ('11111111-1111-1111-1111-111111111001', 'Sumatif Tengah Semester',  'STS',      'Penilaian sumatif di pertengahan semester', true),
  ('11111111-1111-1111-1111-111111111002', 'Sumatif Akhir Semester',   'SAS',      'Penilaian sumatif di akhir semester untuk nilai raport', true),
  ('11111111-1111-1111-1111-111111111003', 'Ulangan Harian',           'UH',       'Evaluasi periodik per pokok bahasan/materi', true),
  ('11111111-1111-1111-1111-111111111004', 'Quiz',                     'QUIZ',     'Kuis cepat untuk pemahaman konsep harian', true),
  ('11111111-1111-1111-1111-111111111005', 'Remedial',                 'REMEDIAL', 'Ujian perbaikan bagi siswa yang belum mencapai KKM', true),
  ('11111111-1111-1111-1111-111111111006', 'Try Out',                  'TRYOUT',   'Simulasi ujian kelulusan atau sertifikasi kejuruan', true),
  ('11111111-1111-1111-1111-111111111007', 'Ujian Teori Praktik',      'UPT',      'Ujian teori pengantar praktik kejuruan di bengkel', true),
  ('11111111-1111-1111-1111-111111111008', 'Evaluasi Pembelajaran',    'EVAL',     'Evaluasi fleksibel guru', true)
ON CONFLICT (id) DO NOTHING;

-- ── STEP 3: KELAS (8 Jurusan × 3 Tingkat = 24 Kelas) ───────────
INSERT INTO public.classes (id, name, grade, major, academic_year) VALUES
  -- TKR (Teknik Kendaraan Ringan)
  ('cls-tkr-10-0000-000000000000', 'X TKR',   'X',   'TKR', '2024/2025'),
  ('cls-tkr-11-0000-000000000000', 'XI TKR',  'XI',  'TKR', '2024/2025'),
  ('cls-tkr-12-0000-000000000000', 'XII TKR', 'XII', 'TKR', '2024/2025'),
  -- Mesin (Teknik Pemesinan)
  ('cls-msn-10-0000-000000000000', 'X Mesin',   'X',   'Mesin', '2024/2025'),
  ('cls-msn-11-0000-000000000000', 'XI Mesin',  'XI',  'Mesin', '2024/2025'),
  ('cls-msn-12-0000-000000000000', 'XII Mesin', 'XII', 'Mesin', '2024/2025'),
  -- TSM (Teknik Sepeda Motor)
  ('cls-tsm-10-0000-000000000000', 'X TSM',   'X',   'TSM', '2024/2025'),
  ('cls-tsm-11-0000-000000000000', 'XI TSM',  'XI',  'TSM', '2024/2025'),
  ('cls-tsm-12-0000-000000000000', 'XII TSM', 'XII', 'TSM', '2024/2025'),
  -- Elind (Elektronika Industri)
  ('cls-eld-10-0000-000000000000', 'X Elind',   'X',   'Elind', '2024/2025'),
  ('cls-eld-11-0000-000000000000', 'XI Elind',  'XI',  'Elind', '2024/2025'),
  ('cls-eld-12-0000-000000000000', 'XII Elind', 'XII', 'Elind', '2024/2025'),
  -- Akuntansi
  ('cls-akt-10-0000-000000000000', 'X Akuntansi',   'X',   'Akuntansi', '2024/2025'),
  ('cls-akt-11-0000-000000000000', 'XI Akuntansi',  'XI',  'Akuntansi', '2024/2025'),
  ('cls-akt-12-0000-000000000000', 'XII Akuntansi', 'XII', 'Akuntansi', '2024/2025'),
  -- Listrik (Teknik Instalasi Tenaga Listrik)
  ('cls-ltr-10-0000-000000000000', 'X Listrik',   'X',   'Listrik', '2024/2025'),
  ('cls-ltr-11-0000-000000000000', 'XI Listrik',  'XI',  'Listrik', '2024/2025'),
  ('cls-ltr-12-0000-000000000000', 'XII Listrik', 'XII', 'Listrik', '2024/2025'),
  -- Hotel (Akomodasi Perhotelan)
  ('cls-htl-10-0000-000000000000', 'X Hotel',   'X',   'Hotel', '2024/2025'),
  ('cls-htl-11-0000-000000000000', 'XI Hotel',  'XI',  'Hotel', '2024/2025'),
  ('cls-htl-12-0000-000000000000', 'XII Hotel', 'XII', 'Hotel', '2024/2025'),
  -- TKI (Teknik Komputer dan Informatika)
  ('cls-tki-10-0000-000000000000', 'X TKI',   'X',   'TKI', '2024/2025'),
  ('cls-tki-11-0000-000000000000', 'XI TKI',  'XI',  'TKI', '2024/2025'),
  ('cls-tki-12-0000-000000000000', 'XII TKI', 'XII', 'TKI', '2024/2025')
ON CONFLICT (id) DO NOTHING;

-- ── STEP 4: MATA PELAJARAN ──────────────────────────────────────
INSERT INTO public.subjects (id, name, code, major, description) VALUES
  ('33333333-3333-3333-3333-333333333001', 'Gambar Teknik Mesin & Otomotif',       'GT-TKR',   'Teknik Otomotif', 'Standar gambar teknik, etiket, skala, proyeksi Eropa/Amerika, potongan, CAD'),
  ('33333333-3333-3333-3333-333333333002', 'Dasar Konversi Energi & Engine',        'DKE-TKR',  'Teknik Otomotif', 'Termodinamika motor bakar, siklus 2/4 langkah, mesin bensin dan diesel'),
  ('33333333-3333-3333-3333-333333333003', 'Pemeliharaan Mesin Kendaraan Ringan',   'PMKR-TKR', 'Teknik Otomotif', 'Tune-up, sistem pendinginan, pelumasan, bahan bakar EFI, mekanisme katup'),
  ('33333333-3333-3333-3333-333333333004', 'Matematika Terapan Kejuruan',           'MTK-SMK',  'Umum',            'Geometri, trigonometri, aljabar, dan kalkulasi mekanika teknik'),
  ('33333333-3333-3333-3333-333333333005', 'Bahasa Indonesia Kejuruan',             'BIN-SMK',  'Umum',            'Laporan kerja bengkel, SOP perbengkelan, dan komunikasi profesional')
ON CONFLICT (id) DO NOTHING;

-- ── STEP 5: MATERI AJAR ─────────────────────────────────────────
INSERT INTO public.subject_materials (id, subject_id, name, order_index) VALUES
  ('44444444-4444-4444-4444-444444444001', '33333333-3333-3333-3333-333333333001', 'Fungsi & Standarisasi Garis Gambar Teknik', 1),
  ('44444444-4444-4444-4444-444444444002', '33333333-3333-3333-3333-333333333001', 'Etiket Gambar & Skala Pengukuran (ISO)',     2),
  ('44444444-4444-4444-4444-444444444003', '33333333-3333-3333-3333-333333333001', 'Proyeksi Piktorial & Orthogonal',            3),
  ('44444444-4444-4444-4444-444444444004', '33333333-3333-3333-3333-333333333001', 'Potongan / Irisan dan Dimensi Toleransi',    4),
  ('44444444-4444-4444-4444-444444444005', '33333333-3333-3333-3333-333333333002', 'Prinsip Termodinamika & Motor Bakar',         1),
  ('44444444-4444-4444-4444-444444444006', '33333333-3333-3333-3333-333333333002', 'Siklus Kerja Mesin 4 Langkah (Otto & Diesel)',2),
  ('44444444-4444-4444-4444-444444444007', '33333333-3333-3333-3333-333333333002', 'Sistem Pelumasan, Pendinginan & Bahan Bakar', 3),
  ('44444444-4444-4444-4444-444444444008', '33333333-3333-3333-3333-333333333002', 'Efisiensi Volumetrik & Performa Engine',      4)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- STEP 6: AKUN GURU (Joko Setyo Nugroho, S.T.)
-- ================================================================
-- CATATAN PENTING:
-- Karena profiles.id berasal dari auth.users, Anda perlu membuat
-- user via Supabase Auth terlebih dahulu, lalu catat UUID-nya.
--
-- Cara buat user di Supabase:
--   Dashboard → Authentication → Users → "Add user"
--   Email: joko.setyo@mitracbt.id
--   Password: (buat sendiri yang aman)
--   Setelah dibuat, salin UUID yang muncul, ganti di bawah ini.
--
-- Ganti GANTI-DENGAN-UUID-AUTH-GURU dengan UUID dari auth.users
-- ================================================================

-- Contoh (ganti UUID sesuai hasil Auth):
/*
INSERT INTO public.profiles (id, email, full_name, role, phone) VALUES
  ('GANTI-DENGAN-UUID-AUTH-GURU',
   'joko.setyo@mitracbt.id',
   'Joko Setyo Nugroho, S.T.',
   'guru',
   '081234567890')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone     = EXCLUDED.phone;

INSERT INTO public.teachers (profile_id, nip, subject_specialty) VALUES
  ('GANTI-DENGAN-UUID-AUTH-GURU',
   '198506152010011012',
   'Teknik Mesin & Rekayasa Kejuruan')
ON CONFLICT (profile_id) DO NOTHING;
*/

-- ================================================================
-- STEP 7: RLS POLICIES (Row Level Security)
-- Jalankan SETELAH schema.sql, policies ini mengizinkan akses data
-- ================================================================

-- Allow authenticated users to read all public data
CREATE POLICY IF NOT EXISTS "Allow read for authenticated"
  ON public.classes FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Allow read assessment_types"
  ON public.assessment_types FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Allow read subjects"
  ON public.subjects FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Allow read materials"
  ON public.subject_materials FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Allow read teachers"
  ON public.teachers FOR SELECT TO authenticated USING (true);

-- Profiles: user bisa baca profil sendiri, admin/guru bisa semua
CREATE POLICY IF NOT EXISTS "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Admin/Guru can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'guru')
    )
  );

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Students: admin/guru bisa baca semua
CREATE POLICY IF NOT EXISTS "Admin/Guru can manage students"
  ON public.students FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'guru')
    )
  );

CREATE POLICY IF NOT EXISTS "Student can read own data"
  ON public.students FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
  );

-- Exams: semua authenticated bisa baca
CREATE POLICY IF NOT EXISTS "Allow read exams"
  ON public.exams FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Guru/Admin can manage exams"
  ON public.exams FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'guru')
    )
  );

-- Questions
CREATE POLICY IF NOT EXISTS "Allow read questions"
  ON public.questions FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Allow read question options"
  ON public.question_options FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Allow read question banks"
  ON public.question_banks FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Guru/Admin can manage question banks"
  ON public.question_banks FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'guru')
    )
  );

-- Exam Participants
CREATE POLICY IF NOT EXISTS "Siswa can read own participation"
  ON public.exam_participants FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Guru/Admin can read all participants"
  ON public.exam_participants FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'guru')
    )
  );

CREATE POLICY IF NOT EXISTS "Siswa can insert/update own participation"
  ON public.exam_participants FOR ALL TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE profile_id = auth.uid()
    )
  );

-- Answers
CREATE POLICY IF NOT EXISTS "Siswa can manage own answers"
  ON public.answers FOR ALL TO authenticated
  USING (
    participant_id IN (
      SELECT ep.id FROM public.exam_participants ep
      JOIN public.students s ON s.id = ep.student_id
      WHERE s.profile_id = auth.uid()
    )
  );

-- Exam Events
CREATE POLICY IF NOT EXISTS "Insert exam events"
  ON public.exam_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Read exam events for guru/admin"
  ON public.exam_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'guru')
    )
  );

-- Exam Results
CREATE POLICY IF NOT EXISTS "Read own exam results"
  ON public.exam_results FOR SELECT TO authenticated USING (true);

-- Audit Logs
CREATE POLICY IF NOT EXISTS "Admin can read audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'guru')
    )
  );

CREATE POLICY IF NOT EXISTS "Allow insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ================================================================
-- SELESAI!
-- Selanjutnya:
--   1. Buat user guru via Supabase Auth → Authentication → Users
--   2. Salin UUID, uncomment dan jalankan bagian STEP 6 di atas
--   3. Import siswa via fitur "Import Excel" di aplikasi
-- ================================================================
