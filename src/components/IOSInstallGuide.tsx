import React from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

interface IOSInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuide: React.FC<IOSInstallGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Install on Apple iPhone / iPad
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Install ArchiCalc as a standalone app on your Apple device for instant offline access without browser bars.
        </p>

        <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 rounded-lg shrink-0">
              <Share className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-900 dark:text-white">1. Tap the Share Button</strong>
              <span className="text-slate-500 dark:text-slate-400">At the bottom of Safari (or top on iPad), tap the Share icon.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 rounded-lg shrink-0">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-900 dark:text-white">2. Add to Home Screen</strong>
              <span className="text-slate-500 dark:text-slate-400">Scroll down the menu list and tap "Add to Home Screen".</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-orange-500 hover:bg-orange-600 py-2.5 text-xs font-semibold text-white transition shadow-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
