import { toBn } from './bnDigits.ts';

/**
 * একমাত্র উৎস ধ্রুবক — বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (BAJUS)-এর প্রমিত হিসাব অনুযায়ী।
 * বাকি সমস্ত ইউনিট ও FAQ এই ধ্রুবক থেকে ক্যালকুলেট করা হবে।
 */
export const VORI_IN_GRAM = 11.664;

export const GOLD_UNITS_IN_GRAM = {
  vori: VORI_IN_GRAM,
  tola: VORI_IN_GRAM,           // তোলা ও ভরি অভিন্ন ওজনের ভিন্ন নাম
  ana: VORI_IN_GRAM / 16,        // ১ ভরি = ১৬ আনা (০.৭২৯ গ্রাম)
  rati: VORI_IN_GRAM / 96,       // ১ ভরি = ৯৬ রতি (১ আনা = ৬ রতি) (০.১২১৫ গ্রাম)
  point: VORI_IN_GRAM / 960,     // ১ ভরি = ৯৬০ পয়েন্ট (১ রতি = ১০ পয়েন্ট) (০.০১২১৫ গ্রাম)
  gram: 1,
  kg: 1000,
} as const;

export type GoldUnitKey = keyof typeof GOLD_UNITS_IN_GRAM;

export interface GoldUnitMeta {
  id: GoldUnitKey;
  nameBn: string;
  nameEn: string;
  symbol: string;
  factorInGram: number;
  descriptionBn: string;
  badgeBn: string;
}

export const GOLD_UNITS: GoldUnitMeta[] = [
  {
    id: 'vori',
    nameBn: 'ভরি',
    nameEn: 'Vori (Bhori)',
    symbol: 'ভরি',
    factorInGram: GOLD_UNITS_IN_GRAM.vori,
    descriptionBn: `১ ভরি = ${VORI_IN_GRAM} গ্রাম = ১৬ আনা = ৯৬ রতি`,
    badgeBn: 'প্রধান একক',
  },
  {
    id: 'gram',
    nameBn: 'গ্রাম',
    nameEn: 'Gram (g)',
    symbol: 'g',
    factorInGram: GOLD_UNITS_IN_GRAM.gram,
    descriptionBn: 'আন্তর্জাতিক মেট্রিক মান (১০০০ মিলিগ্রাম)',
    badgeBn: 'মেট্রিক একক',
  },
  {
    id: 'ana',
    nameBn: 'আনা',
    nameEn: 'Ana',
    symbol: 'আনা',
    factorInGram: GOLD_UNITS_IN_GRAM.ana,
    descriptionBn: `১ আনা = ৬ রতি = ৬০ পয়েন্ট ≈ ${(VORI_IN_GRAM / 16).toFixed(3)} গ্রাম`,
    badgeBn: 'উপ-একক',
  },
  {
    id: 'rati',
    nameBn: 'রতি',
    nameEn: 'Rati',
    symbol: 'রতি',
    factorInGram: GOLD_UNITS_IN_GRAM.rati,
    descriptionBn: `১ রতি = ১০ পয়েন্ট = ${(VORI_IN_GRAM / 96).toFixed(4)} গ্রাম`,
    badgeBn: 'সূক্ষ্ম একক',
  },
  {
    id: 'point',
    nameBn: 'পয়েন্ট',
    nameEn: 'Point',
    symbol: 'পয়েন্ট',
    factorInGram: GOLD_UNITS_IN_GRAM.point,
    descriptionBn: `১ পয়েন্ট = ${(VORI_IN_GRAM / 960).toFixed(5)} গ্রাম`,
    badgeBn: 'সবচেয়ে ক্ষুদ্র',
  },
  {
    id: 'tola',
    nameBn: 'তোলা',
    nameEn: 'Tola',
    symbol: 'তোলা',
    factorInGram: GOLD_UNITS_IN_GRAM.tola,
    descriptionBn: `১ তোলা ও ১ ভরি অভিন্ন ওজন (${VORI_IN_GRAM} গ্রাম)`,
    badgeBn: 'ঐতিহ্যবাহী',
  },
  {
    id: 'kg',
    nameBn: 'কিলোগ্রাম (কেজি)',
    nameEn: 'Kilogram (kg)',
    symbol: 'kg',
    factorInGram: GOLD_UNITS_IN_GRAM.kg,
    descriptionBn: `১ কেজি = ১০০০ গ্রাম = ${(1000 / VORI_IN_GRAM).toFixed(3)} ভরি`,
    badgeBn: 'বাল্ক একক',
  },
];

export interface GoldParseResult {
  isValid: boolean;
  value: number;
  error: string | null;
}

const BANGLA_TO_ASCII_MAP: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export function parseGoldInput(raw: string): GoldParseResult {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, value: 0, error: 'ওজনের পরিমাণ লিখুন (যেমন: ১ বা ১১.৬৬৪)' };
  }

  const trimmed = raw.trim();
  if (trimmed === '') {
    return { isValid: false, value: 0, error: 'ওজনের পরিমাণ লিখুন (যেমন: ১ বা ১১.৬৬৪)' };
  }

  // Convert Bengali digits to ASCII
  const ascii = trimmed.replace(/[০-৯]/g, (d) => BANGLA_TO_ASCII_MAP[d] ?? d);

  if (ascii.includes('-')) {
    return { isValid: false, value: 0, error: 'সোনার ওজন ঋণাত্মক হতে পারে না' };
  }

  const cleaned = ascii.replace(/[\s,]/g, '');
  if (cleaned === '') {
    return { isValid: false, value: 0, error: 'ওজনের পরিমাণ লিখুন' };
  }

  if (!/^\d*(\.\d*)?$/.test(cleaned) || cleaned === '.') {
    return { isValid: false, value: 0, error: 'সঠিক সংখ্যা প্রদান করুন (যেমন: ১ বা ২.৫)' };
  }

  const num = Number(cleaned);
  if (!isFinite(num) || isNaN(num)) {
    return { isValid: false, value: 0, error: 'সঠিক সংখ্যা লিখুন' };
  }

  if (num < 0) {
    return { isValid: false, value: 0, error: 'সোনার ওজন ঋণাত্মক হতে পারে না' };
  }

  if (num > 1e9) {
    return { isValid: false, value: 0, error: 'ওজন অতিরিক্ত বেশি (সর্বোচ্চ ১,০০,০০,০০,০০০)' };
  }

  return { isValid: true, value: num, error: null };
}

/**
 * Converts a weight from one gold unit to all other units
 */
export function convertGoldWeight(
  value: number,
  fromUnit: GoldUnitKey
): Record<GoldUnitKey, number> {
  if (!isFinite(value) || value <= 0) {
    return {
      vori: 0,
      tola: 0,
      ana: 0,
      rati: 0,
      point: 0,
      gram: 0,
      kg: 0,
    };
  }

  // 1. Convert to grams using standard factor derived from VORI_IN_GRAM
  const factorInGram = GOLD_UNITS_IN_GRAM[fromUnit] ?? 1;
  const grams = value * factorInGram;

  // 2. Convert from grams to all units
  return {
    vori: grams / GOLD_UNITS_IN_GRAM.vori,
    tola: grams / GOLD_UNITS_IN_GRAM.tola,
    ana: grams / GOLD_UNITS_IN_GRAM.ana,
    rati: grams / GOLD_UNITS_IN_GRAM.rati,
    point: grams / GOLD_UNITS_IN_GRAM.point,
    gram: grams,
    kg: grams / GOLD_UNITS_IN_GRAM.kg,
  };
}

/**
 * Traditional Jewelry memo decomposition:
 * Decomposes any weight into traditional Bangladeshi Jewelry format:
 * ভরি - আনা - রতি - পয়েন্ট
 */
export interface TraditionalGoldBreakdown {
  vori: number;
  ana: number;
  rati: number;
  point: number;
  textBn: string;
  textEn: string;
}

export function decomposeGoldWeight(
  value: number,
  fromUnit: GoldUnitKey
): TraditionalGoldBreakdown {
  if (!isFinite(value) || value <= 0) {
    return {
      vori: 0,
      ana: 0,
      rati: 0,
      point: 0,
      textBn: '০ ভরি',
      textEn: '0 Vori',
    };
  }

  const factorInGram = GOLD_UNITS_IN_GRAM[fromUnit] ?? 1;
  const grams = value * factorInGram;
  const totalVori = grams / VORI_IN_GRAM;

  const vori = Math.floor(totalVori + 1e-9);
  let remVori = Math.max(0, totalVori - vori);

  const totalAna = remVori * 16;
  const ana = Math.floor(totalAna + 1e-9);
  let remAna = Math.max(0, totalAna - ana);

  const totalRati = remAna * 6;
  const rati = Math.floor(totalRati + 1e-9);
  let remRati = Math.max(0, totalRati - rati);

  const totalPoint = remRati * 10;
  // Round point to 2 decimals or integer
  const point = Math.round((totalPoint + 1e-9) * 100) / 100;

  const partsBn: string[] = [];
  const partsEn: string[] = [];

  if (vori > 0) {
    partsBn.push(`${toBn(vori)} ভরি`);
    partsEn.push(`${vori} Vori`);
  }
  if (ana > 0) {
    partsBn.push(`${toBn(ana)} আনা`);
    partsEn.push(`${ana} Ana`);
  }
  if (rati > 0) {
    partsBn.push(`${toBn(rati)} রতি`);
    partsEn.push(`${rati} Rati`);
  }
  if (point > 0) {
    const formattedPoint = point % 1 === 0 ? point.toString() : point.toFixed(2);
    partsBn.push(`${toBn(formattedPoint)} পয়েন্ট`);
    partsEn.push(`${formattedPoint} Point`);
  }

  if (partsBn.length === 0) {
    return {
      vori: 0,
      ana: 0,
      rati: 0,
      point: 0,
      textBn: '০ ভরি',
      textEn: '0 Vori',
    };
  }

  return {
    vori,
    ana,
    rati,
    point,
    textBn: partsBn.join(' '),
    textEn: partsEn.join(' '),
  };
}

/**
 * Formats a converted number nicely:
 * - Trims unnecessary trailing zeroes
 * - Limits to 4 decimal places
 * - Handles small numbers
 */
export function formatGoldNumber(
  val: number,
  useBangla = true,
  maxDecimals = 4
): { text: string; isApprox: boolean } {
  if (!isFinite(val) || val === 0) {
    return { text: useBangla ? '০' : '0', isApprox: false };
  }

  // Check if it has a remainder beyond maxDecimals
  const rounded = Number(val.toFixed(maxDecimals));
  const isApprox = Math.abs(val - rounded) > 1e-7;

  // Format with thousand separators
  const parts = rounded.toString().split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  let formatted = decPart ? `${intPart}.${decPart}` : intPart;

  if (useBangla) {
    formatted = toBn(formatted);
  }

  return { text: formatted, isApprox };
}

export function formatTaka(amount: number, useBangla = true): string {
  if (!isFinite(amount) || amount <= 0) return useBangla ? '০ ৳' : '0 ৳';

  const rounded = Math.round(amount);
  // Bangladeshi format: 1,50,000
  const str = rounded.toString();
  let result = '';
  if (str.length <= 3) {
    result = str;
  } else {
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${withCommas},${lastThree}`;
  }

  return useBangla ? `${toBn(result)} ৳` : `৳ ${result}`;
}
