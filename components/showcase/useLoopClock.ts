"use client";

import { useEffect, useState } from "react";

/**
 * One clock for a coded showcase: seconds into a repeating loop, from a single
 * rAF, so captions, pulses and charts stay in sync. Reduced motion or the
 * site's "still" mode freezes on `stillAt` (the finished frame). Each wrap is
 * exposed on <html data-showcase-loop> so the capture script can cut exactly one
 * loop from a recording.
 */
export function useLoopClock(loop: number, stillAt: number): number {
  const [t, setT] = useState(stillAt);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.mode === "still") {
      setT(stillAt);
      return;
    }
    const start = performance.now();
    let raf = 0;
    let n = -1;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      setT(elapsed % loop);
      const k = Math.floor(elapsed / loop);
      if (k !== n) {
        n = k;
        document.documentElement.dataset.showcaseLoop = String(k);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loop, stillAt]);
  return t;
}

/** Spoken/typed line helpers shared by showcases. */
export interface Line {
  who: string;
  at: number;
  pace: number;
  text: string;
}

export function lineEnd(l: Line) {
  return l.at + l.text.split(" ").length * l.pace;
}

/** Words of `l` shown at time `t`. */
export function wordsShown(l: Line, t: number) {
  const words = l.text.split(" ");
  return words.slice(0, Math.min(words.length, Math.floor((t - l.at) / l.pace) + 1)).join(" ");
}

/** Seconds at which `word` in `l` is spoken. */
export function wordAt(l: Line, word: string) {
  return l.at + l.text.split(" ").findIndex((w) => w.includes(word)) * l.pace;
}
