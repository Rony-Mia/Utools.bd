import { TypingTestResult, TypingLanguage } from './typingTest.ts';

export const STORAGE_KEY = 'utools_typing_history';
export const MAX_HISTORY_ITEMS = 200;

export interface TypingHistoryItem {
  id: string;
  date: string; // ISO string
  wpm: number;
  rawWpm: number;
  accuracy: number;
  language: TypingLanguage;
  mode: '15' | '30' | '60' | '120' | 'custom';
  elapsedSeconds: number;
  totalTypedChars: number;
  correctChars: number;
  uncorrectedErrors: number;
}

export interface BackupPayload {
  version: number;
  app: string;
  exportedAt: string;
  history: TypingHistoryItem[];
}

/**
 * Checks whether localStorage is available and writable.
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves the full typing history array from localStorage.
 */
export function getHistory(): TypingHistoryItem[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter valid items
    return parsed.filter(item => (
      item &&
      typeof item.id === 'string' &&
      typeof item.wpm === 'number' &&
      typeof item.accuracy === 'number' &&
      (item.language === 'bangla' || item.language === 'english')
    ));
  } catch (err) {
    console.warn('[typingHistory] Failed to read history:', err);
    return [];
  }
}

/**
 * Saves a finished test result to history. Maintains a maximum of 200 items.
 */
export function saveTestResult(result: TypingTestResult): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    const existing = getHistory();
    const item: TypingHistoryItem = {
      id: result.id,
      date: result.date,
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      language: result.language,
      mode: result.durationMode,
      elapsedSeconds: Math.round(result.elapsedSeconds),
      totalTypedChars: result.totalTypedChars,
      correctChars: result.correctChars,
      uncorrectedErrors: result.uncorrectedErrors,
    };

    // Prepend newest first
    const updated = [item, ...existing.filter(i => i.id !== item.id)].slice(0, MAX_HISTORY_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.warn('[typingHistory] Failed to save test result:', err);
    return false;
  }
}

/**
 * Calculates personal best result for a given language and mode (or overall).
 */
export function getPersonalBest(
  language?: TypingLanguage | 'all',
  mode?: string | 'all'
): TypingHistoryItem | null {
  const history = getHistory();
  if (history.length === 0) return null;

  const filtered = history.filter(item => {
    if (language && language !== 'all' && item.language !== language) return false;
    if (mode && mode !== 'all' && item.mode !== mode) return false;
    return true;
  });

  if (filtered.length === 0) return null;

  return filtered.reduce((best, curr) => {
    if (!best) return curr;
    if (curr.wpm > best.wpm) return curr;
    if (curr.wpm === best.wpm && curr.accuracy > best.accuracy) return curr;
    return best;
  }, null as TypingHistoryItem | null);
}

/**
 * Clears all typing history from localStorage.
 */
export function clearHistory(): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.warn('[typingHistory] Failed to clear history:', err);
    return false;
  }
}

/**
 * Exports history as a standardized JSON backup payload.
 */
export function exportHistoryJson(): string {
  const history = getHistory();
  const payload: BackupPayload = {
    version: 1,
    app: 'utools.bd',
    exportedAt: new Date().toISOString(),
    history,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Validates a parsed backup object structure.
 */
export function validateBackup(data: unknown): data is BackupPayload {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number' || !Array.isArray(obj.history)) {
    return false;
  }

  // Validate that every item in history has required fields
  for (const item of obj.history) {
    if (!item || typeof item !== 'object') return false;
    const it = item as Record<string, unknown>;
    if (
      typeof it.wpm !== 'number' ||
      typeof it.accuracy !== 'number' ||
      it.wpm < 0 ||
      it.accuracy < 0 ||
      it.accuracy > 100 ||
      (it.language !== 'bangla' && it.language !== 'english')
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Imports history JSON with 'merge' (default, deduped by id/date) or 'replace' mode.
 */
export function importBackup(
  jsonString: string,
  mode: 'merge' | 'replace'
): { success: boolean; count: number; error?: string } {
  if (!isLocalStorageAvailable()) {
    return { success: false, count: 0, error: 'লোকাল স্টোরেজ সমর্থিত নয় বা পূর্ণ।' };
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (!validateBackup(parsed)) {
      return {
        success: false,
        count: 0,
        error: 'এই ব্যাকআপ ফাইলটি সঠিক নয়। অনুগ্রহ করে Utools.bd থেকে ডাউনলোড করা একটি JSON backup ব্যবহার করুন।'
      };
    }

    const importedItems: TypingHistoryItem[] = parsed.history.map(item => ({
      id: item.id || `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: item.date || new Date().toISOString(),
      wpm: Math.round(Number(item.wpm) * 10) / 10,
      rawWpm: Math.round((Number(item.rawWpm) || Number(item.wpm)) * 10) / 10,
      accuracy: Math.round(Number(item.accuracy) * 10) / 10,
      language: item.language,
      mode: (item.mode as any) || '60',
      elapsedSeconds: Number(item.elapsedSeconds) || 60,
      totalTypedChars: Number(item.totalTypedChars) || 0,
      correctChars: Number(item.correctChars) || 0,
      uncorrectedErrors: Number(item.uncorrectedErrors) || 0,
    }));

    let finalHistory: TypingHistoryItem[];

    if (mode === 'replace') {
      finalHistory = importedItems.slice(0, MAX_HISTORY_ITEMS);
    } else {
      // Merge mode: deduplicate based on date and id
      const existing = getHistory();
      const existingKeys = new Set(existing.map(i => `${i.id}_${i.date}`));
      const newUnique = importedItems.filter(i => !existingKeys.has(`${i.id}_${i.date}`));
      finalHistory = [...newUnique, ...existing]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, MAX_HISTORY_ITEMS);
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finalHistory));
    return { success: true, count: finalHistory.length };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      error: 'ব্যাকআপ ফাইল পড়তে ব্যর্থ হয়েছে: ' + (err?.message || 'Invalid format')
    };
  }
}
