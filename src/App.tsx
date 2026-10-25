import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DimensionType,
  UnitKey,
  CalcOperator,
  conversionFactors,
  areaFactors,
  volFactors,
  unitLabels,
  roundDenominators,
  cleanFloat,
  displayFloat,
  formatWithCommas,
  parseInputString,
  formatDimensional,
  formatValueDisplay,
  calculate,
  calculateSqrt,
  calculateSquare,
  calculateReciprocal,
  calculatePercent,
  MemoryState,
} from './utils/calculatorEngine';
import { Header } from './components/Header';
import { Display } from './components/Display';
import { Keypad, CalculatorMode } from './components/Keypad';
import { InfoModal } from './components/InfoModal';
import { IOSInstallGuide } from './components/IOSInstallGuide';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useHaptics } from './hooks/useHaptics';

const MAX_HISTORY_ITEMS = 30;

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('archicalc_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Calculator Mode state: 'architectural' vs 'regular'
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>(() => {
    try {
      const saved = localStorage.getItem('archicalc_mode');
      return saved === 'regular' ? 'regular' : 'architectural';
    } catch {
      return 'architectural';
    }
  });

  // Sync dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('archicalc_dark_mode', String(darkMode));
    } catch {}
  }, [darkMode]);

  // Sync calculator mode persistence
  useEffect(() => {
    try {
      localStorage.setItem('archicalc_mode', calculatorMode);
    } catch {}
  }, [calculatorMode]);

  // Hooks
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { soundEnabled, toggleSound, triggerFeedback } = useHaptics();

  // Dialog states
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);
  const [copiedTape, setCopiedTape] = useState(false);

  // Core Calculator State
  const [currentInputStr, setCurrentInputStr] = useState<string>('0');
  const [isResultState, setIsResultState] = useState<boolean>(false);
  const [currentDisplayUnit, setCurrentDisplayUnit] = useState<UnitKey | null>(null);

  // Computation Registers
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [firstOperandType, setFirstOperandType] = useState<DimensionType>('linear');
  const [operator, setOperator] = useState<CalcOperator | null>(null);
  const [pendingConversion, setPendingConversion] = useState<boolean>(false);

  // Repeated Equals State
  const [lastOperator, setLastOperator] = useState<CalcOperator | null>(null);
  const [lastSecondOperand, setLastSecondOperand] = useState<number | null>(null);
  const [lastSecondOperandType, setLastSecondOperandType] = useState<DimensionType>('scalar');

  // Display / Mode Registers
  const [currentResultType, setCurrentResultType] = useState<DimensionType>('scalar');
  const [currentResultBaseValue, setCurrentResultBaseValue] = useState<number>(0);
  const [currentDimensionMode, setCurrentDimensionMode] = useState<'linear' | 'area' | 'volume'>('linear');
  const [sqcuPressCount, setSqcuPressCount] = useState<number>(0);

  // Fraction Rounding
  const [currentRoundDenomIndex, setCurrentRoundDenomIndex] = useState<number>(0);

  // History Tape
  const [history, setHistory] = useState<string[]>([]);
  const [activeTapeStr, setActiveTapeStr] = useState<string>('');

  // Architectural Memory
  const [archMemory, setArchMemory] = useState<MemoryState>({
    value: 0,
    type: 'linear',
    display: '0',
  });

  // Regular Calculator Memory (Standard M+, M-, MR, MC)
  const [regMemory, setRegMemory] = useState<number>(0);

  const addHistory = useCallback((entry: string) => {
    setHistory((prev) => {
      const next = [...prev, entry];
      if (next.length > MAX_HISTORY_ITEMS) next.shift();
      return next;
    });
  }, []);

  // Compute what should be displayed on the main and secondary screens
  const displayValue = useMemo(() => {
    if (currentInputStr === 'Error') return 'Error';

    if (isResultState) {
      if (calculatorMode === 'regular') {
        return formatWithCommas(String(displayFloat(currentResultBaseValue)));
      }
      return formatValueDisplay(
        currentResultBaseValue,
        currentResultType,
        currentDisplayUnit,
        currentRoundDenomIndex
      );
    }
    return formatWithCommas(currentInputStr);
  }, [
    currentInputStr,
    isResultState,
    calculatorMode,
    currentResultBaseValue,
    currentResultType,
    currentDisplayUnit,
    currentRoundDenomIndex,
  ]);

  const dimensionalSecondaryText = useMemo(() => {
    if (currentInputStr === 'Error') return '';

    if (pendingConversion) return 'Select Unit to Convert';

    if (calculatorMode === 'regular') {
      if (activeTapeStr) return activeTapeStr;
      return '';
    }

    if (isResultState) {
      const displayVal = displayFloat(currentResultBaseValue);
      let altDisplay = '';
      if (currentResultType === 'area') altDisplay = `${displayVal} sq in`;
      else if (currentResultType === 'volume') altDisplay = `${displayVal} cu in`;
      else altDisplay = `${displayVal} in`;

      const denom = roundDenominators[currentRoundDenomIndex];
      const roundLbl =
        currentRoundDenomIndex > 0 ? ` (Rnd 1/${denom === 1 ? '1' : denom})` : '';
      return formatWithCommas(`${altDisplay}${roundLbl}`);
    }

    if (currentDimensionMode === 'area') return 'SQ Mode Active';
    if (currentDimensionMode === 'volume') return 'CU Mode Active';

    const parsed = parseInputString(currentInputStr);
    if (parsed.isDimensional) {
      return formatWithCommas(`${displayFloat(parsed.value)} in`);
    }
    return '';
  }, [
    currentInputStr,
    pendingConversion,
    calculatorMode,
    isResultState,
    activeTapeStr,
    currentResultBaseValue,
    currentResultType,
    currentRoundDenomIndex,
    currentDimensionMode,
  ]);

  // Handle Mode Toggle (Architectural <-> Regular)
  const handleToggleMode = useCallback(() => {
    setCalculatorMode((prev) => {
      const next = prev === 'architectural' ? 'regular' : 'architectural';
      addHistory(
        `--- Switched to ${next === 'regular' ? 'Standard' : 'Architectural'} Calculator ---`
      );
      return next;
    });
    setPendingConversion(false);
  }, [addHistory]);

  // Digit Input
  const handleDigit = useCallback(
    (d: string) => {
      setCurrentRoundDenomIndex(0);
      if (isResultState) {
        setCurrentInputStr(d);
        setIsResultState(false);
      } else {
        setCurrentInputStr((prev) => (prev === '0' ? d : prev + d));
      }
    },
    [isResultState]
  );

  // Decimal Point
  const handleDecimal = useCallback(() => {
    setCurrentRoundDenomIndex(0);
    if (isResultState) {
      setCurrentInputStr('0.');
      setIsResultState(false);
    } else {
      setCurrentInputStr((prev) => {
        const tokens = prev.split(/[\s/a-z]+/);
        if (!tokens[tokens.length - 1].includes('.')) {
          return prev + '.';
        }
        return prev;
      });
    }
  }, [isResultState]);

  // Backspace
  const handleBackspace = useCallback(() => {
    setCurrentRoundDenomIndex(0);
    if (isResultState) {
      setCurrentInputStr('0');
      setIsResultState(false);
    } else {
      setCurrentInputStr((prev) => {
        if (prev.length > 0) {
          const next = prev.slice(0, -1).trim();
          return next === '' ? '0' : next;
        }
        return '0';
      });
    }
  }, [isResultState]);

  // Sign (+/-)
  const handleSign = useCallback(() => {
    setCurrentInputStr((prev) => {
      if (prev.startsWith('-')) return prev.substring(1);
      if (prev !== '0') return '-' + prev;
      return prev;
    });
  }, []);

  // Clear (On/C)
  const handleClear = useCallback(() => {
    setCurrentInputStr('0');
    setIsResultState(false);
    setFirstOperand(null);
    setOperator(null);
    setLastOperator(null);
    setLastSecondOperand(null);
    setPendingConversion(false);
    setSqcuPressCount(0);
    setCurrentDimensionMode('linear');
    setCurrentRoundDenomIndex(0);
    setCurrentDisplayUnit(null);
    setActiveTapeStr('');
    addHistory('------');
  }, [addHistory]);

  // Clear Tape
  const handleClearTape = useCallback(() => {
    setHistory([]);
    setActiveTapeStr('');
  }, []);

  // Copy Tape
  const handleCopyTape = useCallback(() => {
    const text = history.map((h) => h.replace(/<[^>]*>/g, '')).join('\n');
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedTape(true);
        setTimeout(() => setCopiedTape(false), 1500);
      })
      .catch((err) => console.warn('Failed to copy tape', err));
  }, [history]);

  // Arithmetic Operator (+, -, ×, ÷, power)
  const handleOperator = useCallback(
    (op: CalcOperator) => {
      setCurrentRoundDenomIndex(0);

      const parsed = isResultState
        ? {
            value: currentResultBaseValue,
            type: calculatorMode === 'regular' ? ('scalar' as DimensionType) : currentResultType,
          }
        : calculatorMode === 'regular'
        ? { value: parseFloat(currentInputStr) || 0, type: 'scalar' as DimensionType }
        : parseInputString(currentInputStr);

      const displayStr =
        calculatorMode === 'regular'
          ? String(displayFloat(parsed.value))
          : formatValueDisplay(parsed.value, parsed.type, currentDisplayUnit);

      const symMap: Record<CalcOperator, string> = {
        add: '+',
        subtract: '−',
        multiply: '×',
        divide: '÷',
        power: '^',
      };
      const sym = symMap[op];

      // Inline active tape chaining
      setActiveTapeStr((prev) => {
        if (!prev) return `${displayStr} ${sym}`;
        if (!isResultState) return `${prev} ${displayStr} ${sym}`;
        return prev.replace(/ [+\-−×÷^]$/, ` ${sym}`);
      });

      // Continuous evaluation under the hood
      let currentVal = parsed.value;
      let currentType = parsed.type;

      if (operator && !isResultState && firstOperand !== null) {
        const result = calculate(firstOperand, firstOperandType, parsed.value, parsed.type, operator);
        if (!result.error) {
          currentVal = result.value;
          currentType = result.type;
          setCurrentResultBaseValue(result.value);
          setCurrentResultType(result.type);
        }
      } else {
        setCurrentResultBaseValue(parsed.value);
        setCurrentResultType(parsed.type);
      }

      setFirstOperand(currentVal);
      setFirstOperandType(currentType);
      setOperator(op);
      setIsResultState(true);
      setPendingConversion(false);
    },
    [
      isResultState,
      currentResultBaseValue,
      calculatorMode,
      currentResultType,
      currentInputStr,
      currentDisplayUnit,
      operator,
      firstOperand,
      firstOperandType,
    ]
  );

  // Equals (=)
  const handleEquals = useCallback(() => {
    setCurrentRoundDenomIndex(0);
    let secondOp: { value: number; type: DimensionType };
    let isRepeatedEquals = false;

    if (operator && firstOperand !== null) {
      secondOp = isResultState
        ? {
            value: currentResultBaseValue,
            type: calculatorMode === 'regular' ? 'scalar' : currentResultType,
          }
        : calculatorMode === 'regular'
        ? { value: parseFloat(currentInputStr) || 0, type: 'scalar' }
        : parseInputString(currentInputStr);

      setLastOperator(operator);
      setLastSecondOperand(secondOp.value);
      setLastSecondOperandType(secondOp.type);
    } else if (lastOperator && lastSecondOperand !== null) {
      secondOp = { value: lastSecondOperand, type: lastSecondOperandType };
      setOperator(lastOperator);
      setFirstOperand(currentResultBaseValue);
      setFirstOperandType(calculatorMode === 'regular' ? 'scalar' : currentResultType);
      isRepeatedEquals = true;
    } else {
      const evaluated =
        calculatorMode === 'regular'
          ? { value: parseFloat(currentInputStr) || 0, type: 'scalar' as DimensionType }
          : parseInputString(currentInputStr);
      setCurrentResultBaseValue(evaluated.value);
      setCurrentResultType(evaluated.type);
      setIsResultState(true);
      return;
    }

    const opToExecute = isRepeatedEquals ? lastOperator! : operator!;
    const op1Val = isRepeatedEquals ? currentResultBaseValue : firstOperand!;
    const op1Typ = isRepeatedEquals
      ? calculatorMode === 'regular'
        ? 'scalar'
        : currentResultType
      : firstOperandType;

    const result = calculate(op1Val, op1Typ, secondOp.value, secondOp.type, opToExecute);

    if (result.error) {
      setCurrentInputStr('Error');
      setIsResultState(true);
      triggerFeedback('error');
      return;
    }

    const symMap: Record<CalcOperator, string> = {
      add: '+',
      subtract: '−',
      multiply: '×',
      divide: '÷',
      power: '^',
    };
    const sym = symMap[opToExecute];

    const secOpDisplay =
      calculatorMode === 'regular'
        ? String(displayFloat(secondOp.value))
        : formatValueDisplay(secondOp.value, secondOp.type, currentDisplayUnit);
    const resDisplay =
      calculatorMode === 'regular'
        ? formatWithCommas(String(displayFloat(result.value)))
        : formatValueDisplay(result.value, result.type, currentDisplayUnit);

    if (isRepeatedEquals || !activeTapeStr) {
      const firstDisplay =
        calculatorMode === 'regular'
          ? String(displayFloat(op1Val))
          : formatValueDisplay(op1Val, op1Typ, currentDisplayUnit);
      addHistory(`${firstDisplay} ${sym} ${secOpDisplay} = <strong>${resDisplay}</strong>`);
    } else {
      addHistory(`${activeTapeStr} ${secOpDisplay} = <strong>${resDisplay}</strong>`);
      setActiveTapeStr('');
    }

    setCurrentResultBaseValue(result.value);
    setCurrentResultType(result.type);
    setIsResultState(true);
    setOperator(null);
  }, [
    operator,
    firstOperand,
    isResultState,
    calculatorMode,
    currentResultBaseValue,
    currentResultType,
    currentInputStr,
    lastOperator,
    lastSecondOperand,
    lastSecondOperandType,
    firstOperandType,
    currentDisplayUnit,
    activeTapeStr,
    addHistory,
    triggerFeedback,
  ]);

  // Architectural: Unit Buttons (Feet, Inch, Yard, cm, mm, m)
  const handleUnit = useCallback(
    (unit: UnitKey) => {
      setCurrentRoundDenomIndex(0);

      // Pending conversion check
      if (pendingConversion) {
        let valToConvert = currentResultBaseValue;
        let typeToConvert = currentResultType;

        if (!isResultState) {
          const parsed = parseInputString(currentInputStr);
          valToConvert = parsed.value;
          typeToConvert = parsed.type;
          setCurrentResultBaseValue(valToConvert);
        }

        let targetType = typeToConvert;
        if (targetType === 'scalar') targetType = 'linear';

        // Toggle decimal formats for feet and inches
        let nextDisplayUnit: UnitKey | null = unit;
        if (unit === 'ft') {
          nextDisplayUnit = currentDisplayUnit === 'dec-ft' ? null : 'dec-ft';
        } else if (unit === 'in') {
          nextDisplayUnit = currentDisplayUnit === 'dec-in' ? null : 'dec-in';
        }

        setCurrentDisplayUnit(nextDisplayUnit);
        setCurrentResultType(targetType);

        const displayStr = formatValueDisplay(valToConvert, targetType, nextDisplayUnit);
        addHistory(`Conv → <strong>${displayStr}</strong>`);
        setIsResultState(true);
        setPendingConversion(false);
        return;
      }

      // SQ/CU Mode entry
      if (currentDimensionMode !== 'linear') {
        const val = isResultState
          ? currentResultBaseValue
          : parseInputString(currentInputStr).value;
        if (isNaN(val)) return;

        let baseInches = 0;
        let resType: DimensionType = 'linear';

        if (currentDimensionMode === 'area') {
          baseInches = val * areaFactors[unit];
          resType = 'area';
        } else {
          baseInches = val * volFactors[unit];
          resType = 'volume';
        }

        setCurrentResultBaseValue(baseInches);
        setCurrentResultType(resType);
        setCurrentDisplayUnit(unit);
        addHistory(
          `Entered: ${formatValueDisplay(baseInches, resType, unit)}`
        );
        setIsResultState(true);
        setSqcuPressCount(0);
        setCurrentDimensionMode('linear');
      } else {
        if (unit === 'ft' || unit === 'in') {
          setCurrentDisplayUnit(null);
          if (isResultState) {
            setCurrentInputStr(`${currentResultBaseValue} ${unit} `);
            setIsResultState(false);
          } else {
            setCurrentInputStr((prev) =>
              prev.endsWith(`${unit} `) ? prev : `${prev} ${unit} `
            );
          }
        } else {
          const val = isResultState
            ? currentResultBaseValue
            : parseFloat(currentInputStr);
          if (!isNaN(val)) {
            const baseInches = val * conversionFactors[unit];
            setCurrentResultBaseValue(baseInches);
            setCurrentResultType('linear');
            setCurrentDisplayUnit(unit);
            setIsResultState(true);
            addHistory(
              `Entered: ${formatValueDisplay(baseInches, 'linear', unit)}`
            );
          }
        }
      }
    },
    [
      pendingConversion,
      currentResultBaseValue,
      currentResultType,
      isResultState,
      currentInputStr,
      currentDisplayUnit,
      currentDimensionMode,
      addHistory,
    ]
  );

  // Architectural: Fraction key (/) or Rounding
  const handleFraction = useCallback(() => {
    if (isResultState) {
      if (currentResultType === 'linear' || currentResultType === 'scalar') {
        const nextIndex = (currentRoundDenomIndex + 1) % roundDenominators.length;
        setCurrentRoundDenomIndex(nextIndex);
        const denom = roundDenominators[nextIndex];
        const formatted = formatDimensional(currentResultBaseValue, denom);
        addHistory(`Round (${denom === 1 ? '1"' : '1/' + denom}) → <strong>${formatted}</strong>`);
      }
    } else {
      setCurrentInputStr((prev) => (prev.endsWith('/') ? prev : prev + '/'));
    }
  }, [isResultState, currentResultType, currentRoundDenomIndex, currentResultBaseValue, addHistory]);

  // Architectural: Convert
  const handleConvert = useCallback(() => {
    setPendingConversion(true);
  }, []);

  // Architectural: SQ|CU toggle
  const handleToggleSqCu = useCallback(() => {
    const nextCount = (sqcuPressCount + 1) % 3;
    setSqcuPressCount(nextCount);
    const mode = (['linear', 'area', 'volume'] as const)[nextCount];
    setCurrentDimensionMode(mode);
  }, [sqcuPressCount]);

  // Architectural: Memory Store & Recall
  const handleMemoryStore = useCallback(() => {
    const mVal = isResultState ? currentResultBaseValue : parseInputString(currentInputStr).value;
    const mType = isResultState ? currentResultType : parseInputString(currentInputStr).type;
    const display = formatValueDisplay(mVal, mType);
    setArchMemory({ value: mVal, type: mType, display });
    addHistory(`Stored: ${display}`);
    setIsResultState(true);
  }, [isResultState, currentResultBaseValue, currentInputStr, currentResultType, addHistory]);

  const handleMemoryRecall = useCallback(() => {
    if (calculatorMode === 'regular') {
      setCurrentResultBaseValue(regMemory);
      setCurrentResultType('scalar');
      setIsResultState(true);
      addHistory(`Recalled: ${displayFloat(regMemory)}`);
      return;
    }

    if (archMemory.display !== '0') {
      setCurrentResultBaseValue(archMemory.value);
      setCurrentResultType(archMemory.type);
      setIsResultState(true);
      setCurrentDisplayUnit(null);
      addHistory(`Recalled: ${archMemory.display}`);
    }
  }, [calculatorMode, regMemory, archMemory, addHistory]);

  // Regular Calculator: Percent (%)
  const handlePercent = useCallback(() => {
    const val = isResultState ? currentResultBaseValue : parseFloat(currentInputStr) || 0;
    const res = calculatePercent(val, firstOperand, operator);
    setCurrentResultBaseValue(res);
    setCurrentResultType('scalar');
    setIsResultState(true);
    addHistory(`${val}% = <strong>${res}</strong>`);
  }, [isResultState, currentResultBaseValue, currentInputStr, firstOperand, operator, addHistory]);

  // Regular Calculator: Square Root (√x)
  const handleSqrt = useCallback(() => {
    const val = isResultState ? currentResultBaseValue : parseFloat(currentInputStr) || 0;
    const res = calculateSqrt(val);
    if (res.error) {
      setCurrentInputStr('Error');
      setIsResultState(true);
      triggerFeedback('error');
      return;
    }
    setCurrentResultBaseValue(res.value);
    setCurrentResultType('scalar');
    setIsResultState(true);
    addHistory(`√(${val}) = <strong>${res.value}</strong>`);
  }, [isResultState, currentResultBaseValue, currentInputStr, addHistory, triggerFeedback]);

  // Regular Calculator: Square (x²)
  const handleSquare = useCallback(() => {
    const val = isResultState ? currentResultBaseValue : parseFloat(currentInputStr) || 0;
    const res = calculateSquare(val);
    setCurrentResultBaseValue(res.value);
    setCurrentResultType('scalar');
    setIsResultState(true);
    addHistory(`(${val})² = <strong>${res.value}</strong>`);
  }, [isResultState, currentResultBaseValue, currentInputStr, addHistory]);

  // Regular Calculator: Reciprocal (1/x)
  const handleReciprocal = useCallback(() => {
    const val = isResultState ? currentResultBaseValue : parseFloat(currentInputStr) || 0;
    const res = calculateReciprocal(val);
    if (res.error) {
      setCurrentInputStr('Error');
      setIsResultState(true);
      triggerFeedback('error');
      return;
    }
    setCurrentResultBaseValue(res.value);
    setCurrentResultType('scalar');
    setIsResultState(true);
    addHistory(`1/(${val}) = <strong>${res.value}</strong>`);
  }, [isResultState, currentResultBaseValue, currentInputStr, addHistory, triggerFeedback]);

  // Regular Calculator: Pi (π)
  const handlePi = useCallback(() => {
    const piVal = cleanFloat(Math.PI);
    setCurrentResultBaseValue(piVal);
    setCurrentResultType('scalar');
    setCurrentInputStr(String(piVal));
    setIsResultState(true);
  }, []);

  // Regular Calculator: Parentheses
  const handleParenOpen = useCallback(() => {
    setCurrentInputStr((prev) => (prev === '0' ? '(' : prev + '('));
  }, []);

  const handleParenClose = useCallback(() => {
    setCurrentInputStr((prev) => prev + ')');
  }, []);

  // Regular Calculator: Standard Memory (M+, M-, MC)
  const handleMemoryAdd = useCallback(() => {
    const val = isResultState ? currentResultBaseValue : parseFloat(currentInputStr) || 0;
    setRegMemory((prev) => {
      const next = cleanFloat(prev + val);
      addHistory(`M+ ${val} → [${next}]`);
      return next;
    });
    setIsResultState(true);
  }, [isResultState, currentResultBaseValue, currentInputStr, addHistory]);

  const handleMemorySub = useCallback(() => {
    const val = isResultState ? currentResultBaseValue : parseFloat(currentInputStr) || 0;
    setRegMemory((prev) => {
      const next = cleanFloat(prev - val);
      addHistory(`M− ${val} → [${next}]`);
      return next;
    });
    setIsResultState(true);
  }, [isResultState, currentResultBaseValue, currentInputStr, addHistory]);

  const handleMemoryClear = useCallback(() => {
    setRegMemory(0);
    addHistory('Memory Cleared (MC)');
  }, [addHistory]);

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const key = e.key;

      if (/[0-9]/.test(key)) {
        e.preventDefault();
        triggerFeedback();
        handleDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        triggerFeedback();
        handleDecimal();
      } else if (key === '+') {
        e.preventDefault();
        triggerFeedback('operator');
        handleOperator('add');
      } else if (key === '-') {
        e.preventDefault();
        triggerFeedback('operator');
        handleOperator('subtract');
      } else if (key === '*' || key.toLowerCase() === 'x') {
        e.preventDefault();
        triggerFeedback('operator');
        handleOperator('multiply');
      } else if (key === '/') {
        e.preventDefault();
        if (calculatorMode === 'architectural') {
          triggerFeedback();
          handleFraction();
        } else {
          triggerFeedback('operator');
          handleOperator('divide');
        }
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        triggerFeedback('equals');
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        triggerFeedback();
        handleBackspace();
      } else if (key === 'Escape' || (key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        triggerFeedback();
        handleClear();
      } else if (key === "'" && calculatorMode === 'architectural') {
        e.preventDefault();
        triggerFeedback();
        handleUnit('ft');
      } else if (key === ';' && calculatorMode === 'architectural') {
        e.preventDefault();
        triggerFeedback();
        handleUnit('in');
      } else if (key === '\\' && calculatorMode === 'architectural') {
        e.preventDefault();
        triggerFeedback();
        handleFraction();
      } else if (key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey && calculatorMode === 'architectural') {
        e.preventDefault();
        triggerFeedback('operator');
        handleConvert();
      } else if (key.toLowerCase() === 'u' && calculatorMode === 'architectural') {
        e.preventDefault();
        triggerFeedback();
        handleToggleSqCu();
      } else if (key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
        // Toggle calculator mode via 'm' key
        e.preventDefault();
        triggerFeedback('operator');
        handleToggleMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    calculatorMode,
    triggerFeedback,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleFraction,
    handleEquals,
    handleBackspace,
    handleClear,
    handleUnit,
    handleConvert,
    handleToggleSqCu,
    handleToggleMode,
  ]);

  // Paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const paste = e.clipboardData?.getData('text');
      if (paste) {
        const cleaned = paste.replace(/,/g, '').replace(/[^0-9a-zA-Z./\s-]/g, '').trim();
        if (cleaned) {
          triggerFeedback();
          if (isResultState) {
            setCurrentInputStr(cleaned);
            setIsResultState(false);
          } else {
            setCurrentInputStr((prev) => (prev === '0' ? cleaned : prev + cleaned));
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isResultState, triggerFeedback]);

  const hasMemory = calculatorMode === 'regular' ? regMemory !== 0 : archMemory.display !== '0';

  return (
    <div className={`w-full h-screen min-h-screen h-[100dvh] bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center sm:p-3 overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Phone-optimized container */}
      <main className="w-full max-w-[440px] h-full sm:h-auto sm:max-h-[96vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden relative safe-top safe-bottom">
        {/* App Header */}
        <Header
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onOpenInfo={() => setInfoModalOpen(true)}
          onOpenInstallGuide={() => setIosGuideOpen(true)}
          isInstallable={isInstallable}
          isIOS={isIOS}
          isInstalled={isInstalled}
          onInstallApp={install}
        />

        {/* Display Section (Tape + Readout) */}
        <Display
          history={history}
          activeTapeStr={activeTapeStr}
          isResultState={isResultState}
          currentInputStr={currentInputStr}
          displayValue={displayValue}
          dimensionalSecondaryText={dimensionalSecondaryText}
          copiedTape={copiedTape}
          onCopyTape={handleCopyTape}
          calculatorMode={calculatorMode}
          hasMemory={hasMemory}
        />

        {/* Keypad Section */}
        <Keypad
          mode={calculatorMode}
          onToggleMode={handleToggleMode}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onDigit={handleDigit}
          onDecimal={handleDecimal}
          onSign={handleSign}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onClearTape={handleClearTape}
          onEquals={handleEquals}
          onOperator={handleOperator}
          onUnit={handleUnit}
          onFraction={handleFraction}
          onConvert={handleConvert}
          onToggleSqCu={handleToggleSqCu}
          onMemoryStore={handleMemoryStore}
          onMemoryRecall={handleMemoryRecall}
          onPercent={handlePercent}
          onSqrt={handleSqrt}
          onSquare={handleSquare}
          onReciprocal={handleReciprocal}
          onPi={handlePi}
          onParenOpen={handleParenOpen}
          onParenClose={handleParenClose}
          onMemoryAdd={handleMemoryAdd}
          onMemorySub={handleMemorySub}
          onMemoryClear={handleMemoryClear}
          triggerFeedback={triggerFeedback}
        />
      </main>

      {/* About & Guide Modal */}
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        onInstallApp={install}
        isInstallable={isInstallable}
      />

      {/* iOS Installation Guide Modal */}
      <IOSInstallGuide
        isOpen={iosGuideOpen}
        onClose={() => setIosGuideOpen(false)}
      />
    </div>
  );
}
