import {
  convertRecipeMeasurement,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  INGREDIENTS,
  UNITS,
} from './cookingConverter.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function approxEqual(a: number, b: number, tolerance = 0.5) {
  return Math.abs(a - b) <= tolerance;
}

console.log('Running cookingConverter tests...');

// Test 1: 1 Cup of Flour to Grams (should be ~120g)
const flourGrams = convertRecipeMeasurement(1, 'cup', 'g', 'flour');
assert(approxEqual(flourGrams, 120), `1 cup flour should be 120g, got ${flourGrams}`);
console.log('✓ 1 Cup flour = 120g test passed');

// Test 2: 1 Cup of Granulated Sugar to Grams (should be ~200g)
const sugarGrams = convertRecipeMeasurement(1, 'cup', 'g', 'sugar');
assert(approxEqual(sugarGrams, 200), `1 cup sugar should be 200g, got ${sugarGrams}`);
console.log('✓ 1 Cup sugar = 200g test passed');

// Test 3: Reverse test: 200g sugar to Cups (should be 1 Cup)
const sugarCups = convertRecipeMeasurement(200, 'g', 'cup', 'sugar');
assert(approxEqual(sugarCups, 1, 0.01), `200g sugar should be 1 cup, got ${sugarCups}`);
console.log('✓ Reverse weight to volume test passed');

// Test 4: Volume to volume (1 Cup to Tablespoons = 16 Tbsp)
const tbspInCup = convertRecipeMeasurement(1, 'cup', 'tbsp', 'water');
assert(approxEqual(tbspInCup, 16), `1 cup should be 16 tbsp, got ${tbspInCup}`);
console.log('✓ 1 Cup = 16 Tablespoons test passed');

// Test 5: 1 Tablespoon to Teaspoons = 3 Tsp
const tspInTbsp = convertRecipeMeasurement(1, 'tbsp', 'tsp', 'water');
assert(approxEqual(tspInTbsp, 3), `1 tbsp should be 3 tsp, got ${tspInTbsp}`);
console.log('✓ 1 Tablespoon = 3 Teaspoons test passed');

// Test 6: Oven temperature conversions (350°F should be ~176.67°C)
const c = fahrenheitToCelsius(350);
assert(approxEqual(c, 176.67, 0.1), `350°F should be 176.67°C, got ${c}`);
const f = celsiusToFahrenheit(176.67);
assert(approxEqual(f, 350, 0.5), `176.67°C should be ~350°F, got ${f}`);
console.log('✓ Oven temperature conversions test passed');

// Test 7: Verify ingredient & units length
assert(INGREDIENTS.length >= 10, 'Should have at least 10 ingredients');
assert(UNITS.length >= 8, 'Should have at least 8 measurement units');
console.log('✓ Ingredient database count test passed');

console.log('All cookingConverter tests passed successfully!');
