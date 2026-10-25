import React, { useEffect } from 'react';
import { X, Apple, Smartphone, Keyboard, ShieldAlert, Award, Calculator, Compass } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallApp?: () => void;
  isInstallable?: boolean;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  onInstallApp,
  isInstallable,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
              AC
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                ArchiCalc
                <span className="text-[11px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 px-2 py-0.5 rounded-full">
                  Beta 1.3.1
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Architectural & Standard Precision Calculator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm custom-scrollbar leading-relaxed">
          {/* Note / Beta Warning */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <span className="text-base select-none">⚠️</span>
            <div>
              <strong className="font-semibold">Note:</strong> This is a <strong>beta release</strong> currently in the testing stage. Functionality and accuracy are still being evaluated. Feedback and bug reports are welcome.
            </div>
          </div>

          {/* Quick Switch Callout */}
          <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-500 text-white shrink-0 mt-0.5">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <strong className="text-orange-900 dark:text-orange-200 block text-sm font-semibold mb-0.5">
                Dual Architectural & Regular Modes
              </strong>
              Tap the <strong>toggle switch in the bottom right corner</strong> to switch instantly between the Architectural Calculator and a Standard Calculator. All numbers and basic keys stay in the exact same positions, while architectural functions seamlessly swap with standard functions (<code className="text-xs bg-orange-200/50 dark:bg-orange-900/50 px-1 py-0.5 rounded">%</code>, <code className="text-xs bg-orange-200/50 dark:bg-orange-900/50 px-1 py-0.5 rounded">√x</code>, <code className="text-xs bg-orange-200/50 dark:bg-orange-900/50 px-1 py-0.5 rounded">x²</code>, <code className="text-xs bg-orange-200/50 dark:bg-orange-900/50 px-1 py-0.5 rounded">1/x</code>, <code className="text-xs bg-orange-200/50 dark:bg-orange-900/50 px-1 py-0.5 rounded">π</code>, <code className="text-xs bg-orange-200/50 dark:bg-orange-900/50 px-1 py-0.5 rounded">xʸ</code>, <code className="text-xs bg-orange-200/50 dark:bg-orange-900/50 px-1 py-0.5 rounded">M+ / M- / MR</code>).
            </div>
          </div>

          {/* Installation on Phone */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              Install on Apple & Android Phones
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              ArchiCalc is an installable Progressive Web App (PWA) with full offline support.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Apple iOS */}
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                  <Apple className="w-4 h-4" /> Apple iPhone & iPad
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>Open this page in <strong>Safari</strong>.</li>
                  <li>Tap the <strong>Share</strong> button (box with arrow).</li>
                  <li>Scroll and tap <strong>Add to Home Screen</strong>.</li>
                </ol>
              </div>

              {/* Android */}
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                  <Smartphone className="w-4 h-4 text-emerald-500" /> Android Phones
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>In Chrome/Edge, tap the menu (⋮).</li>
                  <li>Tap <strong>Install App</strong> or <strong>Add to Home screen</strong>.</li>
                  <li>Launch directly from your home screen like a native app.</li>
                </ol>
                {isInstallable && onInstallApp && (
                  <button
                    onClick={onInstallApp}
                    className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition"
                  >
                    Install Now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li><strong>Dimensional Input:</strong> Work directly in feet, inches, and fractions (e.g. <code>5 ft 6 3/8 in</code>).</li>
              <li><strong>Multi-Dimensional Math:</strong> Automatically computes linear, area (sq ft / sq in), and volume (cu ft / cu in).</li>
              <li><strong>SQ|CU Mode:</strong> Toggle to enter direct area (SQ) or volume (CU) measurements.</li>
              <li><strong>Metric Conversion:</strong> Seamless conversion between imperial and metric (meters, cm, mm).</li>
              <li><strong>Fraction Rounding:</strong> Press <code>round (\)</code> repeatedly on results to cycle to nearest lower fraction (1/32, 1/16, 1/8, 1/4, 1/2, 1").</li>
              <li><strong>Calculation Tape:</strong> Scrollable tape keeps full history. Tap any tape entry to copy.</li>
              <li><strong>Audio & Haptic Feedback:</strong> Subtle tactile feedback for responsive mobile typing.</li>
            </ul>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-sky-500" />
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
                <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">'</kbd> Feet
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
                <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">;</kbd> Inch
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
                <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">\</kbd> Fraction / Round
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
                <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">v</kbd> Convert
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
                <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">u</kbd> SQ|CU Toggle
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
                <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">c</kbd> or <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">Esc</kbd> Clear
              </div>
            </div>
          </div>

          {/* License & Disclaimers */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">License</h3>
              <p>Copyright © 2026 Alen Moghaddam<br />This software is provided for personal, non-commercial use only.</p>
            </div>

            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Permission is granted to:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1 text-[11.5px]">
                <li>Use the calculator for private or educational architectural purposes.</li>
                <li>Modify the code for your own local use.</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">You are not permitted to:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1 text-[11.5px]">
                <li>Redistribute or sell this software or derivative works.</li>
                <li>Use it in any commercial, public-facing, or client-serving application.</li>
                <li>Host the calculator publicly without prior written permission from the author.</li>
              </ul>
            </div>

            <p className="text-[11px] leading-relaxed italic bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
              This software is provided &quot;AS IS&quot;, without warranty of any kind, express or implied. This includes but is not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>

            <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-[11.5px] text-amber-950 dark:text-amber-200 leading-relaxed space-y-1">
              <strong className="text-amber-700 dark:text-amber-300 font-bold block flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                Disclaimer
              </strong>
              <p>
                The author shall not be held liable for any damages or consequences arising from the use or misuse of this calculator. All calculations should be independently verified before use in professional or regulatory contexts. This tool is not certified for use in code-compliant design, engineering, or life-safety-critical applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">Contributions</h3>
              <p className="text-[11px]">
                This is a closed project made available for individual use. Bug reports or enhancement suggestions are welcome via GitHub issues, but this project does not currently accept public contributions or pull requests.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Created by Alen Moghaddam</span>
              </div>
              <a href="mailto:alm360@yahoo.com" className="text-orange-600 dark:text-orange-400 underline font-medium">alm360@yahoo.com</a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-lg text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
