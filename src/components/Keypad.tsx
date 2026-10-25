import React from 'react';
import { CalcOperator, UnitKey } from '../utils/calculatorEngine';
import { ArrowLeft, Moon, Sun, Calculator, Compass } from 'lucide-react';

export type CalculatorMode = 'architectural' | 'regular';

interface KeypadProps {
  mode: CalculatorMode;
  onToggleMode: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;

  // Numbers & base inputs
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onSign: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onClearTape: () => void;
  onEquals: () => void;
  onOperator: (op: CalcOperator) => void;

  // Architectural specific
  onUnit: (unit: UnitKey) => void;
  onFraction: () => void;
  onConvert: () => void;
  onToggleSqCu: () => void;
  onMemoryStore: () => void;
  onMemoryRecall: () => void;

  // Regular calculator specific
  onPercent: () => void;
  onSqrt: () => void;
  onSquare: () => void;
  onReciprocal: () => void;
  onPi: () => void;
  onParenOpen: () => void;
  onParenClose: () => void;
  onMemoryAdd: () => void;
  onMemorySub: () => void;
  onMemoryClear: () => void;

  // Tactile feedback
  triggerFeedback: (type?: 'standard' | 'operator' | 'equals' | 'error') => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  mode,
  onToggleMode,
  darkMode,
  onToggleDarkMode,
  onDigit,
  onDecimal,
  onSign,
  onBackspace,
  onClear,
  onClearTape,
  onEquals,
  onOperator,
  onUnit,
  onFraction,
  onConvert,
  onToggleSqCu,
  onMemoryStore,
  onMemoryRecall,
  onPercent,
  onSqrt,
  onSquare,
  onReciprocal,
  onPi,
  onParenOpen,
  onParenClose,
  onMemoryAdd,
  onMemorySub,
  onMemoryClear,
  triggerFeedback,
}) => {
  const isArch = mode === 'architectural';

  // Base button classes
  const baseBtn =
    'relative flex flex-col items-center justify-center rounded-xl font-medium select-none transition-all duration-100 active:scale-92 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 min-h-[3.3rem] sm:min-h-[3.5rem]';
  const shortcutStyle = 'text-[9px] sm:text-[10px] opacity-60 font-normal leading-none mt-0.5';

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 select-none">
      {/* ROW 1 */}
      {isArch ? (
        <>
          <button
            onClick={() => { triggerFeedback(); onUnit('yd'); }}
            className={`${baseBtn} bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900 text-sm sm:text-base`}
            title="Convert to Yards"
          >
            <span>Yards</span>
          </button>
          <button
            onClick={() => { triggerFeedback(); onUnit('ft'); }}
            className={`${baseBtn} bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900 text-sm sm:text-base`}
            title="Add Feet"
          >
            <span>Feet</span>
            <span className={shortcutStyle}>(')</span>
          </button>
          <button
            onClick={() => { triggerFeedback(); onUnit('in'); }}
            className={`${baseBtn} bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900 text-sm sm:text-base`}
            title="Add Inches"
          >
            <span>Inch</span>
            <span className={shortcutStyle}>(;)</span>
          </button>
          <button
            onClick={() => { triggerFeedback(); onFraction(); }}
            className={`${baseBtn} bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900 text-sm sm:text-base`}
            title="Enter Fraction / Round Result"
          >
            <span className="leading-none text-base"><sup>x</sup>&frasl;<sub>x</sub></span>
            <span className={shortcutStyle}>round (\)</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => { triggerFeedback('operator'); onPercent(); }}
            className={`${baseBtn} bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 text-base sm:text-lg font-semibold`}
            title="Percentage"
          >
            <span>%</span>
          </button>
          <button
            onClick={() => { triggerFeedback(); onParenOpen(); }}
            className={`${baseBtn} bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 text-base sm:text-lg`}
            title="Open Parenthesis"
          >
            <span>(</span>
          </button>
          <button
            onClick={() => { triggerFeedback(); onParenClose(); }}
            className={`${baseBtn} bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 text-base sm:text-lg`}
            title="Close Parenthesis"
          >
            <span>)</span>
          </button>
          <button
            onClick={() => { triggerFeedback('operator'); onReciprocal(); }}
            className={`${baseBtn} bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 text-sm sm:text-base font-semibold`}
            title="Reciprocal (1/x)"
          >
            <span>1/x</span>
          </button>
        </>
      )}

      {/* Row 1 Col 5: Backspace (shared) */}
      <button
        onClick={() => { triggerFeedback(); onBackspace(); }}
        className={`${baseBtn} bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/80 dark:text-amber-200 dark:hover:bg-amber-900 text-lg`}
        title="Backspace"
        aria-label="Backspace"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* ROW 2 */}
      {isArch ? (
        <>
          <button
            onClick={() => { triggerFeedback(); onUnit('cm'); }}
            className={`${baseBtn} bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 text-sm sm:text-base`}
            title="Convert to cm"
          >
            <span>cm</span>
          </button>
          <button
            onClick={() => { triggerFeedback(); onUnit('mm'); }}
            className={`${baseBtn} bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 text-sm sm:text-base`}
            title="Convert to mm"
          >
            <span>mm</span>
          </button>
          <button
            onClick={() => { triggerFeedback(); onUnit('m'); }}
            className={`${baseBtn} bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 text-sm sm:text-base`}
            title="Convert to meters"
          >
            <span>m</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => { triggerFeedback('operator'); onSqrt(); }}
            className={`${baseBtn} bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 text-base sm:text-lg`}
            title="Square Root"
          >
            <span>√x</span>
          </button>
          <button
            onClick={() => { triggerFeedback('operator'); onSquare(); }}
            className={`${baseBtn} bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 text-base sm:text-lg`}
            title="Square (x²)"
          >
            <span>x²</span>
          </button>
          <button
            onClick={() => { triggerFeedback(); onPi(); }}
            className={`${baseBtn} bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 text-base sm:text-lg`}
            title="Pi (π = 3.14159...)"
          >
            <span>π</span>
          </button>
        </>
      )}

      {/* Row 2 Col 4: Divide (shared) */}
      <button
        onClick={() => { triggerFeedback('operator'); onOperator('divide'); }}
        className={`${baseBtn} bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 text-xl font-semibold`}
        title="Divide"
      >
        <span>÷</span>
      </button>

      {/* Row 2 Col 5: Conv (Archi) vs xʸ Power (Reg) */}
      {isArch ? (
        <button
          onClick={() => { triggerFeedback('operator'); onConvert(); }}
          className={`${baseBtn} bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 text-sm sm:text-base font-medium`}
          title="Conversion Mode"
        >
          <span>Conv</span>
          <span className={shortcutStyle}>(v)</span>
        </button>
      ) : (
        <button
          onClick={() => { triggerFeedback('operator'); onOperator('power'); }}
          className={`${baseBtn} bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 text-sm sm:text-base font-semibold`}
          title="Power (xʸ)"
        >
          <span>xʸ</span>
        </button>
      )}

      {/* ROW 3 */}
      <button
        onClick={() => { triggerFeedback(); onDigit('7'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        7
      </button>
      <button
        onClick={() => { triggerFeedback(); onDigit('8'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        8
      </button>
      <button
        onClick={() => { triggerFeedback(); onDigit('9'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        9
      </button>
      {/* Row 3 Col 4: Multiply (shared) */}
      <button
        onClick={() => { triggerFeedback('operator'); onOperator('multiply'); }}
        className={`${baseBtn} bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 text-xl font-semibold`}
        title="Multiply"
      >
        <span>×</span>
      </button>
      {/* Row 3 Col 5: SQ|CU (Archi) vs M+ (Reg) */}
      {isArch ? (
        <button
          onClick={() => { triggerFeedback(); onToggleSqCu(); }}
          className={`${baseBtn} bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 text-xs sm:text-sm font-semibold`}
          title="Toggle SQ/CU Mode"
        >
          <span>SQ|CU</span>
          <span className={shortcutStyle}>(u)</span>
        </button>
      ) : (
        <button
          onClick={() => { triggerFeedback(); onMemoryAdd(); }}
          className={`${baseBtn} bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 text-sm sm:text-base font-semibold`}
          title="Memory Add (M+)"
        >
          <span>M+</span>
        </button>
      )}

      {/* ROW 4 */}
      <button
        onClick={() => { triggerFeedback(); onDigit('4'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        4
      </button>
      <button
        onClick={() => { triggerFeedback(); onDigit('5'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        5
      </button>
      <button
        onClick={() => { triggerFeedback(); onDigit('6'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        6
      </button>
      {/* Row 4 Col 4: Subtract (shared) */}
      <button
        onClick={() => { triggerFeedback('operator'); onOperator('subtract'); }}
        className={`${baseBtn} bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 text-2xl font-semibold`}
        title="Subtract"
      >
        <span>−</span>
      </button>
      {/* Row 4 Col 5: Store (Archi) vs M- (Reg) */}
      {isArch ? (
        <button
          onClick={() => { triggerFeedback(); onMemoryStore(); }}
          className={`${baseBtn} bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 text-xs sm:text-sm font-medium`}
          title="Store Value into Memory"
        >
          <span>Store</span>
        </button>
      ) : (
        <button
          onClick={() => { triggerFeedback(); onMemorySub(); }}
          className={`${baseBtn} bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 text-sm sm:text-base font-semibold`}
          title="Memory Subtract (M-)"
        >
          <span>M−</span>
        </button>
      )}

      {/* ROW 5 */}
      <button
        onClick={() => { triggerFeedback(); onDigit('1'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        1
      </button>
      <button
        onClick={() => { triggerFeedback(); onDigit('2'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        2
      </button>
      <button
        onClick={() => { triggerFeedback(); onDigit('3'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        3
      </button>
      {/* Row 5 Col 4: Add (shared) */}
      <button
        onClick={() => { triggerFeedback('operator'); onOperator('add'); }}
        className={`${baseBtn} bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 text-2xl font-semibold`}
        title="Add"
      >
        <span>+</span>
      </button>
      {/* Row 5 Col 5: Recall (Archi) vs MR (Reg) */}
      {isArch ? (
        <button
          onClick={() => { triggerFeedback(); onMemoryRecall(); }}
          className={`${baseBtn} bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 text-xs sm:text-sm font-medium`}
          title="Recall Memory"
        >
          <span>Recall</span>
        </button>
      ) : (
        <button
          onClick={() => { triggerFeedback(); onMemoryRecall(); }}
          className={`${baseBtn} bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 text-sm sm:text-base font-semibold`}
          title="Memory Recall (MR)"
        >
          <span>MR</span>
        </button>
      )}

      {/* ROW 6 */}
      <button
        onClick={() => { triggerFeedback(); onDigit('0'); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-lg sm:text-xl font-semibold`}
      >
        0
      </button>
      <button
        onClick={() => { triggerFeedback(); onDecimal(); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-xl font-bold`}
        title="Decimal point"
      >
        .
      </button>
      <button
        onClick={() => { triggerFeedback(); onSign(); }}
        className={`${baseBtn} bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-base sm:text-lg`}
        title="Toggle Sign (+/-)"
      >
        +/-
      </button>
      {/* Row 6 Col 4 & 5: Equals (span 2) */}
      <button
        onClick={() => { triggerFeedback('equals'); onEquals(); }}
        className={`${baseBtn} col-span-2 bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-500 text-2xl font-semibold shadow-md active:bg-sky-700`}
        title="Calculate Result (=)"
      >
        =
      </button>

      {/* ROW 7 */}
      {/* Col 1: Clear Tape */}
      <button
        onClick={() => { triggerFeedback(); onClearTape(); }}
        className={`${baseBtn} bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-[11px] sm:text-xs font-medium`}
        title="Clear Tape History"
      >
        <span>Clear Tape</span>
      </button>

      {/* Col 2: On/C */}
      <button
        onClick={() => { triggerFeedback(); onClear(); }}
        className={`${baseBtn} bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold`}
        title="Clear Current Calculation"
      >
        <span>On/C</span>
      </button>

      {/* Col 3: Dark Mode Toggle */}
      <button
        onClick={() => { triggerFeedback(); onToggleDarkMode(); }}
        className={`${baseBtn} bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-base`}
        title="Toggle Dark / Light Mode"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
      </button>

      {/* Col 4 & 5: Calculator Mode Toggle Switch (takes up the bottom two slots on the lower right) */}
      <div
        className={`${baseBtn} col-span-2 p-1 bg-slate-200/90 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700/80 rounded-xl shadow-inner flex flex-row items-stretch select-none overflow-hidden`}
        role="group"
        aria-label="Calculator Mode Switch"
      >
        {/* Archi Mode Toggle Option */}
        <button
          type="button"
          onClick={() => {
            triggerFeedback('operator');
            if (!isArch) onToggleMode();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1 px-1.5 transition-all duration-200 cursor-pointer ${
            isArch
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-sm shadow-orange-500/30'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 font-medium'
          }`}
          title="Switch to Architectural Calculator (Feet, Inches, Fractions, Conversions)"
          aria-pressed={isArch}
        >
          <Compass className={`w-3.5 h-3.5 ${isArch ? 'text-white' : 'opacity-70'}`} />
          <span className="text-[11px] sm:text-xs tracking-wider uppercase font-semibold">Archi</span>
        </button>

        {/* Regular Mode Toggle Option */}
        <button
          type="button"
          onClick={() => {
            triggerFeedback('operator');
            if (isArch) onToggleMode();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1 px-1.5 transition-all duration-200 cursor-pointer ${
            !isArch
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-sm shadow-emerald-500/30'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 font-medium'
          }`}
          title="Switch to Regular Calculator (Standard Math, Percent, Powers, Roots)"
          aria-pressed={!isArch}
        >
          <Calculator className={`w-3.5 h-3.5 ${!isArch ? 'text-white' : 'opacity-70'}`} />
          <span className="text-[11px] sm:text-xs tracking-wider uppercase font-semibold">Regular</span>
        </button>
      </div>
    </div>
  );
};
