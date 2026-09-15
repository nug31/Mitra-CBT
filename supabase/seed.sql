-- ========================================================
-- MITRA CBT: INITIAL SEED DATA FOR SMK
-- SMK Assessment, Subjects, Materials, Question Banks & Exams
-- ========================================================

-- 1. Assessment Types
INSERT INTO public.assessment_types (id, name, code, description, is_default) VALUES
('11111111-1111-1111-1111-111111111001', 'Sumatif Tengah Semester', 'STS', 'Penilaian sumatif di pertengahan semester untuk mengukur capaian kompetensi', true),
('11111111-1111-1111-1111-111111111002', 'Sumatif Akhir Semester', 'SAS', 'Penilaian sumatif di akhir semester untuk penentuan nilai raport', true),
('11111111-1111-1111-1111-111111111003', 'Ulangan Harian', 'UH', 'Evaluasi periodik per pokok bahasan/materi', true),
('11111111-1111-1111-1111-111111111004', 'Quiz', 'QUIZ', 'Kuis cepat untuk pemahaman konsep harian', true),
('11111111-1111-1111-1111-111111111005', 'Remedial', 'REMEDIAL', 'Ujian perbaikan bagi siswa yang belum mencapai KKM', true),
('11111111-1111-1111-1111-111111111006', 'Try Out', 'TRYOUT', 'Simulasi ujian kelulusan atau sertifikasi kejuruan', true),
('11111111-1111-1111-1111-111111111007', 'Ujian Praktik Teori', 'UPT', 'Ujian teori pengantar praktik kejuruan di bengkel', true),
('11111111-1111-1111-1111-111111111008', 'Evaluasi Pembelajaran', 'EVAL', 'Evaluasi fleksibel guru', true)
ON CONFLICT DO NOTHING;

-- 2. Classes (SMK Teknik Otomotif / TKR)
INSERT INTO public.classes (id, name, grade, major, academic_year) VALUES
('22222222-2222-2222-2222-222222222001', 'X TKR 1', 'X', 'Teknik Kendaraan Ringan Otomotif', '2024/2025'),
('22222222-2222-2222-2222-222222222002', 'X TKR 2', 'X', 'Teknik Kendaraan Ringan Otomotif', '2024/2025'),
('22222222-2222-2222-2222-222222222003', 'XI TKR', 'XI', 'Teknik Kendaraan Ringan Otomotif', '2024/2025'),
('22222222-2222-2222-2222-222222222004', 'XII TKR', 'XII', 'Teknik Kendaraan Ringan Otomotif', '2024/2025')
ON CONFLICT DO NOTHING;

-- 3. Subjects
INSERT INTO public.subjects (id, name, code, major, description) VALUES
('33333333-3333-3333-3333-333333333001', 'Gambar Teknik Mesin & Otomotif', 'GT-TKR', 'Teknik Otomotif', 'Standar gambar teknik, etiket, skala, proyeksi Eropa/Amerika, potongan, CAD'),
('33333333-3333-3333-3333-333333333002', 'Dasar Konversi Energi & Engine', 'DKE-TKR', 'Teknik Otomotif', 'Termodinamika motor bakar, siklus 2/4 langkah, mesin bensin dan diesel'),
('33333333-3333-3333-3333-333333333003', 'Pemeliharaan Mesin Kendaraan Ringan', 'PMKR-TKR', 'Teknik Otomotif', 'Tune-up, sistem pendinginan, pelumasan, bahan bakar EFI, mekanisme katup'),
('33333333-3333-3333-3333-333333333004', 'Matematika Terapan Kejuruan', 'MTK-SMK', 'Umum', 'Geometri, trigonometri, aljabar, dan kalkulasi mekanika teknik'),
('33333333-3333-3333-3333-333333333005', 'Bahasa Indonesia Kejuruan', 'BIN-SMK', 'Umum', 'Laporan kerja bengkel, SOP perbengkelan, dan komunikasi profesional')
ON CONFLICT DO NOTHING;

-- 4. Subject Materials (Gambar Teknik & Konversi Energi)
INSERT INTO public.subject_materials (id, subject_id, name, order_index) VALUES
('44444444-4444-4444-4444-444444444001', '33333333-3333-3333-3333-333333333001', 'Fungsi & Standarisasi Garis Gambar Teknik', 1),
('44444444-4444-4444-4444-444444444002', '33333333-3333-3333-3333-333333333001', 'Etiket Gambar & Skala Pengukuran (ISO)', 2),
('44444444-4444-4444-4444-444444444003', '33333333-3333-3333-3333-333333333001', 'Proyeksi Piktorial & Orthogonal (Eropa & Amerika)', 3),
('44444444-4444-4444-4444-444444444004', '33333333-3333-3333-3333-333333333001', 'Potongan / Irisan dan Dimensi Toleransi', 4),
('44444444-4444-4444-4444-444444444005', '33333333-3333-3333-3333-333333333002', 'Prinsip Termodinamika & Motor Bakar', 1),
('44444444-4444-4444-4444-444444444006', '33333333-3333-3333-3333-333333333002', 'Siklus Kerja Mesin 4 Langkah (Otto & Diesel)', 2),
('44444444-4444-4444-4444-444444444007', '33333333-3333-3333-3333-333333333002', 'Sistem Pelumasan, Pendinginan & Bahan Bakar', 3),
('44444444-4444-4444-4444-444444444008', '33333333-3333-3333-3333-333333333002', 'Efisiensi Volumetrik & Performa Engine', 4)
ON CONFLICT DO NOTHING;
