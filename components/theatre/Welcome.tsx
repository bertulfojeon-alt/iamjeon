"use client";

/**
 * The welcome copy, arriving like a film's opening titles over the bench shot:
 * the location card, the promise, the rotating line, then Jeon's name as a credit.
 * Inert once the visitor has left the welcome, so Tab never lands on scrolled-away buttons.
 */

import { useEffect, useState } from "react";
import { useCinematic } from "@/hooks/useCinematic";
import { clockLine } from "@/lib/clock";
import { RotatingLine } from "./RotatingLine";
import styles from "./Welcome.module.css";

function useClock() {
  const [line, setLine] = useState<ReturnType<typeof clockLine> | null>(null);
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tick = () => setLine(clockLine(new Date(), tz));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return line;
}

export function Welcome({ active }: { active: boolean }) {
  const { mode, ready } = useCinematic();
  const clock = useClock();

  return (
    <div className={styles.copy} inert={!active}>
      <div className={styles.inner}>
        <p className={styles.where}>
          {clock ? (
            <>
              {clock.here} in Lapu-Lapu City
              {clock.there && <span className={styles.there}> · {clock.there} where you are</span>}
            </>
          ) : (
            // Painted with the first HTML (it is the largest early text, so it sets the load
            // score); the clock replaces it once the page runs.
            "Lapu-Lapu City, Cebu"
          )}
        </p>
        <h1 className={`display ${styles.headline}`}>While your office sleeps, your systems keep working.</h1>
        <RotatingLine still={ready && mode === "still"} />
        <p className={styles.credit}>
          A night shift by <strong>Loreto “Jeon” Saquilabon Jr.</strong> · Full-stack developer &amp; AI automation
          engineer
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => window.dispatchEvent(new Event("ns:play"))}>
            {"See what I'd build for you"}
          </button>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => window.dispatchEvent(new CustomEvent("ns:open", { detail: "contact" }))}
          >
            Get in touch
          </button>
        </div>
      </div>
      <p className={styles.cue} aria-hidden="true">
        Scroll
      </p>
    </div>
  );
}
