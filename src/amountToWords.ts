// src/amountToWords.ts
// Precision Bengali Amount-to-Words Converter for Banking Checks, Deeds & Official Vouchers

export const BANGLA_ONES_AND_TENS: { [key: number]: string } = {
  0: 'শূন্য',
  1: 'এক',
  2: 'দুই',
  3: 'তিন',
  4: 'চার',
  5: 'পাঁচ',
  6: 'ছয়',
  7: 'সাত',
  8: 'আট',
  9: 'নয়',
  10: 'দশ',
  11: 'এগারো',
  12: 'বারো',
  13: 'তেরো',
  14: 'চৌদ্দ',
  15: 'পনেরো',
  16: 'ষোলো',
  17: 'সতেরো',
  18: 'আঠারো',
  19: 'উনিশ',
  20: 'বিশ',
  21: 'একুশ',
  22: 'বাইশ',
  23: 'তেইশ',
  24: 'চব্বিশ',
  25: 'পঁচিশ',
  26: 'ছাব্বিশ',
  27: 'সাতাইশ',
  28: 'আঠাশ',
  29: 'উনত্রিশ',
  30: 'ত্রিশ',
  31: 'একত্রিশ',
  32: 'বত্রিশ',
  33: 'তেত্রিশ',
  34: 'চৌত্রিশ',
  35: 'পঁয়ত্রিশ',
  36: 'ছত্রিশ',
  37: 'সাইত্রিশ',
  38: 'আটত্রিশ',
  39: 'উনচল্লিশ',
  40: 'চল্লিশ',
  41: 'একচল্লিশ',
  42: 'বিয়াল্লিশ',
  43: 'তেতাল্লিশ',
  44: 'চুয়াল্লিশ',
  45: 'পঁয়তাল্লিশ',
  46: 'ছেচল্লিশ',
  47: 'সাতচল্লিশ',
  48: 'আটচল্লিশ',
  49: 'উনপঞ্চাশ',
  50: 'পঞ্চাশ',
  51: 'একান্ন',
  52: 'বায়ান্ন',
  53: 'তিপ্পান্ন',
  54: 'চুয়ান্ন',
  55: 'পঞ্চান্ন',
  56: 'ছাপ্পান্ন',
  57: 'সাতান্ন',
  58: 'আটান্ন',
  59: 'উনষাট',
  60: 'ষাট',
  61: 'একষট্টি',
  62: 'বাষট্টি',
  63: 'তেষট্টি',
  64: 'চৌষট্টি',
  65: 'পঁয়ষট্টি',
  66: 'ছেষট্টি',
  67: 'সাতষট্টি',
  68: 'আটষট্টি',
  69: 'উনসত্তর',
  70: 'সত্তর',
  71: 'একাত্তর',
  72: 'বাহাত্তর',
  73: 'তিয়াত্তর',
  74: 'চুয়াত্তর',
  75: 'পঁচাত্তর',
  76: 'ছিয়াত্তর',
  77: 'সাতাত্তর',
  78: 'আটাত্তর',
  79: 'উনআশি',
  80: 'আশি',
  81: 'একাশি',
  82: 'বিরাশি',
  83: 'তিরাশি',
  84: 'চুরাশি',
  85: 'পঁচাশি',
  86: 'ছিয়াশি',
  87: 'সাতাশি',
  88: 'আটাশি',
  89: 'উননব্বই',
  90: 'নব্বই',
  91: 'একানব্বই',
  92: 'বায়ানব্বই',
  93: 'তিরানব্বই',
  94: 'চুরানব্বই',
  95: 'পঁচানব্বই',
  96: 'ছিয়ানব্বই',
  97: 'সাতানব্বই',
  98: 'আটানব্বই',
  99: 'নিরানব্বই'
};

// Bengali Digits array
export const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

// Convert any string or number to Bengali Digits
export function toBanglaDigits(val: number | string): string {
  return String(val).replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)]);
}

// Convert Bengali digits in input to standard ASCII digits
export function banglaToAsciiDigits(str: string): string {
  return str.replace(/[০-৯]/g, (char) => {
    return String(BANGLA_DIGITS.indexOf(char));
  });
}

// Bengali Hundreds (100 - 900)
export const BANGLA_HUNDREDS: { [key: number]: string } = {
  1: 'একশত',
  2: 'দুইশত',
  3: 'তিনশত',
  4: 'চারশত',
  5: 'পাঁচশত',
  6: 'ছয়শত',
  7: 'সাতশত',
  8: 'আটশত',
  9: 'নয়শত'
};

// Colloquial Hundreds (১০০ - ৯০০) for informal check wording e.g. "পনেরশ পঞ্চাশ"
export const BANGLA_HUNDREDS_COLLOQUIAL: { [key: number]: string } = {
  1: 'একশ',
  2: 'দুইশ',
  3: 'তিনশ',
  4: 'চারশ',
  5: 'পাঁচশ',
  6: 'ছয়শ',
  7: 'সাতশ',
  8: 'আটশ',
  9: 'নয়শ'
};

// Maximum allowed input amount: 99,99,99,99,999 (9999 কোটি / ~100 billion)
export const MAX_CONVERTIBLE_AMOUNT = 99999999999;

// Colloquial prefixes for 1100 to 1999 (e.g. ১৫০০ -> "পনেরশ")
const COLLOQUIAL_HUNDREDS_PREFIX: { [key: number]: string } = {
  11: 'এগারশ',
  12: 'বারশ',
  13: 'তেরশ',
  14: 'চৌদ্দশ',
  15: 'পনেরশ',
  16: 'ষোলশ',
  17: 'সতেরশ',
  18: 'আঠারশ',
  19: 'উনিশশ'
};

export interface ConversionResult {
  isValid: boolean;
  rawInput: string;
  normalizedNumber?: number;
  formattedBengaliNumber?: string;
  formattedEnglishNumber?: string;
  words?: string;
  wordsWithoutMatra?: string;
  colloquialWords?: string;
  englishWords?: string;
  englishWordsWithoutOnly?: string;
  englishInternationalWords?: string;
  warning?: string;
  error?: string;
}

const EN_ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

const EN_TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

export function convertUnderThousandToEnglish(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    parts.push(`${EN_ONES[hundreds]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones > 0) {
      parts.push(`${EN_TENS[tens]} ${EN_ONES[ones]}`);
    } else {
      parts.push(EN_TENS[tens]);
    }
  } else if (n > 0) {
    parts.push(EN_ONES[n]);
  }
  return parts.join(' ');
}

/**
 * Converts integer to English words using South Asian numbering (Lakh, Crore)
 * standard in Bangladeshi bank checks and official deeds.
 */
export function convertIntegerToEnglishWordsLakhCrore(n: number): string {
  if (n === 0) return 'Zero';

  const parts: string[] = [];

  // Crore (1,00,00,000)
  if (n >= 10000000) {
    const crores = Math.floor(n / 10000000);
    parts.push(`${convertIntegerToEnglishWordsLakhCrore(crores)} Crore`);
    n %= 10000000;
  }

  // Lakh (1,00,000)
  if (n >= 100000) {
    const lakhs = Math.floor(n / 100000);
    parts.push(`${convertUnderThousandToEnglish(lakhs)} Lakh`);
    n %= 100000;
  }

  // Thousand (1,000)
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    parts.push(`${convertUnderThousandToEnglish(thousands)} Thousand`);
    n %= 1000;
  }

  // Remainder (< 1,000)
  if (n > 0) {
    parts.push(convertUnderThousandToEnglish(n));
  }

  return parts.join(' ');
}

/**
 * Converts integer to English words using International Western numbering (Million, Billion)
 */
export function convertIntegerToEnglishWordsInternational(n: number): string {
  if (n === 0) return 'Zero';

  const parts: string[] = [];

  // Billion (1,000,000,000)
  if (n >= 1000000000) {
    const billions = Math.floor(n / 1000000000);
    parts.push(`${convertUnderThousandToEnglish(billions)} Billion`);
    n %= 1000000000;
  }

  // Million (1,000,000)
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    parts.push(`${convertUnderThousandToEnglish(millions)} Million`);
    n %= 1000000;
  }

  // Thousand (1,000)
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    parts.push(`${convertUnderThousandToEnglish(thousands)} Thousand`);
    n %= 1000;
  }

  // Remainder (< 1,000)
  if (n > 0) {
    parts.push(convertUnderThousandToEnglish(n));
  }

  return parts.join(' ');
}

/**
 * Formats full English words with Taka and Paisa
 */
export function formatAmountInEnglishWords(
  integerVal: number,
  paisaVal: number,
  system: 'lakh-crore' | 'international' = 'lakh-crore'
): { fullWords: string; wordsWithoutOnly: string } {
  if (integerVal === 0 && paisaVal === 0) {
    return {
      fullWords: 'Zero Taka Only',
      wordsWithoutOnly: 'Zero Taka',
    };
  }

  const parts: string[] = [];

  if (integerVal > 0) {
    const intWords = system === 'lakh-crore'
      ? convertIntegerToEnglishWordsLakhCrore(integerVal)
      : convertIntegerToEnglishWordsInternational(integerVal);
    parts.push(`${intWords} Taka`);
  }

  if (paisaVal > 0) {
    const paisaWords = convertUnderThousandToEnglish(paisaVal);
    if (parts.length > 0) {
      parts.push(`and ${paisaWords} Paisa`);
    } else {
      parts.push(`${paisaWords} Paisa`);
    }
  }

  const wordsWithoutOnly = parts.join(' ');
  const fullWords = `${wordsWithoutOnly} Only`;

  return { fullWords, wordsWithoutOnly };
}

/**
 * Converts whole integer amount (< 1 Crore) to Bengali words
 */
function convertUnderOneCrore(n: number): string {
  if (n === 0) return '';

  const parts: string[] = [];

  // Lakh (100,000)
  const lakh = Math.floor(n / 100000);
  if (lakh > 0) {
    parts.push(`${BANGLA_ONES_AND_TENS[lakh]} লক্ষ`);
  }

  // Thousand (1,000)
  const thousand = Math.floor((n % 100000) / 1000);
  if (thousand > 0) {
    parts.push(`${BANGLA_ONES_AND_TENS[thousand]} হাজার`);
  }

  // Hundred (100)
  const hundred = Math.floor((n % 1000) / 100);
  if (hundred > 0) {
    parts.push(BANGLA_HUNDREDS[hundred] || `${BANGLA_ONES_AND_TENS[hundred]} শত`);
  }

  // Last 2 digits (1 - 99)
  const rem = n % 100;
  if (rem > 0) {
    parts.push(BANGLA_ONES_AND_TENS[rem]);
  }

  return parts.join(' ');
}

/**
 * Recursively converts any positive integer up to MAX_CONVERTIBLE_AMOUNT
 */
export function convertIntegerToBengaliWords(n: number): string {
  if (n === 0) {
    return 'শূন্য';
  }

  const ONE_CRORE = 10000000;

  if (n < ONE_CRORE) {
    return convertUnderOneCrore(n);
  }

  const crore = Math.floor(n / ONE_CRORE);
  const remainder = n % ONE_CRORE;

  const croreWords = `${convertIntegerToBengaliWords(crore)} কোটি`;

  if (remainder > 0) {
    return `${croreWords} ${convertUnderOneCrore(remainder)}`;
  }

  return croreWords;
}

/**
 * Format a number into Bangladeshi Comma Style (e.g. 12,34,56,789.50)
 */
export function formatBangladeshiCurrency(numStr: string): string {
  const [intPart, decPart] = numStr.split('.');
  if (!intPart) return numStr;

  let result = '';
  const len = intPart.length;

  if (len <= 3) {
    result = intPart;
  } else {
    // Last 3 digits
    const lastThree = intPart.substring(len - 3);
    const otherDigits = intPart.substring(0, len - 3);

    // Group other digits by 2s from right to left
    const pairs: string[] = [];
    let i = otherDigits.length;
    while (i > 0) {
      const start = Math.max(0, i - 2);
      pairs.unshift(otherDigits.substring(start, i));
      i -= 2;
    }

    result = pairs.join(',') + ',' + lastThree;
  }

  return decPart !== undefined ? `${result}.${decPart}` : result;
}

/**
 * Primary conversion function for user input
 */
export function convertAmountToBengaliWords(input: string): ConversionResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      isValid: false,
      rawInput: input,
      error: 'অনুগ্রহ করে টাকার পরিমাণ লিখুন।'
    };
  }

  // Check for negative signs
  if (trimmed.startsWith('-') || trimmed.includes('-')) {
    return {
      isValid: false,
      rawInput: input,
      error: 'ঋণাত্মক (নেগেটিভ) টাকার পরিমাণ গ্রহণযোগ্য নয়।'
    };
  }

  // Convert Bengali numerals to ASCII & strip currency symbols and commas
  let cleaned = banglaToAsciiDigits(trimmed)
    .replace(/[৳,\s]/g, '');

  // Handle leading dot e.g. ".50" -> "0.50"
  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned;
  }
  // Handle trailing dot during typing e.g. "100." -> "100"
  if (cleaned.endsWith('.')) {
    cleaned = cleaned.slice(0, -1);
  }

  if (!cleaned) {
    return {
      isValid: false,
      rawInput: input,
      error: 'অনুগ্রহ করে টাকার পরিমাণ লিখুন।'
    };
  }

  // Validate number format (allow optional decimal point with digits)
  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    return {
      isValid: false,
      rawInput: input,
      error: 'সঠিক সংখ্যা প্রদান করুন (শুধু সংখ্যা এবং দশমিক গ্রহণযোগ্য)।'
    };
  }

  const parts = cleaned.split('.');
  const integerPartStr = parts[0];
  const decimalPartStr = parts[1] || '';

  const integerVal = parseInt(integerPartStr, 10);

  if (isNaN(integerVal)) {
    return {
      isValid: false,
      rawInput: input,
      error: 'সংখ্যাটি সঠিক নয়।'
    };
  }

  if (integerVal > MAX_CONVERTIBLE_AMOUNT) {
    return {
      isValid: false,
      rawInput: input,
      error: `সর্বোচ্চ সীমা অতিক্রম করেছে (সর্বোচ্চ ${toBanglaDigits('99,99,99,99,999')} টাকা, অর্থাৎ প্রায় ৯,৯৯৯ কোটি টাকা পর্যন্ত সমর্থিত)।`
    };
  }

  let warning: string | undefined;
  let paisa = 0;

  if (decimalPartStr.length > 0) {
    if (decimalPartStr.length > 2) {
      warning = 'পয়সায় ২টির বেশি দশমিক অঙ্ক থাকায় নিকটবর্তী পয়সায় রাউন্ড করা হয়েছে।';
    }
    // Parse as 2 decimal places (cents/paisa)
    const normalizedDecimal = parseFloat(`0.${decimalPartStr}`);
    paisa = Math.round(normalizedDecimal * 100);
  }

  // Handle case where paisa rounds to 100
  let adjustedInteger = integerVal;
  if (paisa === 100) {
    adjustedInteger += 1;
    paisa = 0;
  }

  // Edge case 0
  if (adjustedInteger === 0 && paisa === 0) {
    return {
      isValid: true,
      rawInput: input,
      normalizedNumber: 0,
      formattedBengaliNumber: '০.০০',
      formattedEnglishNumber: '0.00',
      words: 'শূন্য টাকা মাত্র',
      wordsWithoutMatra: 'শূন্য টাকা',
      englishWords: 'Zero Taka Only',
      englishWordsWithoutOnly: 'Zero Taka',
      warning
    };
  }

  const wordSegments: string[] = [];

  // Integer words
  if (adjustedInteger > 0) {
    const takaWords = convertIntegerToBengaliWords(adjustedInteger);
    wordSegments.push(`${takaWords} টাকা`);
  }

  // Paisa words
  if (paisa > 0) {
    const paisaWords = BANGLA_ONES_AND_TENS[paisa] || convertIntegerToBengaliWords(paisa);
    wordSegments.push(`${paisaWords} পয়সা`);
  }

  const fullSentenceWithoutMatra = wordSegments.join(' ');
  const officialWording = `${fullSentenceWithoutMatra} মাত্র`;

  // Optional colloquial variant for 1,100 to 9,999 (e.g. 1550 -> "পনেরশ পঞ্চাশ টাকা ...")
  let colloquialWords: string | undefined;
  if (adjustedInteger >= 1100 && adjustedInteger < 2000 && adjustedInteger % 1000 >= 100) {
    const hundredsCount = Math.floor(adjustedInteger / 100);
    const rest = adjustedInteger % 100;
    const hundredsWord = COLLOQUIAL_HUNDREDS_PREFIX[hundredsCount] || '';
    if (hundredsWord) {
      const restWord = rest > 0 ? ` ${BANGLA_ONES_AND_TENS[rest]}` : '';
      const paisaPart = paisa > 0 ? ` ${BANGLA_ONES_AND_TENS[paisa] || paisa} পয়সা` : '';
      colloquialWords = `${hundredsWord}${restWord} টাকা${paisaPart} মাত্র`;
    }
  }

  // English In Words representation (Lakh/Crore for Bangladeshi banking and Million/Billion international)
  const enLakhCrore = formatAmountInEnglishWords(adjustedInteger, paisa, 'lakh-crore');
  const enInternational = formatAmountInEnglishWords(adjustedInteger, paisa, 'international');

  const englishWords = enLakhCrore.fullWords;
  const englishWordsWithoutOnly = enLakhCrore.wordsWithoutOnly;
  const englishInternationalWords = (adjustedInteger >= 1000000)
    ? enInternational.fullWords
    : undefined;

  // Formatted representations
  const formattedRawEn = formatBangladeshiCurrency(
    paisa > 0 ? `${adjustedInteger}.${String(paisa).padStart(2, '0')}` : `${adjustedInteger}`
  );
  const formattedRawBn = toBanglaDigits(formattedRawEn);

  return {
    isValid: true,
    rawInput: input,
    normalizedNumber: adjustedInteger + paisa / 100,
    formattedBengaliNumber: formattedRawBn,
    formattedEnglishNumber: formattedRawEn,
    words: officialWording,
    wordsWithoutMatra: fullSentenceWithoutMatra,
    colloquialWords,
    englishWords,
    englishWordsWithoutOnly,
    englishInternationalWords,
    warning
  };
}
