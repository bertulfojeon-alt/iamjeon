/**
 * Viewing modes — how much cinema each visitor gets.
 *
 *  full  — desktop: continuous scroll-scrubbed footage, live screens, sound available.
 *  lite  — touch, narrow or weak devices: vertical renditions, stacked screens.
 *  still — reduced motion, data saver, or the visitor pressed "Pause motion":
 *          posters and crossfades, no smooth scroll, no scrubbing.
 *
 * Kept as a pure function of measured signals so it is unit-testable and the
 * same inputs always give the same mode.
 */

export type Mode = "full" | "lite" | "still";

export interface ModeSignals {
  reducedMotion: boolean;
  saveData: boolean;
  coarsePointer: boolean;
  viewportWidth: number;
  cores: number;
  memoryGb: number;
  motionPausedByUser: boolean;
}

export function pickMode(s: ModeSignals): Mode {
  if (s.reducedMotion || s.saveData || s.motionPausedByUser) return "still";
  if (s.coarsePointer || s.viewportWidth < 900 || s.cores <= 2 || s.memoryGb <= 2) return "lite";
  return "full";
}

export interface MemoryBudget {
  windowAhead: number;
  windowBehind: number;
  maxDpr: number;
}

export function memoryBudget(mode: Mode): MemoryBudget {
  if (mode === "full") return { windowAhead: 24, windowBehind: 8, maxDpr: 2 };
  return { windowAhead: 10, windowBehind: 4, maxDpr: 1.5 };
}

/** Reads the live signals from the browser. Client-only. */
export function readSignals(motionPausedByUser: boolean): ModeSignals {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: nav.connection?.saveData === true,
    coarsePointer: matchMedia("(pointer: coarse)").matches,
    viewportWidth: window.innerWidth,
    cores: nav.hardwareConcurrency ?? 8,
    memoryGb: nav.deviceMemory ?? 8,
    motionPausedByUser,
  };
}
