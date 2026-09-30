/**
 * OCR Engine for Utools.bd
 *
 * Runs 100% in-browser via Tesseract.js WebAssembly Web Worker.
 * All core WASM, worker scripts, and traineddata files are self-hosted in /vendor/tesseract/.
 *
 * Model details:
 * - Bengali: /vendor/tesseract/ben.traineddata.gz (tessdata_fast variant, ~539 KB compressed, ~855 KB uncompressed)
 * - English: /vendor/tesseract/eng.traineddata.gz (tessdata_fast variant, ~1.9 MB compressed, ~4.1 MB uncompressed)
 * - Total network download for mixed ben+eng is only ~2.5 MB.
 *
 * Supports two distinct paths for PDFs:
 * - Path A (Digital text layer): Coordinate-aware text reconstruction avoiding broken word spacing
 * - Path B (Scanned/image-based PDF): Renders pages to canvas at 3.0x scale (~216 DPI) on a solid white background
 */

export type OcrLanguage = 'ben+eng' | 'ben' | 'eng';

export interface OcrProgress {
  status: string;
  progress: number; // 0 to 1
  detail?: string;
  currentPage?: number;
  totalPages?: number;
}

export interface PdfDirectResult {
  hasTextLayer: boolean;
  text: string;
  pageCount: number;
  isLikelyBijoy?: boolean;
}

/**
 * Checks if a string contains characteristic SutonnyMJ / Bijoy ANSI encoding patterns.
 */
export function isLikelyBijoyText(text: string): boolean {
  if (!text || text.length < 15) return false;
  const bengaliUnicodeCount = (text.match(/[\u0980-\u09FF]/g) || []).length;
  if (bengaliUnicodeCount > text.length * 0.35) {
    return false;
  }
  const bijoySignatures = [
    /‡[a-zA-Z]/,
    /Avwg/,
    /evsjv/,
    /K‡i/,
    /wQj/,
    /†[a-zA-Z]/,
    /[a-zA-Z]v\b/,
    /[a-zA-Z]w[a-zA-Z]/,
    /Av[a-zA-Z]/,
    /GB\b/
  ];
  let matches = 0;
  for (const sig of bijoySignatures) {
    if (sig.test(text)) matches++;
  }
  return matches >= 2;
}

// Convert numbers to Bengali digits
export function toBanglaNum(num: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => banglaDigits[Number(d)]);
}

/**
 * Normalizes Bengali OCR text:
 * 1. Removes unwanted spaces between consonants and vowel signs (া-ৌ) preventing dotted circles (◌)
 * 2. Removes spaces around Hasanta (্) to repair broken conjuncts (ম্যা, ক্ট, স্ব, ষ্ঠ, ইত্যাদি)
 * 3. Repairs visual-order E-kar/Oi-kar and merges split O-kar (ে + া -> ো)
 * 4. Cleans stray spaces before punctuation and modifier signs (ং, ঃ, ঁ, ।)
 */
export function normalizeBengaliOcrText(raw: string): string {
  if (!raw) return '';
  let text = raw;

  // 1. Remove spaces between consonant and hasanta, and hasanta and next consonant (repair conjuncts)
  // e.g. "ম ্ য" -> "ম্য", "ক ্ ট" -> "ক্ট", "স ্ থ" -> "স্থ"
  text = text.replace(/([ক-হড়ঢ়য়ৎ])\s*্\s*([ক-হড়ঢ়য়])/g, '$1্$2');
  text = text.replace(/([ক-হড়ঢ়য়ৎ])\s*্\s+/g, '$1্');
  text = text.replace(/\s+্\s*([ক-হড়ঢ়য়])/g, '্$1');

  // 2. Remove space between consonant and vowel signs (kaars) preventing dotted circles (◌)
  // e.g. "ম া" -> "মা", "ট ি" -> "টি", "ক ে" -> "কে", "ল ী" -> "লী"
  text = text.replace(/([ক-হড়ঢ়য়ৎA-Za-z0-9])\s+([া-ৌ])/g, '$1$2');

  // 3. Remove space before modifier signs (anusvara ং, visarga ঃ, chandrabindu ঁ, dari ।)
  text = text.replace(/([ক-হড়ঢ়য়ৎা-ৌA-Za-z0-9])\s+([ংঃঁ])/g, '$1$2');
  text = text.replace(/\s+([।])/g, '$1');

  // 4. Fix split o-kar and au-kar (e-kar followed by a-kar should be o-kar)
  // e.g. "ক" + "ে" + "া" -> "কো"
  text = text.replace(/([ক-হড়ঢ়য়ৎ])ে\s*া/g, '$1ো');
  text = text.replace(/([ক-হড়ঢ়য়ৎ])ে\s*ৗ/g, '$1ৌ');
  text = text.replace(/ে\s*া/g, 'ো');
  text = text.replace(/ে\s*ৗ/g, 'ৌ');

  // 5. Fix visual-order e-kar, oi-kar, and detached i-kar
  // e.g. " েক" -> " কে", " ৈক" -> " কৈ", " িক" -> " কি"
  text = text.replace(/(^|[\s(/"\x27])ে([ক-হড়ঢ়য়])/g, '$1$2ে');
  text = text.replace(/(^|[\s(/"\x27])ৈ([ক-হড়ঢ়য়])/g, '$1$2ৈ');
  text = text.replace(/(^|[\s(/"\x27])ি([ক-হড়ঢ়য়])/g, '$1$2ি');
  text = text.replace(/([ক-হড়ঢ়য়])\s+ি/g, '$1ি');
  text = text.replace(/([ক-হড়ঢ়য়])\s+ে/g, '$1ে');
  text = text.replace(/([ক-হড়ঢ়য়])\s+ো/g, '$1ো');

  // 6. Fix broken spaced-out Bengali words (common in PDF extracted text like "ব ি ভ া গ" or "স ং খ ্ য া")
  text = text.replace(/([ক-হড়ঢ়য়ৎ])\s+([া-ৌ])/g, '$1$2');
  text = text.replace(/([ক-হড়ঢ়য়ৎ])\s*্\s*([ক-হড়ঢ়য়])/g, '$1্$2');

  // 6. Fix common punctuation spacing (space before comma, colon, parenthesis)
  text = text.replace(/\s+([,:;!?])/g, '$1 ');
  text = text.replace(/([(])\s+/g, '$1');
  text = text.replace(/\s+([)])/g, '$1');

  // 7. Normalize repeated spaces but preserve single newlines
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n +/g, '\n');
  text = text.replace(/ +\n/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Maps Tesseract's internal progress status strings to user-friendly Bengali messages.
 */
function translateStatus(status: string): string {
  switch (status) {
    case 'loading tesseract core':
      return 'OCR ইঞ্জিন লোড হচ্ছে...';
    case 'initializing tesseract':
    case 'initializing api':
      return 'ইঞ্জিন প্রস্তুত করা হচ্ছে...';
    case 'loading language traineddata':
    case 'loaded language traineddata':
      return 'বাংলা ও ইংরেজি ফন্ট মডেল লোড হচ্ছে (~২.৫ MB)...';
    case 'recognizing text':
      return 'টেক্সট রিকগনিশন ও অক্ষর স্ক্যান চলছে...';
    default:
      if (status.includes('loading')) return 'প্রয়োজনীয় রিসোর্স লোড হচ্ছে...';
      if (status.includes('init')) return 'প্রস্তুতি চলছে...';
      return 'টেক্সট প্রসেসিং চলছে...';
  }
}

/**
 * Configure and spawn a Tesseract.js Worker pointing strictly to local self-hosted assets.
 */
export async function getTesseractWorker(
  language: OcrLanguage,
  onProgress?: (progress: OcrProgress) => void
) {
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker(language, undefined, {
    workerPath: '/vendor/tesseract/worker.min.js',
    corePath: '/vendor/tesseract',
    langPath: '/vendor/tesseract',
    gzip: true,
    logger: (m) => {
      if (onProgress) {
        onProgress({
          status: translateStatus(m.status),
          progress: typeof m.progress === 'number' ? m.progress : 0,
          detail: m.status
        });
      }
    }
  });

  return worker;
}

/**
 * Recognizes printed text from an image (File, Blob, Canvas, or Data URL).
 */
export async function recognizeImage(
  imageSource: string | File | Blob | HTMLCanvasElement,
  language: OcrLanguage = 'ben+eng',
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  let worker: any = null;
  try {
    worker = await getTesseractWorker(language, onProgress);
    const { data } = await worker.recognize(imageSource);
    const raw = data.text ? data.text.trim() : '';
    return normalizeBengaliOcrText(raw);
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Safe termination cleanup
      }
    }
  }
}

/**
 * Path A: Attempts to extract text directly from a PDF's embedded digital text layer.
 * Uses coordinate-aware reconstruction so adjacent letter fragments are not broken by stray spaces.
 */
export async function extractPdfDirectText(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<PdfDirectResult> {
  const pdfjsLib = await import('pdfjs-dist');

  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: '/cmaps/',
    cMapPacked: true
  });

  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  let combinedText = '';
  let totalNonWhitespaceChars = 0;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    if (onProgress) {
      onProgress({
        status: `পিডিএফ পেজ বিশ্লেষণ হচ্ছে (${toBanglaNum(pageNum)}/${toBanglaNum(pageCount)})...`,
        progress: pageNum / pageCount,
        currentPage: pageNum,
        totalPages: pageCount
      });
    }

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    if (!items || items.length === 0) continue;

    // Coordinate-aware line and word reconstruction
    let pageText = '';
    let lastY: number | null = null;
    let lastX = 0;
    let lastWidth = 0;

    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      const str = item.str;
      if (!str) continue;

      const currentX = item.transform[4];
      const currentY = item.transform[5];
      const currentWidth = item.width || 0;
      const fontSize = Math.abs(item.transform[0]) || Math.abs(item.transform[3]) || 12;

      if (lastY === null) {
        pageText += str;
      } else {
        const deltaY = Math.abs(currentY - lastY);
        // If Y difference exceeds threshold, it's a new line
        if (deltaY > fontSize * 0.4) {
          pageText += '\n' + str;
        } else {
          // On the same line: check visual gap
          const deltaX = currentX - (lastX + lastWidth);
          // Only insert space if there is an actual word-spacing gap (> fontSize * 0.18)
          if (deltaX > fontSize * 0.18 && !pageText.endsWith(' ') && !str.startsWith(' ')) {
            pageText += ' ' + str;
          } else {
            pageText += str;
          }
        }
      }

      lastY = currentY;
      lastX = currentX;
      lastWidth = currentWidth;
    }

    const normalized = normalizeBengaliOcrText(pageText.trim());
    totalNonWhitespaceChars += normalized.replace(/\s/g, '').length;

    if (normalized) {
      if (pageCount > 1) {
        combinedText += `--- পেজ ${toBanglaNum(pageNum)} ---\n${normalized}\n\n`;
      } else {
        combinedText += `${normalized}\n\n`;
      }
    }
  }

  // A document with at least 30 non-whitespace characters is considered to have a real text layer
  const hasTextLayer = totalNonWhitespaceChars >= 30;

  return {
    hasTextLayer,
    text: combinedText.trim(),
    pageCount,
    isLikelyBijoy: isLikelyBijoyText(combinedText.trim())
  };
}

/**
 * Path B: For scanned / image-only PDFs.
 * Renders each page to a canvas at 3.0x scale (~216 DPI) on a solid white background,
 * and executes Tesseract OCR sequentially with Bengali glyph normalization.
 */
export async function recognizePdfScannedPages(
  file: File,
  language: OcrLanguage = 'ben+eng',
  onProgress?: (progress: OcrProgress) => void,
  shouldCancel?: () => boolean
): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: '/cmaps/',
    cMapPacked: true
  });

  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  let worker: any = null;
  const pageResults: string[] = [];

  try {
    worker = await getTesseractWorker(language, (prog) => {
      if (onProgress) {
        onProgress({
          ...prog,
          status: prog.status,
          currentPage: 1,
          totalPages: pageCount
        });
      }
    });

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      if (shouldCancel && shouldCancel()) {
        throw new Error('User cancelled OCR operation');
      }

      const page = await pdfDoc.getPage(pageNum);
      // Scale 3.0 (~216 DPI) gives high-resolution curves for Bengali conjuncts and diacritics
      const viewport = page.getViewport({ scale: 3.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      // CRITICAL: Fill canvas with solid white before rendering PDF
      // Otherwise canvas has transparent alpha, which corrupts Tesseract's binarizer
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      if (onProgress) {
        onProgress({
          status: `পেজ ${toBanglaNum(pageNum)}/${toBanglaNum(pageCount)} OCR প্রসেসিং চলছে...`,
          progress: (pageNum - 1) / pageCount,
          currentPage: pageNum,
          totalPages: pageCount
        });
      }

      const { data } = await worker.recognize(canvas);
      const rawText = data.text ? data.text.trim() : '';
      const text = normalizeBengaliOcrText(rawText);

      if (pageCount > 1) {
        pageResults.push(`--- পেজ ${toBanglaNum(pageNum)} ---\n${text}`);
      } else {
        pageResults.push(text);
      }

      if (onProgress) {
        onProgress({
          status: `পেজ ${toBanglaNum(pageNum)}/${toBanglaNum(pageCount)} সম্পন্ন!`,
          progress: pageNum / pageCount,
          currentPage: pageNum,
          totalPages: pageCount
        });
      }
    }

    return pageResults.join('\n\n').trim();
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Safe termination cleanup
      }
    }
  }
}
