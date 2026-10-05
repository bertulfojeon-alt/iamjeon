"use client";

import { createContext } from "react";
import type Lenis from "lenis";
import type { Mode } from "@/lib/mode";

/**
 * Shared engine state. Kept in its own module (not the provider file) so hooks
 * can consume it without pulling the provider's effect logic into their bundle
 * and to avoid import cycles.
 */
export interface CinematicContextValue {
  /** The shared Lenis instance, or null when smooth scroll is off ("still" mode / pre-mount). */
  lenis: Lenis | null;
  /** Current viewing mode. "full" during SSR; the real value is set before paint by the head script. */
  mode: Mode;
  /** True once the client has read the real mode. */
  ready: boolean;
  /** The visitor's own "Pause motion" choice (persisted). */
  motionPaused: boolean;
  setMotionPaused: (paused: boolean) => void;
  /** Opt-in ambience. Never on by default. */
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
}

export const CinematicContext = createContext<CinematicContextValue>({
  lenis: null,
  mode: "full",
  ready: false,
  motionPaused: false,
  setMotionPaused: () => {},
  soundOn: false,
  setSoundOn: () => {},
});
