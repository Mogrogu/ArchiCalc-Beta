import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseInputString,
  calculate,
  formatDimensional,
  formatValueDisplay,
  conversionFactors,
  cleanFloat,
  calculateSqrt,
  calculateSquare,
  calculateReciprocal,
  calculatePercent
} from './calculatorEngine.ts';

test('parseInputString correctly parses pure scalars and dimensional expressions', () => {
  assert.deepEqual(parseInputString('0'), { value: 0, type: 'scalar', isDimensional: false });
  assert.deepEqual(parseInputString('42.5'), { value: 42.5, type: 'scalar', isDimensional: false });
  assert.deepEqual(parseInputString('-10'), { value: -10, type: 'scalar', isDimensional: false });

  // Feet only
  const ftOnly = parseInputString('5 ft');
  assert.equal(ftOnly.value, 60);
  assert.equal(ftOnly.type, 'linear');
  assert.equal(ftOnly.isDimensional, true);

  // Feet and inches
  const ftIn = parseInputString('5 ft 6 in');
  assert.equal(ftIn.value, 66);
  assert.equal(ftIn.type, 'linear');

  // Fractions
  const frac = parseInputString('5 ft 6 1/2 in');
  assert.equal(frac.value, 66.5);

  const frac38 = parseInputString('5 ft 6 3/8 in');
  assert.equal(frac38.value, 66.375);

  // Negative dimensional
  const negFtIn = parseInputString('-2 ft 4 in');
  assert.equal(negFtIn.value, -28);
  assert.equal(negFtIn.type, 'linear');
});

test('calculate handles linear addition and subtraction', () => {
  // 5 ft (60 in) + 2 ft (24 in) = 7 ft (84 in)
  const addRes = calculate(60, 'linear', 24, 'linear', 'add');
  assert.equal(addRes.value, 84);
  assert.equal(addRes.type, 'linear');
  assert.equal(addRes.error, undefined);

  // Subtraction
  const subRes = calculate(60, 'linear', 24, 'linear', 'subtract');
  assert.equal(subRes.value, 36);
  assert.equal(subRes.type, 'linear');

  // Unit mismatch: area + linear -> error
  const mismatch = calculate(100, 'area', 20, 'linear', 'add');
  assert.equal(mismatch.error, 'Unit Mismatch');
});

test('calculate handles dimensional physics (multiplication and division)', () => {
  // Linear * Linear = Area (in sq inches)
  // 10 ft (120 in) * 12 ft (144 in) = 17280 sq in (= 120 sq ft)
  const mulRes = calculate(120, 'linear', 144, 'linear', 'multiply');
  assert.equal(mulRes.value, 17280);
  assert.equal(mulRes.type, 'area');

  // Area * Linear = Volume
  const volRes = calculate(17280, 'area', 10, 'linear', 'multiply');
  assert.equal(volRes.value, 172800);
  assert.equal(volRes.type, 'volume');

  // Area / Linear = Linear
  const divRes = calculate(17280, 'area', 120, 'linear', 'divide');
  assert.equal(divRes.value, 144);
  assert.equal(divRes.type, 'linear');

  // Linear / Linear = Scalar
  const scalarDiv = calculate(120, 'linear', 60, 'linear', 'divide');
  assert.equal(scalarDiv.value, 2);
  assert.equal(scalarDiv.type, 'scalar');

  // Division by zero
  const zeroDiv = calculate(100, 'linear', 0, 'linear', 'divide');
  assert.equal(zeroDiv.error, 'Div by Zero');
});

test('formatDimensional formats inches accurately into architectural notation', () => {
  assert.equal(formatDimensional(66.5), '5 ft 6 1/2 in');
  assert.equal(formatDimensional(66.375), '5 ft 6 3/8 in');
  assert.equal(formatDimensional(72), '6 ft');
  assert.equal(formatDimensional(6), '6 in');
  assert.equal(formatDimensional(0), '0 in');
  assert.equal(formatDimensional(-28), '-2 ft 4 in');

  // Rounding down to nearest 1/16, 1/8, 1/4, whole inch
  // 66.375 is exactly 3/8
  assert.equal(formatDimensional(66.375, 4), '5 ft 6 1/2 in'); // nearest 1/4 is 1/2 (2/4 = 1/2) or 3/8 rounded to 4ths: 0.375*4 = 1.5 -> round is 2/4 = 1/2
  assert.equal(formatDimensional(66.375, 1), '5 ft 6 in'); // rounded to whole inch
});

test('formatValueDisplay formats area, volume, and metric conversions', () => {
  // 17280 sq in / 144 = 120 sq ft
  assert.equal(formatValueDisplay(17280, 'area'), '120 sq ft');

  // 1728 cu in / 1728 = 1 cu ft
  assert.equal(formatValueDisplay(1728, 'volume'), '1 cu ft');

  // Metric conversion: 1 meter = 39.37007874 in
  const meterInInches = conversionFactors['m'];
  assert.equal(formatValueDisplay(meterInInches, 'linear', 'm'), '1 m');
});

test('regular calculator operations function correctly', () => {
  // Sqrt
  assert.equal(calculateSqrt(144).value, 12);
  assert.equal(calculateSqrt(-9).error, 'Invalid Input');

  // Square
  assert.equal(calculateSquare(12).value, 144);
  assert.equal(calculateSquare(2.5).value, 6.25);

  // Reciprocal
  assert.equal(calculateReciprocal(4).value, 0.25);
  assert.equal(calculateReciprocal(0).error, 'Div by Zero');

  // Percentage
  assert.equal(calculatePercent(25), 0.25);
  assert.equal(calculatePercent(15, 200, 'add'), 30); // 15% of 200 = 30

  // Power
  const powRes = calculate(2, 'scalar', 8, 'scalar', 'power');
  assert.equal(powRes.value, 256);
});
