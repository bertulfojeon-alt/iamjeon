"use client";

/**
 * CinematicProvider — the engine root.
 *
 * Owns the single shared smooth-scroll instance (Lenis) and wires it to GSAP so
 * the whole app runs on ONE requestAnimationFrame loop:
 *
 *   gsap.ticker  ──drives──▶  lenis.raf()        (smooth scroll stepping)
 *   lenis "scroll" event  ──▶  ScrollTrigger.update()  (scrub stays synced)
 *
 * It also owns the viewing mode. The head script stamps `data-mode` on <html>
 * before paint; this provider reads it on mount, keeps it current when the
 * visitor toggles "Pause motion", and skips Lenis entirely in "still" mode.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
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
    // Layout differs between modes; let ScrollTrigger re-measure after the DOM settles.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!ready || mode === "still") {
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      // Eased, weighty feel suited to a cinematic experience.
      duration: mode === "full" ? 1.1 : 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    lenisRef.current = instance;
    setLenis(instance);

    // Keep ScrollTrigger in lockstep with Lenis' virtual scroll position.
    instance.on("scroll", ScrollTrigger.update);

    // Single rAF loop: GSAP's ticker steps Lenis. (Lenis expects ms; ticker reports seconds.)
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      instance.off("scroll", ScrollTrigger.update);
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
