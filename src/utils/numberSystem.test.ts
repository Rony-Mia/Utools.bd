import {
  convertNumber,
  isValidBaseNumber,
  calculateTwosComplement,
  getStepExplanation,
} from './numberSystem.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runNumberSystemTests() {
  console.log('Running numberSystem tests...');

  // 1. Validation tests
  assert(isValidBaseNumber('1010', 2) === true, '1010 is valid binary');
  assert(isValidBaseNumber('102', 2) === false, '102 is invalid binary');
  assert(isValidBaseNumber('77', 8) === true, '77 is valid octal');
  assert(isValidBaseNumber('78', 8) === false, '78 is invalid octal');
  assert(isValidBaseNumber('255', 10) === true, '255 is valid decimal');
  assert(isValidBaseNumber('1A3F', 16) === true, '1A3F is valid hex');
  assert(isValidBaseNumber('1G', 16) === false, '1G is invalid hex');
  assert(isValidBaseNumber('10.101', 2) === true, '10.101 is valid fractional binary');
  assert(isValidBaseNumber('10.1.1', 2) === false, 'Double point is invalid');
  console.log('✓ Validation tests passed');

  // 2. Conversion tests: Decimal 25
  const resDec = convertNumber('25', 10);
  assert(resDec.binary === '11001', `25 in binary should be 11001, got ${resDec.binary}`);
  assert(resDec.octal === '31', `25 in octal should be 31, got ${resDec.octal}`);
  assert(resDec.hexadecimal === '19', `25 in hex should be 19, got ${resDec.hexadecimal}`);
  console.log('✓ Decimal integer conversion passed');

  // 3. Conversion tests: Binary 11111111 (255)
  const resBin = convertNumber('11111111', 2);
  assert(resBin.decimal === '255', `11111111 in decimal should be 255, got ${resBin.decimal}`);
  assert(resBin.octal === '377', `11111111 in octal should be 377, got ${resBin.octal}`);
  assert(resBin.hexadecimal === 'FF', `11111111 in hex should be FF, got ${resBin.hexadecimal}`);
  console.log('✓ Binary conversion passed');

  // 4. Fractional conversion: Decimal 25.625
  const resFrac = convertNumber('25.625', 10);
  assert(resFrac.binary === '11001.101', `25.625 in binary should be 11001.101, got ${resFrac.binary}`);
  assert(resFrac.octal === '31.5', `25.625 in octal should be 31.5, got ${resFrac.octal}`);
  assert(resFrac.hexadecimal === '19.A', `25.625 in hex should be 19.A, got ${resFrac.hexadecimal}`);
  console.log('✓ Fractional conversion passed');

  // 5. 2's Complement tests: -25
  const twosRes = calculateTwosComplement(-25, 8);
  assert(twosRes.trueBinary === '00011001', 'True binary of 25 is 00011001');
  assert(twosRes.onesComplement === '11100110', '1s complement of 25 is 11100110');
  assert(twosRes.twosComplement === '11100111', '2s complement of 25 is 11100111');
  assert(twosRes.signBit === '1', 'Sign bit of negative number is 1');
  console.log('✓ 2s complement tests passed');

  // 6. Step explanation test
  const steps = getStepExplanation('25', 10, 2);
  assert(steps.steps.length > 0, 'Explanation should generate steps');
  console.log('✓ Step explanation test passed');

  console.log('All numberSystem tests passed successfully!');
}

runNumberSystemTests();
