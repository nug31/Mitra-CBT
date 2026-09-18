-- ================================================================
-- MITRA CBT — Buka akses penuh via anon key
--
-- Aplikasi ini TIDAK memakai Supabase Auth (login guru/admin/siswa
-- sepenuhnya custom di level aplikasi, lihat src/context/AuthContext.tsx),
-- sehingga policy RLS "TO authenticated" di seed.sql tidak akan pernah
-- match (tidak ada sesi auth.uid() sama sekali). Matikan RLS supaya
-- anon key bisa baca/tulis semua tabel — sama seperti perilaku
-- `profiles`/`classes` yang sudah berjalan hari ini.
--
-- PENTING: ini berarti anon key (di .env / VITE_SUPABASE_ANON_KEY)
-- setara akses penuh ke seluruh data sekolah (nilai, jawaban siswa, dst).
-- Jangan publikasikan repo ini secara publik, dan jangan share anon key
-- di luar tim internal.
--
-- Jalankan SETELAH schema.sql & seed.sql, di: Supabase → SQL Editor
-- Idempotent: aman dijalankan berulang kali.
-- ================================================================

ALTER TABLE public.profiles           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_materials  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_types   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_banks     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_participants  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_events        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.remedial_exams     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs         DISABLE ROW LEVEL SECURITY;
