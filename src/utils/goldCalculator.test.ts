import {
  traditionalToGrams,
  gramsToTraditional,
  calculateGoldPrice,
  calculateOldGoldTrade,
  BHORI_IN_GRAMS,
  GRAMS_PER_AANA,
  GRAMS_PER_ROTI
} from './goldCalculator.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('Running goldCalculator tests...');

// 1. 1 Bhori exactly equals 11.664g
const oneBhoriInGrams = traditionalToGrams(1, 0, 0, 0);
assert(Math.abs(oneBhoriInGrams - 11.664) < 0.001, `1 Bhori should be 11.664g, got ${oneBhoriInGrams}`);
console.log('✓ 1 Bhori = 11.664g check passed');

// 2. 16 Aana = 1 Bhori = 11.664g
const sixteenAanaInGrams = traditionalToGrams(0, 16, 0, 0);
assert(Math.abs(sixteenAanaInGrams - 11.664) < 0.001, `16 Aana should be 11.664g, got ${sixteenAanaInGrams}`);
console.log('✓ 16 Aana = 1 Bhori check passed');

// 3. 6 Roti = 1 Aana
const sixRotiInGrams = traditionalToGrams(0, 0, 6, 0);
assert(Math.abs(sixRotiInGrams - GRAMS_PER_AANA) < 0.001, `6 Roti should equal 1 Aana, got ${sixRotiInGrams}`);
console.log('✓ 6 Roti = 1 Aana check passed');

// 4. Roundtrip conversion
const testGrams = 14.58; // 1 Bhori + 4 Aana
const convertedTrad = gramsToTraditional(testGrams);
assert(convertedTrad.bhori === 1, `Bhori should be 1, got ${convertedTrad.bhori}`);
assert(convertedTrad.aana === 4, `Aana should be 4, got ${convertedTrad.aana}`);
console.log('✓ Roundtrip grams to traditional check passed');

// 5. Price calculation with percentage making charge and 5% VAT
const priceResult = calculateGoldPrice({
  weightInBhori: 1,
  pricePerBhori: 100000,
  makingChargeType: 'percentage',
  makingChargeValue: 10,
  vatPercent: 5
});
// Base: 100,000, Making: 10,000, Subtotal: 110,000, VAT: 5,500, Total: 115,500
assert(priceResult.goldBasePrice === 100000, `Base price should be 100000, got ${priceResult.goldBasePrice}`);
assert(priceResult.makingCharge === 10000, `Making charge should be 10000, got ${priceResult.makingCharge}`);
assert(priceResult.subtotal === 110000, `Subtotal should be 110000, got ${priceResult.subtotal}`);
assert(priceResult.vatAmount === 5500, `VAT should be 5500, got ${priceResult.vatAmount}`);
assert(priceResult.totalPrice === 115500, `Total should be 115500, got ${priceResult.totalPrice}`);
console.log('✓ Gold price calculation check passed');

// 6. Old gold exchange trade (10% deduction)
const exchangeResult = calculateOldGoldTrade({
  weightInBhori: 1,
  pricePerBhori: 100000,
  tradeType: 'exchange',
  deductionPercent: 10
});
assert(exchangeResult.grossValue === 100000, `Gross value should be 100000, got ${exchangeResult.grossValue}`);
assert(exchangeResult.deductionAmount === 10000, `Deduction should be 10000, got ${exchangeResult.deductionAmount}`);
assert(exchangeResult.netPayout === 90000, `Payout should be 90000, got ${exchangeResult.netPayout}`);
console.log('✓ Old gold exchange check passed');

// 7. Old gold cash sale trade (20% deduction)
const cashResult = calculateOldGoldTrade({
  weightInBhori: 1,
  pricePerBhori: 100000,
  tradeType: 'cash',
  deductionPercent: 20
});
assert(cashResult.deductionAmount === 20000, `Cash deduction should be 20000, got ${cashResult.deductionAmount}`);
assert(cashResult.netPayout === 80000, `Cash payout should be 80000, got ${cashResult.netPayout}`);
console.log('✓ Old gold cash trade check passed');

console.log('All goldCalculator tests passed successfully!');
