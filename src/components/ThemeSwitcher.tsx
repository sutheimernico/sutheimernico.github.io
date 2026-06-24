/**
 * ThemeSwitcher — React island.
 *
 * Fixed bottom-center pill with one swatch button per theme plus an animated
 * "Shift" button that cross-fades through all five dark palettes via rAF.
 *
 * Behaviour:
 * - Reads saved preference from localStorage('ns-theme2') on mount; defaults to 'shift'.
 * - Sets html[data-theme] and persists changes back to localStorage.
 * - Shift mode: starts rAF loop that advances t by 0.0083 every 3rd frame, calling
 *   paletteAt(t) to derive CSS var values and applying them as inline styles on <html>.
 * - prefers-reduced-motion: shift mode applies a single static snapshot (paletteAt(0))
 *   — no loop, no animation.
 * - Keyboard: digit keys 1–7 map to [phosphor, petrol, amethyst, solar, molten, daylight, shift].
 *   Ignored when focus is inside INPUT / TEXTAREA / SELECT.
 * - After every theme change dispatches CustomEvent('ns-accent') on window so other
 *   islands can recolour (e.g. canvas-based constellation).
 *
 * CSS lives in src/styles/global.css under the "theme switcher" comment block.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { THEMES } from '../lib/themes';
import { paletteAt } from '../lib/shift';

// All 7 valid theme ids, including the meta-theme 'shift'.
const VALID_IDS = [...THEMES.map(t => t.name), 'shift'] as const;
type ThemeId = (typeof VALID_IDS)[number];

// Derive the full list of CSS var names the shift loop writes — used for cleanup.
const SHIFT_VAR_KEYS = Object.keys(paletteAt(0));

function isValidId(v: unknown): v is ThemeId {
  return VALID_IDS.includes(v as ThemeId);
}

function readSaved(): ThemeId {
  try {
    const raw = localStorage.getItem('ns-theme2');
    return isValidId(raw) ? raw : 'shift';
  } catch {
    return 'shift';
  }
}

function persist(id: ThemeId): void {
  try { localStorage.setItem('ns-theme2', id); } catch { /* ignore */ }
}

function dispatchAccentEvent(): void {
  window.dispatchEvent(new CustomEvent('ns-accent'));
}

function stopShiftVars(): void {
  const root = document.documentElement;
  for (const key of SHIFT_VAR_KEYS) {
    root.style.removeProperty(key);
  }
}

export default function ThemeSwitcher() {
  const [active, setActive] = useState<ThemeId>('shift');

  // rAF state kept in refs so the loop closure is stable.
  const rafRef = useRef<number | null>(null);
  const tRef = useRef(0);
  const frameCountRef = useRef(0);
  const reducedMotion = useRef(false);
  // .theming-class timeout in a ref — module scope would be shared across instances.
  const themingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Throttle the .theming class: add it, auto-remove after dur-slow (650 ms).
  const flashTheming = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('theming');
    if (themingTimeoutRef.current) clearTimeout(themingTimeoutRef.current);
    themingTimeoutRef.current = setTimeout(() => {
      root.classList.remove('theming');
      themingTimeoutRef.current = null;
    }, 680);
  }, []);

  // Start the shift loop.
  const startShift = useCallback(() => {
    if (reducedMotion.current) {
      // Static snapshot only — no animation.
      const snap = paletteAt(0);
      const root = document.documentElement;
      for (const [name, value] of Object.entries(snap)) {
        root.style.setProperty(name, value);
      }
      dispatchAccentEvent();
      return;
    }
    if (rafRef.current !== null) return; // already running
    const loop = () => {
      frameCountRef.current += 1;
      if (frameCountRef.current % 3 === 0) {
        tRef.current = (tRef.current + 0.0083) % 5; // 5 palettes
        const palette = paletteAt(tRef.current);
        const root = document.documentElement;
        for (const [name, value] of Object.entries(palette)) {
          root.style.setProperty(name, value);
        }
        dispatchAccentEvent();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // Stop the shift loop and clean up inline vars.
  const stopShift = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    stopShiftVars();
  }, []);

  // Central apply function — sets html[data-theme], manages shift loop, persists, dispatches.
  const applyTheme = useCallback(
    (id: ThemeId, skipFlash = false) => {
      const root = document.documentElement;
      setActive(id);

      if (id === 'shift') {
        root.dataset.theme = 'phosphor'; // dark base under animated accents
        startShift();
      } else {
        stopShift();
        if (!skipFlash) flashTheming();
        root.dataset.theme = id;
        dispatchAccentEvent();
      }

      persist(id);
    },
    [startShift, stopShift, flashTheming],
  );

  // On mount: check reduced-motion preference, read saved preference, register keyboard handler.
  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const saved = readSaved();
    applyTheme(saved, /* skipFlash */ true);

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const idx = parseInt(e.key, 10);
      if (idx >= 1 && idx <= VALID_IDS.length) {
        applyTheme(VALID_IDS[idx - 1]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      // Clean up rAF on unmount.
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Remove inline shift vars so unmount can't leave --var overrides on <html>.
      stopShiftVars();
      if (themingTimeoutRef.current) {
        clearTimeout(themingTimeoutRef.current);
        themingTimeoutRef.current = null;
      }
    };
  }, [applyTheme]);

  return (
    <div className="theme-bar" role="group" aria-label="Color theme">
      <span className="theme-label">Theme</span>

      {THEMES.map((t) => (
        <button
          key={t.name}
          type="button"
          className="sw"
          data-set={t.name}
          style={{ '--sw': t.swatch } as React.CSSProperties}
          aria-pressed={active === t.name}
          onClick={() => applyTheme(t.name)}
        >
          <span className="sw-tip">{t.label}</span>
        </button>
      ))}

      <button
        type="button"
        className="sw shift"
        data-set="shift"
        aria-pressed={active === 'shift'}
        onClick={() => applyTheme('shift')}
      >
        ∿<span className="sw-tip">Shift · animated</span>
      </button>
    </div>
  );
}
