"use client";

/**
 * CinematicProvider — the engine root.
 *
 * Owns the single shared smooth-scroll instance (Lenis, driving its own rAF loop).
 *
 * It also owns the viewing mode. The head script stamps `data-mode` on <html>
 * before paint; this provider reads it on mount, keeps it current when the
 * visitor toggles "Pause motion", and skips Lenis entirely in "still" mode.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { pickMode, readSignals, type Mode } from "@/lib/mode";
import { CinematicContext } from "./cinematic-context";
import { MOTION_STORAGE_KEY } from "./mode-script";

export function CinematicProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("full");
  const [ready, setReady] = useState(false);
  const [motionPaused, setMotionPausedState] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Read the mode the head script decided, then follow live changes.
  useEffect(() => {
    let paused = false;
    try {
      paused = localStorage.getItem(MOTION_STORAGE_KEY) === "1";
    } catch {}
    setMotionPausedState(paused);
    const apply = () => {
      const next = pickMode(readSignals(document.documentElement.dataset.motionPaused === "true"));
      document.documentElement.dataset.mode = next;
      setMode(next);
    };
    apply();
    setReady(true);
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const setMotionPaused = useCallback((paused: boolean) => {
    try {
      localStorage.setItem(MOTION_STORAGE_KEY, paused ? "1" : "0");
    } catch {}
    const root = document.documentElement;
    if (paused) root.dataset.motionPaused = "true";
    else delete root.dataset.motionPaused;
    const next = pickMode(readSignals(paused));
    root.dataset.mode = next;
    setMotionPausedState(paused);
    setMode(next);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!ready || mode === "still") return;
    const instance = new Lenis({
      // Eased, weighty feel suited to a cinematic experience.
      duration: mode === "full" ? 1.1 : 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      autoRaf: true,
    });
    lenisRef.current = instance;
    setLenis(instance);
    return () => {
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [mode, ready]);

  const value = useMemo(
    () => ({ lenis, mode, ready, motionPaused, setMotionPaused, soundOn, setSoundOn }),
    [lenis, mode, ready, motionPaused, setMotionPaused, soundOn],
  );

  return <CinematicContext.Provider value={value}>{children}</CinematicContext.Provider>;
}
