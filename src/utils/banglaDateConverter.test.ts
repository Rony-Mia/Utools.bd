import assert from 'node:assert';
import {
  gregorianToBangla,
  banglaToGregorian,
  isGregorianLeapYear,
  getBanglaMonthLengths,
} from './banglaDateConverter';

export function runBanglaDateTests() {
  console.log('Running banglaDateConverter tests...');

  // 1. Gregorian leap years
  assert.strictEqual(isGregorianLeapYear(2024), true, '2024 should be a leap year');
  assert.strictEqual(isGregorianLeapYear(2025), false, '2025 should not be a leap year');
  assert.strictEqual(isGregorianLeapYear(2000), true, '2000 should be a leap year');
  assert.strictEqual(isGregorianLeapYear(1900), false, '1900 should not be a leap year');
  console.log('✓ Gregorian leap year check passed');

  // 2. Bangla Month lengths
  // startGregorianYear 2024 -> Falgun falls in 2025 (non-leap year)
  const lengths2024 = getBanglaMonthLengths(2024);
  assert.strictEqual(lengths2024[10], 29, 'Falgun should have 29 days in a non-leap year');
  assert.strictEqual(lengths2024[11], 30, 'Chaitra should have 30 days');
  assert.strictEqual(lengths2024.reduce((a, b) => a + b, 0), 365, 'Total year days should be 365');

  // startGregorianYear 2023 -> Falgun falls in 2024 (leap year)
  const lengths2023 = getBanglaMonthLengths(2023);
  assert.strictEqual(lengths2023[10], 30, 'Falgun should have 30 days in a leap year');
  assert.strictEqual(lengths2023[11], 30, 'Chaitra should have 30 days');
  assert.strictEqual(lengths2023.reduce((a, b) => a + b, 0), 366, 'Total leap year days should be 366');
  console.log('✓ Month lengths check passed');

  // 3. Pohela Boishakh (April 14)
  const pb2024 = gregorianToBangla(new Date(2024, 3, 14));
  assert.strictEqual(pb2024.day, 1, 'April 14 should be 1st day');
  assert.strictEqual(pb2024.monthName, 'বৈশাখ', 'April 14 should be Boishakh');
  assert.strictEqual(pb2024.year, 1431, 'Bangla year should be 1431');

  const pb2025 = gregorianToBangla(new Date(2025, 3, 14));
  assert.strictEqual(pb2025.day, 1);
  assert.strictEqual(pb2025.monthName, 'বৈশাখ');
  assert.strictEqual(pb2025.year, 1432);
  console.log('✓ Pohela Boishakh check passed');

  // 4. Independence Day (March 26) -> ALWAYS 12 Chaitra under Bangla Academy 2019 standard
  const indep2024 = gregorianToBangla(new Date(2024, 2, 26)); // Leap year 2024
  assert.strictEqual(indep2024.day, 12, 'March 26, 2024 must be 12 Chaitra');
  assert.strictEqual(indep2024.monthName, 'চৈত্র');

  const indep2025 = gregorianToBangla(new Date(2025, 2, 26)); // Non-leap year 2025
  assert.strictEqual(indep2025.day, 12, 'March 26, 2025 must be 12 Chaitra');
  assert.strictEqual(indep2025.monthName, 'চৈত্র');
  console.log('✓ Independence Day (12 Chaitra) check passed');

  // 5. Language Movement Day (February 21) -> ALWAYS 8 Falgun
  const lang2024 = gregorianToBangla(new Date(2024, 1, 21));
  assert.strictEqual(lang2024.day, 8, 'Feb 21, 2024 must be 8 Falgun');
  assert.strictEqual(lang2024.monthName, 'ফাল্গুন');

  const lang2025 = gregorianToBangla(new Date(2025, 1, 21));
  assert.strictEqual(lang2025.day, 8, 'Feb 21, 2025 must be 8 Falgun');
  assert.strictEqual(lang2025.monthName, 'ফাল্গুন');
  console.log('✓ Language Movement Day (8 Falgun) check passed');

  // 6. Victory Day (December 16) -> ALWAYS 1 Poush
  const vic2024 = gregorianToBangla(new Date(2024, 11, 16));
  assert.strictEqual(vic2024.day, 1, 'Dec 16 must be 1 Poush');
  assert.strictEqual(vic2024.monthName, 'পৌষ');
  console.log('✓ Victory Day (1 Poush) check passed');

  // 7. Roundtrip conversion banglaToGregorian
  const gDate1 = banglaToGregorian(1, 0, 1431);
  assert.strictEqual(gDate1.getFullYear(), 2024);
  assert.strictEqual(gDate1.getMonth(), 3);
  assert.strictEqual(gDate1.getDate(), 14);

  const gDate2 = banglaToGregorian(12, 11, 1431);
  assert.strictEqual(gDate2.getFullYear(), 2025);
  assert.strictEqual(gDate2.getMonth(), 2);
  assert.strictEqual(gDate2.getDate(), 26);
  console.log('✓ Roundtrip conversion check passed');

  console.log('All banglaDateConverter tests passed successfully!');
}

// Auto-run if executed directly
runBanglaDateTests();
