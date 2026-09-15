import mammoth from 'mammoth';
import { QuestionType, DifficultyLevel } from '../types';

export interface ParsedWordOption {
  label: string; // 'A', 'B', 'C', 'D', 'E'
  content: string;
  imageUrl?: string;
  isCorrect: boolean;
}

export interface ParsedWordQuestion {
  id: string;
  number: number;
  questionType: QuestionType;
  content: string;
  imageUrl?: string;
  options: ParsedWordOption[];
  key: string;
  weight: number;
  difficulty: DifficultyLevel;
  explanation: string;
  isValid: boolean;
  error?: string;
}

// Clean HTML tags but preserve clean text and <img> tags
function stripHtmlKeepImages(html: string): { text: string; firstImage?: string } {
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const firstImage = imgMatch ? imgMatch[1] : undefined;
  
  // Replace <br> and <p> with newlines, then remove remaining tags
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();

  return { text, firstImage };
}

export async function parseDocxFile(file: File): Promise<{
  questions: ParsedWordQuestion[];
  rawText: string;
  error?: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Convert to HTML and preserve images as base64
    const htmlResult = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        convertImage: mammoth.images.imgElement((image: any) => {
          return image.read('base64').then((imageBuffer: string) => {
            return {
              src: `data:${image.contentType};base64,${imageBuffer}`
            };
          });
        })
      }
    );

    const html = htmlResult.value;
    const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
    const rawText = rawTextResult.value;

    const questions = parseQuestionsFromHtmlAndText(html, rawText);
    return { questions, rawText };
  } catch (err: any) {
    return {
      questions: [],
      rawText: '',
      error: err?.message || 'Gagal membaca dokumen Word (.docx)'
    };
  }
}

export function parseQuestionsFromHtmlAndText(
  html: string,
  rawText: string
): ParsedWordQuestion[] {
  // Split HTML into paragraph-like blocks
  const rawBlocks = html
    .split(/<\/p>|<\/div>|<\/tr>/i)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  // If HTML blocks are too few or empty, fallback to raw text lines
  const lines: { text: string; image?: string }[] = [];

  if (rawBlocks.length > 3) {
    for (const block of rawBlocks) {
      const { text, firstImage } = stripHtmlKeepImages(block);
      if (text || firstImage) {
        lines.push({ text, image: firstImage });
      }
    }
  } else {
    // Fallback to text lines
    const textLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const tl of textLines) {
      lines.push({ text: tl });
    }
  }

  // Regex patterns
  const questionStartRegex = /^(?:(?:soal|no\.?)\s*)?(\d+)[\.\)]\s*(.*)$/i;
  const optionStartRegex = /^([A-Ea-e])[\.\)]\s*(.*)$/;
  const optionParenRegex = /^\(([A-Ea-e])\)\s*(.*)$/;
  const optionBracketRegex = /^\[([A-Ea-e])\]\s*(.*)$/;
  const keyRegex = /^(?:kunci(?:\s+jawaban)?|jawaban|ans(?:wer)?|key)\s*[:=]\s*([A-Ea-e\s,]+)/i;
  const explanationRegex = /^(?:pembahasan|penjelasan|explanation|solusi)\s*[:=]\s*(.*)$/i;
  const weightRegex = /^(?:bobot|skor|nilai|poin|weight)\s*[:=]\s*([\d\.]+)/i;
  const difficultyRegex = /^(?:kesulitan|tingkat\s+kesulitan|level|difficulty)\s*[:=]\s*(mudah|sedang|sulit|easy|medium|hard)/i;
  const typeRegex = /^(?:jenis|tipe|type)\s*[:=]\s*(.*)$/i;

  const rawQuestions: {
    qNum: number;
    contentLines: string[];
    images: string[];
    options: { label: string; text: string; image?: string }[];
    key?: string;
    explanation?: string;
    weight?: number;
    difficulty?: DifficultyLevel;
    questionType?: QuestionType;
  }[] = [];

  let currentQ: (typeof rawQuestions)[0] | null = null;
  let currentOpt: { label: string; text: string; image?: string } | null = null;
  let questionCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const { text, image } = lines[i];

    // Check if line is Question Start: e.g. "1. ..." or "Soal 1: ..."
    const qMatch = text.match(questionStartRegex);
    // Ignore if looks like "1.5 kg" or small number inside sentence
    const isLikelyQuestion = qMatch && (
      qMatch[2].length > 3 || 
      image !== undefined ||
      (i + 1 < lines.length && (
        lines[i + 1].text.match(optionStartRegex) ||
        lines[i + 1].text.match(optionParenRegex) ||
        lines[i + 1].text.match(optionBracketRegex)
      ))
    );

    if (isLikelyQuestion) {
      questionCounter++;
      const num = parseInt(qMatch![1], 10) || questionCounter;
      const initialContent = qMatch![2].trim();

      currentQ = {
        qNum: num,
        contentLines: initialContent ? [initialContent] : [],
        images: image ? [image] : [],
        options: [],
      };
      currentOpt = null;
      rawQuestions.push(currentQ);
      continue;
    }

    // If we have not encountered a question yet, skip headers/instructions
    if (!currentQ) {
      continue;
    }

    // Check if line is Key: e.g. "Kunci: C" or "Jawaban: B"
    const keyMatch = text.match(keyRegex);
    if (keyMatch) {
      currentQ.key = keyMatch[1].trim().toUpperCase();
      currentOpt = null;
      continue;
    }

    // Check if line is Pembahasan: e.g. "Pembahasan: ..."
    const expMatch = text.match(explanationRegex);
    if (expMatch) {
      currentQ.explanation = expMatch[1].trim();
      currentOpt = null;
      continue;
    }

    // Check if line is Weight: e.g. "Bobot: 2"
    const wMatch = text.match(weightRegex);
    if (wMatch) {
      currentQ.weight = parseFloat(wMatch[1]) || 1;
      continue;
    }

    // Check if line is Difficulty: e.g. "Kesulitan: Sedang"
    const dMatch = text.match(difficultyRegex);
    if (dMatch) {
      const rawD = dMatch[1].toLowerCase();
      if (rawD.includes('mudah') || rawD.includes('easy')) currentQ.difficulty = 'mudah';
      else if (rawD.includes('sulit') || rawD.includes('hard')) currentQ.difficulty = 'sulit';
      else currentQ.difficulty = 'sedang';
      continue;
    }

    // Check if line is Question Type: e.g. "Jenis: Pilihan Ganda"
    const tMatch = text.match(typeRegex);
    if (tMatch) {
      const rawT = tMatch[1].toLowerCase();
      if (rawT.includes('benar') || rawT.includes('salah')) currentQ.questionType = 'benar_salah';
      else if (rawT.includes('kompleks')) currentQ.questionType = 'pg_kompleks';
      else if (rawT.includes('isian')) currentQ.questionType = 'isian_singkat';
      else if (rawT.includes('jodoh')) currentQ.questionType = 'menjodohkan';
      continue;
    }

    // Check if line is an Option: e.g. "A. ...", "(A) ...", "[A] ..."
    const optMatch = text.match(optionStartRegex) || text.match(optionParenRegex) || text.match(optionBracketRegex);
    if (optMatch) {
      const label = optMatch[1].toUpperCase();
      let optText = optMatch[2].trim();

      // Check if option contains an inline key marker e.g. "(kunci)", "(benar)", "*", "[x]"
      const hasInlineMarker = /\((?:kunci|benar|jawaban)\)|\[(?:x|v|benar|kunci)\]|\*/i.test(optText) || text.startsWith('*');
      if (hasInlineMarker) {
        optText = optText.replace(/\((?:kunci|benar|jawaban)\)|\[(?:x|v|benar|kunci)\]|\*/gi, '').trim();
        if (!currentQ.key) {
          currentQ.key = label;
        }
      }

      // Check if this line contains MULTIPLE inline options (e.g. "A. Opsi 1  B. Opsi 2")
      const inlineSplit = optText.split(/\s+(?=[B-Eb-e][\.\)])/);
      if (inlineSplit.length > 1) {
        // First option
        currentQ.options.push({
          label,
          text: inlineSplit[0].trim(),
          image: image
        });

        // Remaining inline options
        for (let s = 1; s < inlineSplit.length; s++) {
          const part = inlineSplit[s].trim();
          const subMatch = part.match(/^([B-Eb-e])[\.\)]\s*(.*)$/);
          if (subMatch) {
            let subText = subMatch[2].trim();
            const subHasMarker = /\((?:kunci|benar|jawaban)\)|\[(?:x|v|benar|kunci)\]|\*/i.test(subText);
            if (subHasMarker) {
              subText = subText.replace(/\((?:kunci|benar|jawaban)\)|\[(?:x|v|benar|kunci)\]|\*/gi, '').trim();
              if (!currentQ.key) {
                currentQ.key = subMatch[1].toUpperCase();
              }
            }
            currentQ.options.push({
              label: subMatch[1].toUpperCase(),
              text: subText
            });
          }
        }
        currentOpt = null;
        continue;
      }

      currentOpt = {
        label,
        text: optText,
        image: image
      };
      currentQ.options.push(currentOpt);
      continue;
    }

    // If we're inside an option, append text or image to current option
    if (currentOpt) {
      if (text) {
        currentOpt.text += (currentOpt.text ? ' ' : '') + text;
      }
      if (image && !currentOpt.image) {
        currentOpt.image = image;
      }
      continue;
    }

    // Otherwise, this belongs to Question Content (or embedded image)
    if (text) {
      currentQ.contentLines.push(text);
    }
    if (image) {
      currentQ.images.push(image);
    }
  }

  // Convert raw questions to final ParsedWordQuestion format with validation
  const result: ParsedWordQuestion[] = rawQuestions.map((q, idx) => {
    const content = q.contentLines.join('\n').trim();
    const primaryImage = q.images.length > 0 ? q.images[0] : undefined;

    // Determine question type if not explicitly specified
    let finalType: QuestionType = q.questionType || 'pilihan_ganda';
    if (!q.questionType) {
      if (
        q.options.length === 2 &&
        q.options.some(o => /benar|true/i.test(o.text)) &&
        q.options.some(o => /salah|false/i.test(o.text))
      ) {
        finalType = 'benar_salah';
      } else if (q.key && q.key.includes(',')) {
        finalType = 'pg_kompleks';
      }
    }

    // Extract key labels (only distinct letters A-E)
    const rawKey = (q.key || '').toUpperCase();
    const matchedKeyLabels = Array.from(new Set(rawKey.match(/\b[A-E]\b/g) || rawKey.match(/[A-E]/g) || []));

    // Determine active keys based on question type
    let activeKeys: string[] = [];
    if (finalType === 'pg_kompleks') {
      activeKeys = matchedKeyLabels;
    } else {
      // For single choice (pilihan_ganda or benar_salah): STRICTLY ONE KEY CAN BE CORRECT!
      // If multiple keys were matched, keep only the first valid key
      activeKeys = matchedKeyLabels.slice(0, 1);
    }

    const finalOptions: ParsedWordOption[] = q.options.map(opt => {
      const isCorrect = activeKeys.includes(opt.label);
      return {
        label: opt.label,
        content: opt.text,
        imageUrl: opt.image,
        isCorrect
      };
    });

    // Validation
    let isValid = true;
    let error: string | undefined;

    if (!content && !primaryImage) {
      isValid = false;
      error = 'Teks pertanyaan kosong';
    } else if (finalType === 'pilihan_ganda' && finalOptions.length < 2) {
      isValid = false;
      error = `Pilihan ganda membutuhkan minimal 2 opsi (terdeteksi ${finalOptions.length})`;
    } else if (activeKeys.length === 0 && finalType !== 'isian_singkat') {
      isValid = false;
      error = 'Kunci jawaban belum terdeteksi (klik huruf opsi untuk memilih)';
    } else if (finalOptions.length > 0 && !finalOptions.some(o => o.isCorrect) && finalType !== 'isian_singkat') {
      isValid = false;
      error = `Kunci "${rawKey}" tidak cocok dengan label opsi yang ada`;
    }

    return {
      id: `word-q-${idx + 1}-${Date.now()}`,
      number: q.qNum || idx + 1,
      questionType: finalType,
      content,
      imageUrl: primaryImage,
      options: finalOptions,
      key: rawKey,
      weight: q.weight ?? 1.0,
      difficulty: q.difficulty || 'sedang',
      explanation: q.explanation || '',
      isValid,
      error
    };
  });

  return result;
}
