// SVG diagram assets for vocational SMK questions (Gambar Teknik & Konversi Energi Engine),
// insertable as illustrations when authoring questions in QuestionEditorModal.

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
