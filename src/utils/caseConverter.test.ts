import {
  toSentenceCase,
  toLowerCase,
  toUpperCase,
  toCapitalizedCase,
  toAlternatingCase,
  toInverseCase,
  toKebabCase,
  toSnakeCase,
  toCamelCase,
  toPascalCase,
  removeExtraSpaces,
  removeEmptyLines,
  trimLines,
  computeTextStats,
} from './caseConverter.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runCaseConverterTests() {
  console.log('Running caseConverter tests...');

  // 1. Lower & Upper
  assert(toLowerCase('HeLLo WoRLD') === 'hello world', 'toLowerCase should produce hello world');
  assert(toUpperCase('hello world') === 'HELLO WORLD', 'toUpperCase should produce HELLO WORLD');
  console.log('✓ Upper and lower case tests passed');

  // 2. Sentence Case
  const sent = toSentenceCase('hello world. this is utools! how are you?');
  assert(
    sent === 'Hello world. This is utools! How are you?',
    `Sentence case mismatch: ${sent}`
  );
  console.log('✓ Sentence case tests passed');

  // 3. Capitalized (Title) Case
  const cap = toCapitalizedCase('the quick brown fox');
  assert(cap === 'The Quick Brown Fox', `Capitalized case mismatch: ${cap}`);
  console.log('✓ Capitalized case tests passed');

  // 4. Alternating & Invert Case
  assert(toAlternatingCase('hello') === 'hElLo', 'Alternating case test');
  assert(toInverseCase('HeLLo') === 'hEllO', 'Invert case test');
  console.log('✓ Alternating and invert case tests passed');

  // 5. Code Cases
  assert(toKebabCase('Hello World') === 'hello-world', 'Kebab case test');
  assert(toSnakeCase('Hello World') === 'hello_world', 'Snake case test');
  assert(toCamelCase('hello world') === 'helloWorld', 'Camel case test');
  assert(toPascalCase('hello world') === 'HelloWorld', 'Pascal case test');
  console.log('✓ Kebab, snake, camel and pascal case tests passed');

  // 6. Text Cleaning (Extra spaces & Empty lines)
  const messy = 'Hello    world   with   spaces.\n\n\nNext line.';
  const cleanedSpaces = removeExtraSpaces(messy);
  assert(!cleanedSpaces.includes('   '), 'Extra spaces should be removed');
  const cleanedLines = removeEmptyLines(messy);
  assert(cleanedLines.split('\n').length === 2, 'Empty lines should be removed');
  console.log('✓ Text cleaning tests passed');

  // 7. Stats calculation
  const stats = computeTextStats('বাংলা ও English মিলিয়ে মোট পাঁচটি শব্দ।');
  assert(stats.words === 7, `Word count should be 7, got ${stats.words}`);
  assert(stats.characters > 0, 'Character count should be positive');
  console.log('✓ Stats calculation tests passed');

  console.log('All caseConverter tests passed successfully!');
}

runCaseConverterTests();
