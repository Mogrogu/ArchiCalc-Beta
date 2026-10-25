import React, { useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface DisplayProps {
  history: string[];
  activeTapeStr: string;
  isResultState: boolean;
  currentInputStr: string;
  displayValue: string;
  dimensionalSecondaryText: string;
  copiedTape: boolean;
  onCopyTape: () => void;
  calculatorMode: 'architectural' | 'regular';
  hasMemory: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  history,
  activeTapeStr,
  isResultState,
  currentInputStr,
  displayValue,
  dimensionalSecondaryText,
  copiedTape,
  onCopyTape,
  calculatorMode,
  hasMemory,
}) => {
  const historyTapeRef = useRef<HTMLDivElement>(null);
  const displayValueRef = useRef<HTMLDivElement>(null);

  // Auto scroll tape to bottom on new entries
  useEffect(() => {
    if (historyTapeRef.current) {
      historyTapeRef.current.scrollTop = historyTapeRef.current.scrollHeight;
    }
  }, [history, activeTapeStr, currentInputStr]);

  // Adjust display font size if text is long
  useEffect(() => {
    const el = displayValueRef.current;
    if (!el) return;
    let size = 3.5; // rem
    el.style.fontSize = `${size}rem`;
    while (el.scrollWidth > el.clientWidth && size > 1.3) {
      size -= 0.15;
      el.style.fontSize = `${size}rem`;
    }
  }, [displayValue]);

  return (
    <div className="flex flex-col flex-1 min-h-[140px] bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors overflow-hidden">
      {/* History Tape */}
      <div
        ref={historyTapeRef}
        onClick={onCopyTape}
        title="Tap to copy calculation tape"
        className="flex-1 overflow-y-auto px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono text-right flex flex-col items-end cursor-pointer select-text hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors custom-scrollbar relative group"
      >
        <div className="sticky top-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-xs text-[10px] px-2 py-0.5 rounded flex items-center gap-1 text-slate-700 dark:text-slate-200">
          {copiedTape ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          <span>{copiedTape ? 'Copied!' : 'Copy Tape'}</span>
        </div>

        {history.length === 0 && !activeTapeStr && (
          <div className="my-auto text-slate-400 dark:text-slate-600 italic text-[11px] select-none">
            {calculatorMode === 'architectural'
              ? 'Ready • Enter feet, inches, fractions or metric'
              : 'Ready • Standard calculator mode'}
          </div>
        )}

        {history.map((item, idx) => (
          <div
            key={idx}
            className="w-full py-0.5 leading-relaxed break-all"
            dangerouslySetInnerHTML={{ __html: item }}
          />
        ))}

        {activeTapeStr && (
          <div className="w-full py-0.5 opacity-60 italic text-slate-600 dark:text-slate-300">
            {activeTapeStr}
            {!isResultState && currentInputStr !== '0' && currentInputStr !== 'Error'
              ? ` ${currentInputStr}`
              : ''}{' '}
            ...
          </div>
        )}
      </div>

      {/* Main Display container */}
      <div className="px-4 py-2 flex flex-col justify-end items-end w-full select-text">
        {/* Secondary Dimensional / Mode Status Line */}
        <div className="h-5 w-full text-right text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {hasMemory && (
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                M
              </span>
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {calculatorMode === 'architectural' ? 'ARCHI' : 'REGULAR'}
            </span>
            {copiedTape && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                Tape Copied!
              </span>
            )}
          </div>
          <div className="truncate max-w-[80%] font-mono text-slate-600 dark:text-slate-300">
            {dimensionalSecondaryText}
          </div>
        </div>

        {/* Primary Large Display */}
        <div
          ref={displayValueRef}
          className="w-full text-right font-light tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap overflow-x-auto overflow-y-hidden leading-none min-h-[1.1em] py-1 select-all"
          style={{ fontSize: '3.5rem' }}
        >
          {displayValue}
        </div>
      </div>
    </div>
  );
};
