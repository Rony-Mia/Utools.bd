export interface HandwritingOptions {
  fontSize: number; // in pt/px, default ~18
  lineHeight: number; // line height multiplier, e.g. 1.8
  letterSpacing: number; // in px, e.g. 1
  paperType: 'ruled' | 'plain' | 'yellow' | 'grid';
  inkColor: string; // hex color, e.g. '#002664'
  fontFamily: string; // CSS font family name
  authorName?: string;
  date?: string;
  marginHorizontal: number; // in px
  marginVertical: number; // in px
}

export interface PaginatedPage {
  pageNumber: number;
  lines: string[];
}

export const HANDWRITING_FONTS = [
  { id: 'kalam', name: 'কালাম (Kalam - ন্যাচারাল স্টুডেন্ট)', font: 'Kalam, cursive', fallback: 'cursive' },
  { id: 'caveat', name: 'ক্যাভিয়েট (Caveat - দ্রুত কার্সিভ)', font: 'Caveat, cursive', fallback: 'cursive' },
  { id: 'indie-flower', name: 'ইন্ডি ফ্লাওয়ার (Indie Flower - খোলা হস্তলিপি)', font: '"Indie Flower", cursive', fallback: 'cursive' },
  { id: 'shadows', name: 'শ্যাডোজ (Shadows Into Light - পরিচ্ছন্ন নোট)', font: '"Shadows Into Light", cursive', fallback: 'cursive' },
  { id: 'noto-sans', name: 'প্রমিত বাংলা (Noto Sans Bengali - পরিষ্কার খসড়া)', font: '"Noto Sans Bengali", sans-serif', fallback: 'sans-serif' },
] as const;

export const PAPER_TYPES = [
  {
    id: 'ruled',
    name: 'রুলটানা খাতা (Ruled Lined Paper)',
    description: 'লাল মার্জিন ও নীল রুলটানা ক্লাসিক খাতা',
    bgColor: '#FCFBF7',
    lineColor: '#C8D8E8',
    marginColor: '#F87171',
    hasMarginLine: true,
  },
  {
    id: 'plain',
    name: 'সাদা খাতা (Plain Blank Sheet)',
    description: 'পরিষ্কার সাদা ড্রয়িং বা অ্যাসাইনমেন্ট পেপার',
    bgColor: '#FFFFFF',
    lineColor: 'transparent',
    marginColor: 'transparent',
    hasMarginLine: false,
  },
  {
    id: 'yellow',
    name: 'হলুদ লিগ্যাল প্যাড (Yellow Legal Pad)',
    description: 'আমেরিকান স্টাইল হলুদ লিগ্যাল নোটবুক',
    bgColor: '#FEF9C3',
    lineColor: '#CBD5E1',
    marginColor: '#F87171',
    hasMarginLine: true,
  },
  {
    id: 'grid',
    name: 'গ্রাফ খাতা (Grid Graph Paper)',
    description: 'স্কয়ার গ্রিডযুক্ত প্রজেক্ট ও হিসাবের খাতা',
    bgColor: '#F8FAFC',
    lineColor: '#E2E8F0',
    marginColor: '#38BDF8',
    hasMarginLine: true,
  },
] as const;

export const INK_COLORS = [
  { id: 'royal-blue', name: 'রয়েল ব্লু পেন (Classic Blue)', hex: '#002D72' },
  { id: 'midnight-blue', name: 'মিডনাইট ব্লু (Dark Ink)', hex: '#1E3A8A' },
  { id: 'black-gel', name: 'কালো জেল পেন (Black Ink)', hex: '#111827' },
  { id: 'red-pen', name: 'লাল কালির পেন (Red Marker)', hex: '#B91C1C' },
  { id: 'green-pen', name: 'সবুজ কালির পেন (Green Marker)', hex: '#047857' },
] as const;

export const SAMPLE_ASSIGNMENT_TEXT = `Subject: Computer Science & Digital Literacy
Topic: The Evolution of Artificial Intelligence in Bangladesh

Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. In Bangladesh, educational institutions, government portals, and young software entrepreneurs are actively leveraging digital automation to streamline everyday services.

The vision of Smart Bangladesh 2041 relies heavily on equipping students with practical coding, problem-solving, and critical thinking skills. As modern computing shifts from manual data entry to intelligent Pair Programming agents, universities must focus on hands-on software development and real-world application building.

Conclusion:
By embracing safe, client-side digital tools, we empower students to learn faster, work efficiently, and protect user data privacy without relying on expensive server backends.`;

/**
 * Splits plain text into pages according to maximum lines per page.
 * Keeps manual paragraph breaks intact and wraps lines realistically.
 */
export function paginateText(text: string, maxLinesPerPage: number = 24, maxCharsPerLine: number = 65): PaginatedPage[] {
  if (!text || text.trim().length === 0) {
    return [{ pageNumber: 1, lines: [] }];
  }

  const rawParagraphs = text.split('\n');
  const allWrappedLines: string[] = [];

  for (const para of rawParagraphs) {
    if (para.trim().length === 0) {
      // Empty line preserved for paragraph spacing
      allWrappedLines.push('');
      continue;
    }

    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) allWrappedLines.push(currentLine);
        // If single word is longer than maxCharsPerLine, break it
        if (word.length > maxCharsPerLine) {
          let remaining = word;
          while (remaining.length > maxCharsPerLine) {
            allWrappedLines.push(remaining.substring(0, maxCharsPerLine));
            remaining = remaining.substring(maxCharsPerLine);
          }
          currentLine = remaining;
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) {
      allWrappedLines.push(currentLine);
    }
  }

  const pages: PaginatedPage[] = [];
  let pageNumber = 1;

  for (let i = 0; i < allWrappedLines.length; i += maxLinesPerPage) {
    const chunk = allWrappedLines.slice(i, i + maxLinesPerPage);
    pages.push({
      pageNumber,
      lines: chunk,
    });
    pageNumber++;
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, lines: [] }];
}
