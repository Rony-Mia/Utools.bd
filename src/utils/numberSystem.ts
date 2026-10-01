export type NumberBase = 2 | 8 | 10 | 16;

export interface ConversionResult {
  binary: string;
  octal: string;
  decimal: string;
  hexadecimal: string;
  isValid: boolean;
  error?: string;
}

export interface StepExplanation {
  title: string;
  description: string;
  steps: string[];
}

export interface TwosComplementResult {
  decimal: number;
  bits: 8 | 16;
  signBit: '0' | '1';
  trueBinary: string;
  onesComplement: string;
  twosComplement: string;
  explanation: string[];
}

/**
 * Validates a number string for a given base.
 */
export function isValidBaseNumber(val: string, base: NumberBase): boolean {
  const trimmed = val.trim();
  if (!trimmed) return false;

  const parts = trimmed.split('.');
  if (parts.length > 2) return false; // More than one radix point

  let regex: RegExp;
  switch (base) {
    case 2:
      regex = /^[01]+(\.[01]+)?$/;
      break;
    case 8:
      regex = /^[0-7]+(\.[0-7]+)?$/;
      break;
    case 10:
      regex = /^[0-9]+(\.[0-9]+)?$/;
      break;
    case 16:
      regex = /^[0-9a-fA-F]+(\.[0-9a-fA-F]+)?$/;
      break;
    default:
      return false;
  }

  return regex.test(trimmed);
}

/**
 * Converts a fractional part from any base to decimal fraction (0 to 1).
 */
function fractionalToDecimal(fracStr: string, base: NumberBase): number {
  let result = 0;
  for (let i = 0; i < fracStr.length; i++) {
    const digitVal = parseInt(fracStr[i], base);
    result += digitVal / Math.pow(base, i + 1);
  }
  return result;
}

/**
 * Converts a decimal fraction (0 to 1) to a fractional string in the target base.
 * Limits to 8 fractional digits to prevent infinite repeating decimals.
 */
function decimalFractionToBase(decFrac: number, base: NumberBase, maxDigits = 8): string {
  if (decFrac === 0) return '';
  let result = '';
  let current = decFrac;

  for (let i = 0; i < maxDigits && current > 0; i++) {
    current *= base;
    const digit = Math.floor(current);
    result += digit.toString(base).toUpperCase();
    current -= digit;
  }

  return result;
}

/**
 * Converts any valid number string of a given base into all 4 bases.
 */
export function convertNumber(inputStr: string, fromBase: NumberBase): ConversionResult {
  const clean = inputStr.trim().toUpperCase();

  if (!clean) {
    return {
      binary: '',
      octal: '',
      decimal: '',
      hexadecimal: '',
      isValid: true,
    };
  }

  if (!isValidBaseNumber(clean, fromBase)) {
    return {
      binary: '',
      octal: '',
      decimal: '',
      hexadecimal: '',
      isValid: false,
      error: `ইনপুটটি ভিত্তি ${fromBase}-এর জন্য সঠিক নয়।`,
    };
  }

  const [intPart, fracPart] = clean.split('.');

  // 1. Convert integer part to decimal BigInt or number
  const decInt = parseInt(intPart, fromBase);
  if (isNaN(decInt)) {
    return {
      binary: '',
      octal: '',
      decimal: '',
      hexadecimal: '',
      isValid: false,
      error: 'সংখ্যা পার্স করতে ব্যর্থ।',
    };
  }

  // 2. Convert fraction part to decimal fraction
  const decFrac = fracPart ? fractionalToDecimal(fracPart, fromBase) : 0;
  const totalDec = decInt + decFrac;

  // 3. Format into all target bases
  const formatBase = (targetBase: NumberBase): string => {
    const intTarget = decInt.toString(targetBase).toUpperCase();
    if (!fracPart || decFrac === 0) return intTarget;
    const fracTarget = decimalFractionToBase(decFrac, targetBase);
    return fracTarget ? `${intTarget}.${fracTarget}` : intTarget;
  };

  return {
    binary: formatBase(2),
    octal: formatBase(8),
    decimal: fracPart && decFrac > 0 ? totalDec.toString() : decInt.toString(10),
    hexadecimal: formatBase(16),
    isValid: true,
  };
}

/**
 * Generates HSC ICT step-by-step conversion explanation in Bengali.
 */
export function getStepExplanation(
  inputStr: string,
  fromBase: NumberBase,
  toBase: NumberBase
): StepExplanation {
  const clean = inputStr.trim().toUpperCase();
  if (!clean || !isValidBaseNumber(clean, fromBase) || fromBase === toBase) {
    return {
      title: 'রূপান্তর নির্দেশিকা',
      description: 'অনুগ্রহ করে দুটি ভিন্ন ভিত্তি এবং সঠিক সংখ্যা নির্বাচন করুন।',
      steps: [],
    };
  }

  const [intPart, fracPart] = clean.split('.');
  const baseNames: Record<NumberBase, string> = {
    2: 'বাইনারি (ভিত্তি ২)',
    8: 'অক্টাল (ভিত্তি ৮)',
    10: 'ডেসিমাল (ভিত্তি ১০)',
    16: 'হেক্সাডেসিমেল (ভিত্তি ১৬)',
  };

  const title = `${baseNames[fromBase]} থেকে ${baseNames[toBase]} রূপান্তর পদ্ধতি`;
  const steps: string[] = [];

  // Case A: Decimal to Other Base
  if (fromBase === 10) {
    let num = parseInt(intPart, 10);
    steps.push(`১. পূর্ণসংখ্যা (${intPart})₁₀ কে ক্রমান্বয়ে ${toBase} দিয়ে ভাগ করে ভাগশেষগুলো নিচ থেকে উপরে (LSB থেকে MSB) সাজানো:`);

    if (num === 0) {
      steps.push(`• 0 ÷ ${toBase} = 0, ভাগশেষ = 0`);
    } else {
      const remainders: string[] = [];
      while (num > 0) {
        const rem = num % toBase;
        const remStr = rem.toString(toBase).toUpperCase();
        remainders.unshift(remStr);
        const quot = Math.floor(num / toBase);
        steps.push(`• ${num} ÷ ${toBase} = ${quot}, ভাগশেষ = ${remStr}`);
        num = quot;
      }
      steps.push(`-> পূর্ণাংশের ফলাফল = (${remainders.join('')})${toBase === 2 ? '₂' : toBase === 8 ? '₈' : '₁₆'}`);
    }

    if (fracPart) {
      steps.push(`২. ভগ্নাংশ (0.${fracPart})₁₀ কে ক্রমান্বয়ে ${toBase} দিয়ে গুণ করে পূর্ণাংশগুলো উপর থেকে নিচে সাজানো:`);
      let frac = fractionalToDecimal(fracPart, 10);
      const fracDigits: string[] = [];
      for (let i = 0; i < 5 && frac > 0; i++) {
        const product = frac * toBase;
        const digit = Math.floor(product);
        const digitStr = digit.toString(toBase).toUpperCase();
        fracDigits.push(digitStr);
        steps.push(`• 0.${frac.toFixed(4).substring(2)} × ${toBase} = ${product.toFixed(4)} (পূর্ণাংশ = ${digitStr})`);
        frac = product - digit;
      }
      steps.push(`-> ভগ্নাংশের ফলাফল = (0.${fracDigits.join('')})${toBase === 2 ? '₂' : toBase === 8 ? '₈' : '₁₆'}`);
    }

    return {
      title,
      description: `দশমিক সংখ্যাকে অন্য যেকোনো সংখ্যা পদ্ধতিতে রূপান্তর করতে পূর্ণসংখ্যাকে ভিত্তির মান দিয়ে ভাগ এবং ভগ্নাংশকে গুণ করা হয়।`,
      steps,
    };
  }

  // Case B: Other Base to Decimal
  if (toBase === 10) {
    steps.push(`১. প্রতিটি অঙ্ককে তার স্থানীয় মান (${fromBase}-এর পাওয়ার) দিয়ে গুণ করে যোগফল নির্ণয়:`);
    const intLen = intPart.length;
    const terms: string[] = [];
    let sum = 0;

    for (let i = 0; i < intLen; i++) {
      const power = intLen - 1 - i;
      const digitVal = parseInt(intPart[i], fromBase);
      const termVal = digitVal * Math.pow(fromBase, power);
      sum += termVal;
      terms.push(`${intPart[i]} × ${fromBase}^${power} [= ${termVal}]`);
    }

    steps.push(`• পূর্ণাংশ: ${terms.join(' + ')} = ${sum}`);

    if (fracPart) {
      steps.push(`২. ভগ্নাংশের ক্ষেত্রে ঋণাত্মক পাওয়ার (${fromBase}⁻¹, ${fromBase}⁻², ...) দিয়ে গুণ:`);
      const fracTerms: string[] = [];
      let fracSum = 0;
      for (let i = 0; i < fracPart.length; i++) {
        const power = -(i + 1);
        const digitVal = parseInt(fracPart[i], fromBase);
        const termVal = digitVal * Math.pow(fromBase, power);
        fracSum += termVal;
        fracTerms.push(`${fracPart[i]} × ${fromBase}^(${power}) [= ${termVal.toFixed(4)}]`);
      }
      steps.push(`• ভগ্নাংশ: ${fracTerms.join(' + ')} = ${fracSum.toFixed(4)}`);
      steps.push(`-> মোট ফলাফল: ${(sum + fracSum).toString()}₁₀`);
    } else {
      steps.push(`-> মোট ফলাফল: (${sum})₁₀`);
    }

    return {
      title,
      description: `ভিত্তি ${fromBase} থেকে ডেসিমাল সংখ্যায় রূপান্তরের সূত্র হলো প্রতিটি ডিজিট × ভিত্তির পাওয়ার।`,
      steps,
    };
  }

  // Case C: Binary <-> Octal or Binary <-> Hexadecimal
  if ((fromBase === 2 && toBase === 8) || (fromBase === 8 && toBase === 2)) {
    return {
      title,
      description: `অক্টাল সংখ্যা পদ্ধতির ভিত্তি ৮ = ২³। তাই প্রতি ১টি অক্টাল অঙ্ক সমান ৩টি বাইনারি বিট।`,
      steps: [
        `• অক্টাল ও বাইনারির মধ্যে সরাসরি ৩-বিট গ্রুপের মাধ্যমে রূপান্তর করা যায়।`,
        `• পূর্ণাংশের ক্ষেত্রে ডান থেকে বামে ৩টি করে বিটের গ্রুপ করতে হয় (কম পড়লে বামে শূন্য যোগ করতে হয়)।`,
        `• যেমন: 000=0, 001=1, 010=2, 011=3, 100=4, 101=5, 110=6, 111=7।`,
      ],
    };
  }

  if ((fromBase === 2 && toBase === 16) || (fromBase === 16 && toBase === 2)) {
    return {
      title,
      description: `হেক্সাডেসিমেল পদ্ধতির ভিত্তি ১৬ = ২⁴। তাই প্রতি ১টি হেক্সাডেসিমেল ডিজিট সমান ৪টি বাইনারি বিট।`,
      steps: [
        `• হেক্সাডেসিমেল ও বাইনারির মধ্যে সরাসরি ৪-বিট গ্রুপের মাধ্যমে রূপান্তর করা যায়।`,
        `• যেমন: 1010=A, 1011=B, 1100=C, 1101=D, 1110=E, 1111=F।`,
      ],
    };
  }

  // General fallback: via decimal
  return {
    title,
    description: `প্রথমে (${inputStr})${fromBase === 2 ? '₂' : fromBase === 8 ? '₈' : '₁₆'} কে ডেসিমাল (ভিত্তি ১০)-এ রূপান্তর করে অতঃপর কাঙ্ক্ষিত ভিত্তি ${toBase}-এ রূপান্তর করা হয়।`,
    steps: [
      `ধাপ ১: প্রদত্ত সংখ্যাটিকে ভিত্তি ১০-এ রূপান্তর করুন।`,
      `ধাপ ২: প্রাপ্ত ডেসিমাল সংখ্যাটিকে ভিত্তি ${toBase} দিয়ে ভাগ করে কাঙ্ক্ষিত ফলাফল বের করুন।`,
    ],
  };
}

/**
 * Calculates 1's and 2's complement of an integer in 8-bit or 16-bit format.
 */
export function calculateTwosComplement(decNum: number, bits: 8 | 16 = 8): TwosComplementResult {
  const isNegative = decNum < 0;
  const absVal = Math.abs(decNum);

  // Pad magnitude to binary
  let binStr = absVal.toString(2);
  binStr = binStr.padStart(bits, '0');

  // Invert bits for 1's complement
  let onesComp = '';
  for (const char of binStr) {
    onesComp += char === '0' ? '1' : '0';
  }

  // Add 1 for 2's complement
  let carry = 1;
  const twosArr = onesComp.split('');
  for (let i = bits - 1; i >= 0; i--) {
    const bit = parseInt(twosArr[i], 10);
    const sum = bit + carry;
    twosArr[i] = (sum % 2).toString();
    carry = Math.floor(sum / 2);
  }
  const twosComp = twosArr.join('');

  const explanation: string[] = [
    `১. পরম মান ${absVal} এর ${bits}-বিট বাইনারি রূপ: ${binStr}`,
    `২. ১-এর পরিপূরক (সব 0 কে 1 এবং 1 কে 0 করে): ${onesComp}`,
    `৩. ২-এর পরিপূরক (১-এর পরিপূরকের সাথে ১ যোগ করে): ${twosComp}`,
    isNegative
      ? `৪. যেহেতু মূল সংখ্যাটি ঋণাত্মক (${decNum}), তাই কম্পিউটারে এর সংরক্ষিত মান হবে ২-এর পরিপূরক: ${twosComp} (যেখানে প্রথম বিট ১ অর্থাৎ সংখ্যাটি ঋণাত্মক)।`
      : `৪. যেহেতু মূল সংখ্যাটি ধনাত্মক (+${decNum}), তাই সরাসরি প্রকৃত মান ব্যবহৃত হবে: ${binStr} (যেখানে প্রথম বিট ০ অর্থাৎ সংখ্যাটি ধনাত্মক)।`,
  ];

  return {
    decimal: decNum,
    bits,
    signBit: isNegative ? '1' : '0',
    trueBinary: binStr,
    onesComplement: onesComp,
    twosComplement: twosComp,
    explanation,
  };
}
