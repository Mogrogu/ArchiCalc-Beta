/**
 * ArchiCalc Dimensional Calculation Engine
 * Handles dimensional parsing (feet, inches, fractions), metric conversions,
 * area/volume physics, and fractional rounding.
 */

export type DimensionType = 'linear' | 'area' | 'volume' | 'scalar';

export type UnitKey = 'in' | 'dec-in' | 'ft' | 'dec-ft' | 'yd' | 'm' | 'cm' | 'mm';

export interface ParsedInput {
  value: number;
  type: DimensionType;
  isDimensional: boolean;
}

export interface CalculationResult {
  value: number;
  type: DimensionType;
  error?: string;
}

export interface MemoryState {
  value: number;
  type: DimensionType;
  display: string;
}

// Linear conversion factors to base unit: Inches
export const conversionFactors: Record<UnitKey, number> = {
  'in': 1,
  'dec-in': 1,
  'ft': 12,
  'dec-ft': 12,
  'yd': 36,
  'm': 39.37007874,
  'cm': 0.3937007874,
  'mm': 0.03937007874,
};

// Area conversion factors to base unit: Square Inches
export const areaFactors: Record<UnitKey, number> = {
  'in': 1,
  'dec-in': 1,
  'ft': 144,
  'dec-ft': 144,
  'yd': 1296,
  'm': 1550.0031,
  'cm': 0.15500031,
  'mm': 0.0015500031,
};

// Volume conversion factors to base unit: Cubic Inches
export const volFactors: Record<UnitKey, number> = {
  'in': 1,
  'dec-in': 1,
  'ft': 1728,
  'dec-ft': 1728,
  'yd': 46656,
  'm': 61023.744,
  'cm': 0.061023744,
  'mm': 0.000061023744,
};

export const unitLabels: Record<UnitKey, string> = {
  'in': 'in',
  'dec-in': 'in',
  'ft': 'ft',
  'dec-ft': 'ft',
  'yd': 'yd',
  'm': 'm',
  'cm': 'cm',
  'mm': 'mm',
};

export const roundDenominators = [32, 16, 8, 4, 2, 1];

export function cleanFloat(num: number): number {
  if (isNaN(num) || !isFinite(num)) return 0;
  return parseFloat(num.toFixed(10));
}

export function displayFloat(num: number): number {
  if (isNaN(num) || !isFinite(num)) return 0;
  return parseFloat(num.toFixed(5));
}

export function formatWithCommas(str: string): string {
  if (!str) return str;
  return str.toString().replace(/\b\d+(?:\.\d+)?\b/g, (match) => {
    const parts = match.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  });
}

/**
 * Parses user input string into base units (inches for linear, scalar otherwise).
 * Supports combinations like "5 ft 6 3/8 in", "12 ft", "4 1/2 in", "-2 ft 4 in".
 */
export function parseInputString(str: string | number): ParsedInput {
  let s = str.toString().trim().toLowerCase().replace(/,/g, '');
  if (!s || s === '0') {
    return { value: 0, type: 'scalar', isDimensional: false };
  }

  // Pure numeric (scalar) check
  if (/^-?\d*\.?\d+$/.test(s)) {
    return { value: parseFloat(s), type: 'scalar', isDimensional: false };
  }

  let totalInches = 0;
  let isDim = false;
  const isNegative = s.startsWith('-');
  if (isNegative) {
    s = s.substring(1).trim();
  }

  const normalized = s
    .replace(/ft/g, ' ft ')
    .replace(/in/g, ' in ')
    .replace(/\//g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = normalized.split(' ');

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const val = parseFloat(token);

    if (!isNaN(val) && token !== '/') {
      const absVal = Math.abs(val);
      const nextToken = tokens[i + 1];

      if (nextToken === 'ft') {
        totalInches += absVal * 12;
        isDim = true;
        i++;
      } else if (nextToken === 'in') {
        totalInches += absVal;
        isDim = true;
        i++;
      } else if (nextToken === '/') {
        const denomToken = tokens[i + 2];
        const denom = denomToken ? parseFloat(denomToken) : NaN;
        if (!isNaN(denom) && denom !== 0) {
          totalInches += absVal / Math.abs(denom);
          isDim = true;
          i += 2;
        }
      } else {
        totalInches += absVal;
        isDim = true;
      }
    }
  }

  if (isNegative) {
    totalInches *= -1;
  }

  return {
    value: cleanFloat(totalInches),
    type: 'linear',
    isDimensional: isDim,
  };
}

/**
 * Formats linear inches into architectural feet, inches, and fractions.
 * e.g. 66.375 -> "5 ft 6 3/8 in"
 */
export function formatDimensional(totalInches: number, denomLimit = 32): string {
  if (isNaN(totalInches) || !isFinite(totalInches)) return 'Error';
  const sign = totalInches < 0 ? '-' : '';
  let absInches = cleanFloat(Math.abs(totalInches));
  let feet = Math.floor(absInches / 12);
  let remainingInches = absInches % 12;

  // Whole inch rounding (denomLimit === 1)
  if (denomLimit === 1) {
    remainingInches = Math.round(remainingInches);
    if (remainingInches === 12) {
      feet++;
      remainingInches = 0;
    }
    const parts: string[] = [];
    if (feet > 0) parts.push(`${feet} ft`);
    if (remainingInches > 0) parts.push(`${remainingInches}`);
    if (parts.length === 0) return '0 in';
    if (!parts.some((p) => p.includes('ft'))) parts.push('in');
    else if (remainingInches > 0) parts.push('in');
    return formatWithCommas(sign + parts.join(' ').trim());
  }

  const wholeInches = Math.floor(remainingInches);
  let fractionStr = '';
  let fracPart = remainingInches - wholeInches;

  if (fracPart > 0.000001) {
    const bestNum = Math.round(fracPart * denomLimit);
    const bestDen = denomLimit;

    if (bestNum === bestDen) {
      fracPart = 0;
      remainingInches = wholeInches + 1;
      if (remainingInches === 12) {
        feet++;
        remainingInches = 0;
      }
    } else if (bestNum > 0) {
      const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
      const common = gcd(bestNum, bestDen);
      fractionStr = `${bestNum / common}/${bestDen / common}`;
    }
  }

  const finalWholeInches = Math.floor(remainingInches);
  const parts: string[] = [];
  if (feet > 0) parts.push(`${feet} ft`);
  if (finalWholeInches > 0) parts.push(`${finalWholeInches}`);
  if (fractionStr) parts.push(fractionStr);

  if (parts.length > 0 && !parts.some((p) => p.includes('ft'))) {
    parts.push('in');
  } else if (parts.length > 1 && !parts[parts.length - 1].includes('/')) {
    parts.push('in');
  } else if (fractionStr && feet > 0) {
    parts.push('in');
  }

  if (parts.length === 0) return '0 in';

  return formatWithCommas(sign + parts.join(' ').trim());
}

/**
 * Formats a value according to its dimension type and display unit.
 */
export function formatValueDisplay(
  val: number,
  type: DimensionType,
  displayBaseUnit: UnitKey | null = null,
  denomIndex = 0
): string {
  val = cleanFloat(val);
  let resultStr = '';

  if (type === 'area') {
    const factor = displayBaseUnit ? areaFactors[displayBaseUnit] : areaFactors['ft'];
    const lbl = displayBaseUnit ? `sq ${unitLabels[displayBaseUnit]}` : 'sq ft';
    resultStr = `${displayFloat(val / factor)} ${lbl}`;
  } else if (type === 'volume') {
    const factor = displayBaseUnit ? volFactors[displayBaseUnit] : volFactors['ft'];
    const lbl = displayBaseUnit ? `cu ${unitLabels[displayBaseUnit]}` : 'cu ft';
    resultStr = `${displayFloat(val / factor)} ${lbl}`;
  } else if (type === 'linear') {
    if (displayBaseUnit && displayBaseUnit !== 'in' && displayBaseUnit !== 'ft') {
      resultStr = `${displayFloat(val / conversionFactors[displayBaseUnit])} ${unitLabels[displayBaseUnit]}`;
    } else {
      const denom = roundDenominators[denomIndex] ?? 32;
      return formatDimensional(val, denom);
    }
  } else {
    resultStr = String(displayFloat(val));
  }
  return formatWithCommas(resultStr);
}

export type CalcOperator = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';

/**
 * Standard / Regular calculator helper functions
 */
export function calculateSqrt(val: number): { value: number; error?: string } {
  if (val < 0) return { value: 0, error: 'Invalid Input' };
  return { value: cleanFloat(Math.sqrt(val)) };
}

export function calculateSquare(val: number): { value: number } {
  return { value: cleanFloat(val * val) };
}

export function calculateReciprocal(val: number): { value: number; error?: string } {
  if (val === 0) return { value: 0, error: 'Div by Zero' };
  return { value: cleanFloat(1 / val) };
}

export function calculatePercent(val: number, base: number | null = null, op: CalcOperator | null = null): number {
  if (base !== null && (op === 'add' || op === 'subtract')) {
    // e.g. 100 + 10% = 100 + 10 = 110
    return cleanFloat((base * val) / 100);
  }
  return cleanFloat(val / 100);
}

/**
 * Executes dimensional or regular math:
 * - linear * linear = area
 * - area * linear = volume
 * - linear * area = volume
 * - scalar * any = any
 * - area / linear = linear
 * - volume / area = linear
 * - volume / linear = area
 * - same / same = scalar
 * - add / subtract: must match dimension or scalar
 * - power: scalar ^ scalar
 */
export function calculate(
  op1: number,
  op1Type: DimensionType,
  op2: number,
  op2Type: DimensionType,
  op: CalcOperator
): CalculationResult {
  let resultVal = 0;
  let resultType: DimensionType = 'linear';

  if (op === 'power') {
    if (op1Type !== 'scalar' || op2Type !== 'scalar') {
      return { value: 0, type: 'scalar', error: 'Scalar Only for Power' };
    }
    return { value: cleanFloat(Math.pow(op1, op2)), type: 'scalar' };
  }

  if (op === 'multiply') {
    if (op1Type === 'linear' && op2Type === 'linear') resultType = 'area';
    else if ((op1Type === 'area' && op2Type === 'linear') || (op1Type === 'linear' && op2Type === 'area')) resultType = 'volume';
    else if (op1Type === 'scalar') resultType = op2Type;
    else if (op2Type === 'scalar') resultType = op1Type;
    else return { value: 0, type: 'scalar', error: 'Invalid Multiplication' };
  } else if (op === 'divide') {
    if (op2 === 0) return { value: 0, type: 'scalar', error: 'Div by Zero' };
    if (op1Type === 'area' && op2Type === 'linear') resultType = 'linear';
    else if (op1Type === 'volume' && op2Type === 'area') resultType = 'linear';
    else if (op1Type === 'volume' && op2Type === 'linear') resultType = 'area';
    else if (op1Type === op2Type) resultType = 'scalar';
    else if (op2Type === 'scalar') resultType = op1Type;
    else return { value: 0, type: 'scalar', error: 'Invalid Division' };
  } else if (op === 'add' || op === 'subtract') {
    if (op1Type !== op2Type && op1Type !== 'scalar' && op2Type !== 'scalar') {
      return { value: 0, type: 'scalar', error: 'Unit Mismatch' };
    }
    resultType = op1Type !== 'scalar' ? op1Type : op2Type;
  }

  switch (op) {
    case 'add':
      resultVal = op1 + op2;
      break;
    case 'subtract':
      resultVal = op1 - op2;
      break;
    case 'multiply':
      resultVal = op1 * op2;
      break;
    case 'divide':
      resultVal = op1 / op2;
      break;
  }

  return { value: cleanFloat(resultVal), type: resultType };
}
