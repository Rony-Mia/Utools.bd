/**
 * Core Typing Test Engine & Standardized Metrics Calculation.
 * Implements the standard 5-character word-equivalent formula (WPM)
 * across both Bangla and English languages.
 */

import { bijoyToUnicode } from '../bijoyConverter.ts';

export type TypingLanguage = 'bangla' | 'english';
export type TypingKeyboardLayout = 'unicode' | 'bijoy' | 'bijoy_unicode';
export type TypingDuration = 15 | 30 | 60 | 120 | 'custom';
export type TypingDifficulty = 'easy' | 'hard';
export type TypingStatus = 'idle' | 'running' | 'finished';

export interface WpmSample {
  second: number;
  wpm: number; // Net WPM
  rawWpm: number;
  accuracy: number;
}

export interface TypingMetrics {
  rawWpm: number;
  netWpm: number;
  accuracy: number;
}

export interface TypingTestResult {
  id: string;
  date: string; // ISO string
  wpm: number; // Net WPM
  rawWpm: number;
  accuracy: number;
  totalTypedChars: number;
  correctChars: number;
  uncorrectedErrors: number;
  durationMode: '15' | '30' | '60' | '120' | 'custom';
  elapsedSeconds: number;
  language: TypingLanguage;
  keyboardLayout?: TypingKeyboardLayout;
  difficulty: TypingDifficulty;
  wpmTimeline: WpmSample[];
  charErrors: Record<string, number>;
}

/**
 * Standard WPM & Accuracy calculation logic.
 *
 * Formula:
 * - minutes = elapsedSeconds / 60
 * - rawWpm = (totalTypedCharacters / 5) / minutes
 * - netWpm = Math.max(0, rawWpm - (uncorrectedErrors / minutes))
 * - accuracy = (correctCharacters / totalTypedCharacters) * 100
 */
export function calculateTypingMetrics(
  totalTypedCharacters: number,
  correctCharacters: number,
  uncorrectedErrors: number,
  elapsedSeconds: number
): TypingMetrics {
  if (elapsedSeconds <= 0 || totalTypedCharacters <= 0) {
    return { rawWpm: 0, netWpm: 0, accuracy: 0 };
  }

  const minutes = elapsedSeconds / 60;
  if (minutes <= 0) {
    return { rawWpm: 0, netWpm: 0, accuracy: 0 };
  }

  // Raw WPM: standard 5-character word equivalent
  const rawWpmVal = (totalTypedCharacters / 5) / minutes;
  const rawWpm = Math.round(rawWpmVal * 10) / 10;

  // Net WPM: penalizes errors that were not corrected by the end of the test
  const errorPenalty = uncorrectedErrors / minutes;
  const netWpmVal = Math.max(0, rawWpmVal - errorPenalty);
  const netWpm = Math.round(netWpmVal * 10) / 10;

  // Accuracy: percentage of correctly typed characters
  const accuracyVal = (correctCharacters / totalTypedCharacters) * 100;
  const accuracy = Math.round(Math.min(100, Math.max(0, accuracyVal)) * 10) / 10;

  return {
    rawWpm: Number.isFinite(rawWpm) ? rawWpm : 0,
    netWpm: Number.isFinite(netWpm) ? netWpm : 0,
    accuracy: Number.isFinite(accuracy) ? accuracy : 0,
  };
}

/**
 * Character-by-character analysis between reference text and user input.
 */
export interface CharacterAnalysis {
  correctCount: number;
  uncorrectedErrorCount: number;
  totalTyped: number;
  errorChars: Record<string, number>;
}

export function analyzeTypingProgress(
  referenceText: string,
  userInput: string,
  keyboardLayout: TypingKeyboardLayout = 'unicode'
): CharacterAnalysis {
  let effectiveInput = userInput;
  if (keyboardLayout === 'bijoy') {
    // If user typed Bijoy Classic ANSI, convert to Unicode for matching
    const converted = bijoyToUnicode(userInput);
    if (converted && converted !== userInput) {
      effectiveInput = converted;
    }
  }

  const totalTyped = effectiveInput.length;
  let correctCount = 0;
  let uncorrectedErrorCount = 0;
  const errorChars: Record<string, number> = {};

  for (let i = 0; i < totalTyped; i++) {
    const inputChar = effectiveInput[i];
    const expectedChar = referenceText[i];

    if (inputChar === expectedChar) {
      correctCount++;
    } else {
      uncorrectedErrorCount++;
      // Count mistake on the intended character (or input character)
      const target = (expectedChar && expectedChar !== ' ') ? expectedChar.toLowerCase() : (inputChar ? inputChar.toLowerCase() : '');
      if (target) {
        errorChars[target] = (errorChars[target] || 0) + 1;
      }
    }
  }

  return {
    correctCount,
    uncorrectedErrorCount,
    totalTyped,
    errorChars,
  };
}

/**
 * Speed rating and friendly descriptive badge based on WPM.
 */
export interface SpeedRating {
  badge: string;
  colorClass: string;
  description: string;
}

export function getWpmRating(wpm: number, language: TypingLanguage): SpeedRating {
  if (language === 'bangla') {
    if (wpm >= 50) {
      return { badge: 'বিদ্যুৎগতি টাইপিস্ট (Master)', colorClass: 'text-amber-600 bg-amber-50 border-amber-200', description: 'অসাধারণ! আপনার বাংলা টাইপিং গতি জাতীয় পেশাদার মানের চেয়েও দ্রুত।' };
    }
    if (wpm >= 35) {
      return { badge: 'প্রফেশনাল (Professional)', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', description: 'খুব ভালো! সরকারি ও বেসরকারি চাকরির টাইপিং টেস্টে আপনি অনায়াসে উত্তীর্ণ হতে পারবেন।' };
    }
    if (wpm >= 20) {
      return { badge: 'মধ্যবর্তী (Intermediate)', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', description: 'ভালো গতি! নিয়মিত অনুশীলনে আপনি সহজেই ৩০+ WPM অর্জন করতে পারবেন।' };
    }
    return { badge: 'শিক্ষানবিস (Beginner)', colorClass: 'text-gray-700 bg-gray-50 border-gray-200', description: 'শুরু করার জন্য চমৎকার! নির্ভুলতার দিকে মনোযোগ দিয়ে নিয়মিত প্র্যাকটিস চালিয়ে যান।' };
  }

  // English benchmark
  if (wpm >= 70) {
    return { badge: 'Pro Typist (Master)', colorClass: 'text-amber-600 bg-amber-50 border-amber-200', description: 'Incredible speed! You are in the top tier of competitive typists.' };
  }
  if (wpm >= 50) {
    return { badge: 'Fast Typist (Advanced)', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', description: 'Great job! This is well above standard professional office benchmark (40 WPM).' };
  }
  if (wpm >= 30) {
    return { badge: 'Intermediate', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', description: 'Solid typing foundation. Focus on consistency and finger placement.' };
  }
  return { badge: 'Beginner', colorClass: 'text-gray-700 bg-gray-50 border-gray-200', description: 'Good start! Practice daily to reach 40+ WPM.' };
}
