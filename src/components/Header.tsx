import React from 'react';
import { Info, Volume2, VolumeX, Download, Smartphone } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenInfo: () => void;
  onOpenInstallGuide: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  isInstalled: boolean;
  onInstallApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenInfo,
  onOpenInstallGuide,
  isInstallable,
  isIOS,
  isInstalled,
  onInstallApp,
}) => {
  return (
    <header className="relative w-full bg-gradient-to-r from-orange-500 to-amber-600 dark:from-slate-900 dark:to-slate-950 text-white px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-orange-600/30 dark:border-slate-800 select-none shadow-md transition-colors z-20 min-h-[50px]">
      {/* Left controls: Audio & Install */}
      <div className="flex items-center gap-1.5 z-10">
        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-lg hover:bg-white/15 active:bg-white/25 transition text-white/90 hover:text-white"
          title={soundEnabled ? 'Click to Mute Audio' : 'Click to Enable Audio Click'}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-75" />}
        </button>

        {!isInstalled && (
          <button
            onClick={isInstallable ? onInstallApp : onOpenInstallGuide}
            className="p-1.5 rounded-lg hover:bg-white/15 active:bg-white/25 transition text-white/90 hover:text-white"
            title="Install App on Phone / Desktop"
            aria-label="Install ArchiCalc Application"
          >
            {isIOS ? <Smartphone className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Center Brand Title (Always precisely centered) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-baseline justify-center gap-1.5 cursor-pointer pointer-events-auto select-none"
        onClick={onOpenInfo}
        title="About ArchiCalc"
      >
        <span className="font-architect text-2xl sm:text-[1.75rem] font-medium tracking-[2.5px] drop-shadow-xs leading-none">
          ArchiCalc
        </span>
        <span className="text-[10px] font-semibold bg-white/20 text-white/95 px-1.5 py-0.5 rounded tracking-wide uppercase">
          Beta
        </span>
      </div>

      {/* Right controls: Info & Documentation */}
      <div className="flex items-center gap-1.5 z-10">
        <button
          onClick={onOpenInfo}
          className="p-1.5 rounded-lg hover:bg-white/15 active:bg-white/25 transition text-white/90 hover:text-white flex items-center gap-1"
          title="About ArchiCalc & User Guide"
          aria-label="About ArchiCalc and Guide"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
