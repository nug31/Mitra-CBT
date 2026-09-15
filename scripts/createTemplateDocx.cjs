const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const templatesDir = path.join(__dirname, '..', 'public', 'templates');
fs.mkdirSync(templatesDir, { recursive: true });

const zip = new JSZip();

// [Content_Types].xml
zip.file(
  '[Content_Types].xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
);

// _rels/.rels
zip.file(
  '_rels/.rels',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
);

// word/_rels/document.xml.rels
zip.file(
  'word/_rels/document.xml.rels',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`
);

// word/document.xml
const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>TEMPLATE BANK SOAL MITRA CBT</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:i/><w:color w:val="555555"/></w:rPr><w:t>Panduan: Tuliskan nomor soal (1., 2., dst), pilihan jawaban (A., B., C., D., E.), dan Kunci jawaban.</w:t></w:r></w:p>
    <w:p/>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>1. Alat ukur yang paling tepat untuk mengukur diameter silinder blok mesin pada kendaraan ringan adalah...</w:t></w:r></w:p>
    <w:p><w:r><w:t>A. Jangka Sorong (Vernier Caliper)</w:t></w:r></w:p>
    <w:p><w:r><w:t>B. Mikrometer Luar (Outside Micrometer)</w:t></w:r></w:p>
    <w:p><w:r><w:t>C. Cylinder Bore Gauge (CBG)</w:t></w:r></w:p>
    <w:p><w:r><w:t>D. Dial Indicator</w:t></w:r></w:p>
    <w:p><w:r><w:t>E. Feeler Gauge</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Kunci: C</w:t></w:r></w:p>
    <w:p><w:r><w:t>Bobot: 2</w:t></w:r></w:p>
    <w:p><w:r><w:t>Kesulitan: Sedang</w:t></w:r></w:p>
    <w:p><w:r><w:t>Pembahasan: Cylinder Bore Gauge digunakan khusus bersama mikrometer untuk mengukur keausan dinding silinder.</w:t></w:r></w:p>
    <w:p/>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>2. Kekentalan oli mesin yang ditunjukkan dengan kode SAE 10W-40, huruf W merupakan singkatan dari...</w:t></w:r></w:p>
    <w:p><w:r><w:t>A. Weight</w:t></w:r></w:p>
    <w:p><w:r><w:t>B. Winter</w:t></w:r></w:p>
    <w:p><w:r><w:t>C. Weather</w:t></w:r></w:p>
    <w:p><w:r><w:t>D. Wheel</w:t></w:r></w:p>
    <w:p><w:r><w:t>E. Warm</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Kunci: B</w:t></w:r></w:p>
    <w:p><w:r><w:t>Bobot: 1.5</w:t></w:r></w:p>
    <w:p><w:r><w:t>Kesulitan: Mudah</w:t></w:r></w:p>
    <w:p><w:r><w:t>Pembahasan: Huruf W singkatan dari Winter yang berarti pelumas memiliki viskositas stabil pada suhu dingin saat start awal.</w:t></w:r></w:p>
    <w:p/>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>3. Komponen sistem pendingin yang berfungsi menaikkan titik didih air pendingin hingga di atas 100 derajat Celcius adalah tutup radiator.</w:t></w:r></w:p>
    <w:p><w:r><w:t>A. Benar</w:t></w:r></w:p>
    <w:p><w:r><w:t>B. Salah</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Kunci: A</w:t></w:r></w:p>
    <w:p><w:r><w:t>Bobot: 1</w:t></w:r></w:p>
    <w:p><w:r><w:t>Kesulitan: Mudah</w:t></w:r></w:p>
    <w:p><w:r><w:t>Pembahasan: Relief valve pada tutup radiator menjaga tekanan sistem pendingin sehingga titik didih air meningkat sekitar 110-120 derajat C.</w:t></w:r></w:p>
  </w:body>
</w:document>`;

zip.file('word/document.xml', docXml);

const docxPath = path.join(templatesDir, 'Template_Soal_MitraCBT.docx');

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
  .then(buffer => {
    fs.writeFileSync(docxPath, buffer);
    console.log('Template docx created successfully via JSZip at:', docxPath);
  })
  .catch(err => {
    console.error('Error generating docx:', err);
  });
