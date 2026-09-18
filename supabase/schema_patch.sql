-- ================================================================
-- MITRA CBT — Patch tambahan di atas schema.sql & seed.sql
--
-- 1. Kolom target_grades (dipakai fitur "Target Tingkat Kelas" di
--    Bank Soal & Soal — sudah ada di UI tapi belum ada di schema.sql).
-- 2. Kelas "Semua Kelas" (sentinel, dipakai saat ujian dibuat untuk
--    semua kelas sekaligus — lihat ALL_CLASSES_ID di src/types/index.ts).
-- 3. Kelas asli yang sungguh dipakai sekolah ini (X TKR 1, X TKR 2,
--    X TKR 1 03, X TKR 2 03) — beda dari daftar kelas generik di
--    seed.sql, jadi ditambahkan eksplisit di sini supaya tetap ada
--    apa pun isi seed.sql.
--
-- Jalankan SETELAH schema.sql & seed.sql, di: Supabase → SQL Editor
-- Idempotent: aman dijalankan berulang kali.
-- ================================================================

ALTER TABLE public.question_banks ADD COLUMN IF NOT EXISTS target_grades TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.questions      ADD COLUMN IF NOT EXISTS target_grades TEXT[] DEFAULT '{}'::text[];

-- profiles.id di schema.sql mengharuskan setiap profile punya baris di
-- auth.users (FK ke Supabase Auth). Karena aplikasi ini TIDAK memakai
-- Supabase Auth (login guru/admin/siswa custom di level aplikasi), FK ini
-- akan menggagalkan import siswa & login tamu siswa (mereka tidak pernah
-- punya baris auth.users). Lepas FK-nya dan jadikan profiles tabel mandiri.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- profiles.role di schema.sql tidak mencakup 'pengawas' (dipakai role
-- Pengawas Ujian di App.tsx/Sidebar/Navbar) — tambahkan, lalu seed satu
-- akun pengawas seperti yang sebelumnya ada di mock data.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'guru', 'siswa', 'pengawas'));

INSERT INTO public.profiles (id, email, full_name, role, phone, created_at) VALUES
  ('a0000001-beef-beef-beef-000000000003', 'pengawas@mitracbt.id', 'Pengawas Ruangan', 'pengawas', '081234567892', NOW())
ON CONFLICT (id) DO UPDATE SET
  email     = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role      = EXCLUDED.role,
  phone     = EXCLUDED.phone;

-- exam_events.event_type CHECK di schema.sql tidak mencakup
-- 'MULTI_SCREEN_SPLIT' & 'VOICE_AI_DETECTED' yang dipakai fitur anti-cheat
-- (deteksi multi-monitor & suara AI) di StudentExamRoom.tsx — tambahkan.
ALTER TABLE public.exam_events DROP CONSTRAINT IF EXISTS exam_events_event_type_check;
ALTER TABLE public.exam_events ADD CONSTRAINT exam_events_event_type_check CHECK (event_type IN (
  'LOGIN', 'START_EXAM', 'TAB_SWITCH', 'FULLSCREEN_EXIT',
  'FULLSCREEN_ENTER', 'MULTI_SCREEN_SPLIT', 'VOICE_AI_DETECTED', 'REFRESH',
  'CONNECTION_LOST', 'CONNECTION_RESTORED', 'SUBMIT_EXAM', 'FORCE_SUBMIT'
));

INSERT INTO public.classes (id, name, grade, major, academic_year) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Semua Kelas', 'Semua', 'Semua', '2024/2025'),
  ('c1000000-0000-0000-0000-000000000001', 'X TKR 1',     'X',     'TKR',   '2024/2025'),
  ('c1000000-0000-0000-0000-000000000002', 'X TKR 2',     'X',     'TKR',   '2024/2025'),
  ('c1000000-0000-0000-0000-000000000003', 'X TKR 1 03',  'X',     'TKR',   '2024/2025'),
  ('c1000000-0000-0000-0000-000000000004', 'X TKR 2 03',  'X',     'TKR',   '2024/2025')
ON CONFLICT (id) DO UPDATE SET
  name          = EXCLUDED.name,
  grade         = EXCLUDED.grade,
  major         = EXCLUDED.major,
  academic_year = EXCLUDED.academic_year;
