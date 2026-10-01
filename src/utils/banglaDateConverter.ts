import { toBn } from './bnDigits.ts';

// Bangla Month Names
export const BANGLA_MONTHS = [
  'বৈশাখ',
  'জ্যৈষ্ঠ',
  'আষাঢ়',
  'শ্রাবণ',
  'ভাদ্র',
  'আশ্বিন',
  'কার্তিক',
  'অগ্রহায়ণ',
  'পৌষ',
  'মাঘ',
  'ফাল্গুন',
  'চৈত্র',
] as const;

// English Month Names in Bengali
export const GREGORIAN_MONTHS_BN = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
] as const;

// Bengali Weekdays
export const BANGLA_WEEKDAYS = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
] as const;

// Islamic / Hijri Month Names in Bengali
export const HIJRI_MONTHS_BN = [
  'মহররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানি',
  'জমাদিউল আউয়াল',
  'জমাদিউস সানি',
  'রজব',
  'শাবান',
  'রমজান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ্জ',
] as const;

// Bengali Seasons (ঋতু)
export const BANGLA_SEASONS = [
  { name: 'গ্রীষ্মকাল', months: 'বৈশাখ - জ্যৈষ্ঠ' },
  { name: 'বর্ষাকাল', months: 'আষাঢ় - শ্রাবণ' },
  { name: 'শরৎকাল', months: 'ভাদ্র - আশ্বিন' },
  { name: 'হেমন্তকাল', months: 'কার্তিক - অগ্রহায়ণ' },
  { name: 'শীতকাল', months: 'পৌষ - মাঘ' },
  { name: 'বসন্তকাল', months: 'ফাল্গুন - চৈত্র' },
] as const;

// Traditional Bengali Ordinal Suffixes for Dates (১লা, ২রা, ৩রা, ৪ঠা, ৫ই... ৩১শে)
export function getBanglaDateSuffix(day: number): string {
  const bnNum = toBn(day);
  if (day === 1) return `${bnNum}লা`;
  if (day === 2 || day === 3) return `${bnNum}রা`;
  if (day === 4) return `${bnNum}ঠা`;
  if (day >= 5 && day <= 18) return `${bnNum}ই`;
  if (day >= 19 && day <= 31) return `${bnNum}শে`;
  return `${bnNum}ই`;
}

// Gregorian Leap Year Check
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Bangladesh Bangla Academy 2019 Revised Calendar Month Days
// First 6 months (Boishakh - Ashwin) = 31 days each
// Next 5 months (Kartik - Falgun) = 30 days each
// Last month (Chaitra) = 29 days (30 in Gregorian leap year)
export function getBanglaMonthLengths(startGregorianYear: number): number[] {
  const isChaitraLeap = isGregorianLeapYear(startGregorianYear + 1);
  return [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isChaitraLeap ? 30 : 29];
}

export interface BanglaDateResult {
  day: number;
  dayWithSuffix: string;
  monthIndex: number;
  monthName: string;
  year: number;
  yearBn: string;
  weekdayIndex: number;
  weekdayName: string;
  seasonName: string;
  formattedFull: string;
  gregorianDate: Date;
  formattedGregorian: string;
}

/**
 * Converts a Gregorian Date to the official Bangladeshi Bangla Academy standard Bengali date.
 */
export function gregorianToBangla(date: Date): BanglaDateResult {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth(); // 0-indexed
  const gDay = date.getDate();

  // April 14 is 1st Boishakh in Bangladesh
  const isAfterPohelaBoishakh = gMonth > 3 || (gMonth === 3 && gDay >= 14);
  const bYear = isAfterPohelaBoishakh ? gYear - 593 : gYear - 594;
  const startGYear = isAfterPohelaBoishakh ? gYear : gYear - 1;

  // April 14 UTC reference
  const startApril14 = new Date(Date.UTC(startGYear, 3, 14));
  const currentUtc = new Date(Date.UTC(gYear, gMonth, gDay));

  const diffTime = currentUtc.getTime() - startApril14.getTime();
  const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 0 = 1st Boishakh

  const monthLengths = getBanglaMonthLengths(startGYear);
  let remainingDays = dayIndex;
  let bMonthIndex = 0;

  for (let i = 0; i < 12; i++) {
    if (remainingDays < monthLengths[i]) {
      bMonthIndex = i;
      break;
    }
    remainingDays -= monthLengths[i];
  }

  const bDay = remainingDays + 1;
  const weekdayIndex = date.getDay();
  const weekdayName = BANGLA_WEEKDAYS[weekdayIndex];
  const seasonIndex = Math.floor(bMonthIndex / 2);
  const season = BANGLA_SEASONS[seasonIndex] || BANGLA_SEASONS[0];

  const dayWithSuffix = getBanglaDateSuffix(bDay);
  const monthName = BANGLA_MONTHS[bMonthIndex];
  const yearBn = toBn(bYear);

  const formattedFull = `${dayWithSuffix} ${monthName}, ${yearBn} বঙ্গাব্দ, ${weekdayName}`;
  const formattedGregorian = `${toBn(gDay)} ${GREGORIAN_MONTHS_BN[gMonth]} ${toBn(gYear)}`;

  return {
    day: bDay,
    dayWithSuffix,
    monthIndex: bMonthIndex,
    monthName,
    year: bYear,
    yearBn,
    weekdayIndex,
    weekdayName,
    seasonName: season.name,
    formattedFull,
    gregorianDate: date,
    formattedGregorian,
  };
}

/**
 * Converts a Bengali Date back to a Gregorian Date.
 */
export function banglaToGregorian(bDay: number, bMonthIndex: number, bYear: number): Date {
  const startGYear = bYear + 593;
  const monthLengths = getBanglaMonthLengths(startGYear);

  let daysFromStart = 0;
  for (let i = 0; i < bMonthIndex; i++) {
    daysFromStart += monthLengths[i];
  }
  daysFromStart += bDay - 1;

  const startApril14 = new Date(Date.UTC(startGYear, 3, 14));
  const targetUtc = new Date(startApril14.getTime() + daysFromStart * 24 * 60 * 60 * 1000);

  return new Date(targetUtc.getUTCFullYear(), targetUtc.getUTCMonth(), targetUtc.getUTCDate());
}

export interface HijriDateResult {
  day: number;
  dayBn: string;
  monthIndex: number;
  monthName: string;
  year: number;
  yearBn: string;
  formattedFull: string;
}

/**
 * Calculates the approximate Hijri date using Intl Umm al-Qura standard with a mathematical fallback.
 */
export function getHijriDate(date: Date): HijriDateResult {
  try {
    // Primary: use native Intl Islamic Umm al-Qura calendar
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    let day = 1;
    let month = 1;
    let year = 1445;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10);
      if (part.type === 'month') month = parseInt(part.value, 10);
      if (part.type === 'year') year = parseInt(part.value, 10);
    }

    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthName = HIJRI_MONTHS_BN[monthIndex];
    const dayBn = toBn(day);
    const yearBn = toBn(year);
    const formattedFull = `${dayBn}ই ${monthName}, ${yearBn} হিজরি`;

    return {
      day,
      dayBn,
      monthIndex,
      monthName,
      year,
      yearBn,
      formattedFull,
    };
  } catch {
    // Fallback: Kuwaiti algorithm
    const d = date.getDate();
    let m = date.getMonth() + 1;
    let y = date.getFullYear();

    if (m < 3) {
      y -= 1;
      m += 12;
    }

    const a = Math.floor(y / 100);
    let b = 2 - a + Math.floor(a / 4);
    if (y < 1583) b = 0;

    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524;
    const epochDate = jd - 1948440 + 10632;
    const n = Math.floor((epochDate - 1) / 10631);
    const ep2 = epochDate - 10631 * n + 354;
    const j =
      Math.floor((10985 - ep2) / 5316) * Math.floor((50 * ep2) / 17719) +
      Math.floor(ep2 / 5670) * Math.floor((43 * ep2) / 15238);
    const ep3 =
      ep2 -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const mIslamic = Math.floor((24 * ep3) / 709);
    const dIslamic = ep3 - Math.floor((709 * mIslamic) / 24);
    const yIslamic = 30 * n + j - 30;

    const monthIndex = Math.max(0, Math.min(11, mIslamic - 1));
    const monthName = HIJRI_MONTHS_BN[monthIndex];
    const dayBn = toBn(dIslamic);
    const yearBn = toBn(yIslamic);
    const formattedFull = `${dayBn}ই ${monthName}, ${yearBn} হিজরি`;

    return {
      day: dIslamic,
      dayBn,
      monthIndex,
      monthName,
      year: yIslamic,
      yearBn,
      formattedFull,
    };
  }
}

// Bangladesh National & Public Holidays (Solar and Common Dates)
export interface PublicHoliday {
  name: string;
  type: 'national' | 'festival' | 'govt';
  gregorianMatch?: { month: number; day: number }; // 0-indexed month
  banglaMatch?: { monthIndex: number; day: number };
}

export const BANGLADESH_HOLIDAYS: PublicHoliday[] = [
  {
    name: 'শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস',
    type: 'national',
    gregorianMatch: { month: 1, day: 21 }, // Feb 21
  },
  {
    name: 'জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমানের জন্মদিবস ও জাতীয় শিশু দিবস (ঐতিহাসিক)',
    type: 'national',
    gregorianMatch: { month: 2, day: 17 }, // March 17
  },
  {
    name: 'স্বাধীনতা ও জাতীয় দিবস',
    type: 'national',
    gregorianMatch: { month: 2, day: 26 }, // March 26
  },
  {
    name: 'বাংলা নববর্ষ / পহেলা বৈশাখ',
    type: 'festival',
    gregorianMatch: { month: 3, day: 14 }, // April 14
    banglaMatch: { monthIndex: 0, day: 1 },
  },
  {
    name: 'আন্তর্জাতিক মে দিবস (শ্রমিক দিবস)',
    type: 'govt',
    gregorianMatch: { month: 4, day: 1 }, // May 1
  },
  {
    name: 'জাতীয় শোক দিবস (ঐতিহাসিক)',
    type: 'national',
    gregorianMatch: { month: 7, day: 15 }, // August 15
  },
  {
    name: 'বিজয় দিবস',
    type: 'national',
    gregorianMatch: { month: 11, day: 16 }, // December 16
  },
  {
    name: 'যিশু খ্রিস্টের জন্মদিন (বড়দিন)',
    type: 'festival',
    gregorianMatch: { month: 11, day: 25 }, // December 25
  },
];

/**
 * Checks if the given date is a national or public holiday in Bangladesh.
 */
export function checkBangladeshHoliday(date: Date, banglaMonthIdx?: number, banglaDay?: number): PublicHoliday | null {
  const gMonth = date.getMonth();
  const gDay = date.getDate();

  for (const holiday of BANGLADESH_HOLIDAYS) {
    if (holiday.gregorianMatch && holiday.gregorianMatch.month === gMonth && holiday.gregorianMatch.day === gDay) {
      return holiday;
    }
    if (
      holiday.banglaMatch &&
      banglaMonthIdx !== undefined &&
      banglaDay !== undefined &&
      holiday.banglaMatch.monthIndex === banglaMonthIdx &&
      holiday.banglaMatch.day === banglaDay
    ) {
      return holiday;
    }
  }

  return null;
}
