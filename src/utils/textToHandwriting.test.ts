import { paginateText, HANDWRITING_FONTS, PAPER_TYPES, INK_COLORS } from './textToHandwriting.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Running textToHandwriting tests...');

// Test 1: Empty text handling
const emptyPages = paginateText('');
assert(emptyPages.length === 1, 'Empty text should produce 1 empty page');
assert(emptyPages[0].lines.length === 0, 'Page lines should be empty');
console.log('✓ Empty text pagination test passed');

// Test 2: Short text handling
const shortText = 'First line\nSecond line';
const shortPages = paginateText(shortText, 10, 60);
assert(shortPages.length === 1, 'Short text should fit in 1 page');
assert(shortPages[0].lines.length === 2, 'Should have exactly 2 lines');
console.log('✓ Short text pagination test passed');

// Test 3: Multi-page wrapping
const longText = Array.from({ length: 50 }, (_, i) => `Line number ${i + 1} of student assignment paper.`).join('\n');
const paginated = paginateText(longText, 20, 60);
assert(paginated.length === 3, `50 lines with 20 per page should give 3 pages, got ${paginated.length}`);
assert(paginated[0].lines.length === 20, 'Page 1 should have 20 lines');
assert(paginated[1].lines.length === 20, 'Page 2 should have 20 lines');
assert(paginated[2].lines.length === 10, 'Page 3 should have 10 lines');
console.log('✓ Multi-page text pagination test passed');

// Test 4: Long line auto-wrapping
const longSingleLine = 'This is a very long line designed to test whether word wrapping works properly when the character limit per line is set to a low number such as twenty.';
const wrapped = paginateText(longSingleLine, 20, 25);
assert(wrapped[0].lines.length > 3, 'Long line should wrap into multiple lines');
console.log('✓ Word wrapping test passed');

// Test 5: Verify static arrays
assert(HANDWRITING_FONTS.length >= 4, 'Should have at least 4 handwriting fonts');
assert(PAPER_TYPES.length >= 4, 'Should have at least 4 paper styles');
assert(INK_COLORS.length >= 4, 'Should have at least 4 ink color presets');
console.log('✓ Static presets test passed');

console.log('All textToHandwriting tests passed successfully!');
