import { useState, useCallback, useRef } from 'react';

export function useHaptics() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('archicalc_sound');
      return saved === null ? false : saved === 'true';
    } catch {
      return false;
    }
  });

  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('archicalc_haptics');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('archicalc_sound', String(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('archicalc_haptics', String(next));
      } catch {}
      return next;
    });
  }, []);

  const triggerFeedback = useCallback((type: 'standard' | 'operator' | 'equals' | 'error' = 'standard') => {
    // 1. Android / standard mobile vibration
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'equals') {
          navigator.vibrate([15, 30, 20]);
        } else if (type === 'error') {
          navigator.vibrate([50, 50, 50]);
        } else {
          navigator.vibrate(10);
        }
      } catch {}
    }

    // 2. Crisp, subtle Web Audio tactile feedback click
    if (!soundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      let freq = 800;
      let duration = 0.018;

      if (type === 'operator') {
        freq = 1100;
      } else if (type === 'equals') {
        freq = 1400;
        duration = 0.035;
      } else if (type === 'error') {
        freq = 240;
        duration = 0.08;
      }

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }, [soundEnabled, hapticsEnabled]);

  return {
    soundEnabled,
    hapticsEnabled,
    toggleSound,
    toggleHaptics,
    triggerFeedback,
  };
}
