export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export type CaseType =
  | 'sentence'
  | 'lower'
  | 'upper'
  | 'capitalized'
  | 'alternating'
  | 'inverse'
  | 'kebab'
  | 'snake'
  | 'camel'
  | 'pascal';

/**
 * Sentence case: capitalizes first letter after sentence terminators (. ! ?)
 */
export function toSentenceCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/(^\s*|\.\s*|\!\s*|\?\s*|\n\s*)([a-z])/g, (_, prefix, letter) => {
      return prefix + letter.toUpperCase();
    });
}

/**
 * Lower case
 */
export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

/**
 * Upper case
 */
export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

/**
 * Capitalized Case / Title Case (first letter of each word)
 */
export function toCapitalizedCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\b([a-z])/g, (char) => char.toUpperCase());
}

/**
 * aLtErNaTiNg cAsE
 */
export function toAlternatingCase(text: string): string {
  let toUpper = false;
  let result = '';
  for (const char of text) {
    if (/[a-zA-Z]/.test(char)) {
      result += toUpper ? char.toUpperCase() : char.toLowerCase();
      toUpper = !toUpper;
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Invert case: flips uppercase to lowercase and vice versa
 */
export function toInverseCase(text: string): string {
  let result = '';
  for (const char of text) {
    if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      result += char.toLowerCase();
    } else if (char === char.toLowerCase() && char !== char.toUpperCase()) {
      result += char.toUpperCase();
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * kebab-case
 */
export function toKebabCase(text: string): string {
  return text
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * snake_case
 */
export function toSnakeCase(text: string): string {
  return text
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * camelCase
 */
export function toCamelCase(text: string): string {
  const words = text.trim().split(/[\s\-_]+/);
  if (words.length === 0) return '';
  return words
    .map((w, i) => {
      if (i === 0) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * PascalCase
 */
export function toPascalCase(text: string): string {
  const words = text.trim().split(/[\s\-_]+/);
  if (words.length === 0) return '';
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/**
 * Removes duplicate consecutive whitespace spaces within lines
 */
export function removeExtraSpaces(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n');
}

/**
 * Removes blank / empty lines
 */
export function removeEmptyLines(text: string): string {
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .join('\n');
}

/**
 * Trims leading and trailing spaces from each individual line
 */
export function trimLines(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .join('\n');
}

/**
 * Computes word, char, line, and paragraph statistics
 */
export function computeTextStats(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  const lines = text ? text.split('\n').length : 0;
  const paragraphs = text
    ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    : 0;

  // Words matching Bengali words or English words
  const wordsMatches = text.trim().match(/[\S]+/g);
  const words = wordsMatches ? wordsMatches.length : 0;

  const readingTimeMinutes = Math.ceil(words / 200);

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    paragraphs,
    readingTimeMinutes,
  };
}
