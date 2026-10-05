"use client";

/**
 * A coded presentation of Ainalytics' signature moment — the voice presenter —
 * shown instead of screenshots. Demo data only ("Northwind BPO"), product palette
 * (light, indigo). One ~15 s loop:
 *
 *   ask → the presenter speaks, the metric card lands and its value pulses on the
 *   word → "who moved it" waterfall builds, the driver highlights on cue → an
 *   emailed PDF report slides in → reset.
 *
 * Driven by one clock so captions, pulses and charts stay in sync; reduced motion
 * shows the finished frame. Scales with its container (container query units).
 */

import { useEffect, useState } from "react";
import styles from "./AinalyticsPresenter.module.css";

const LOOP = 15;

/** Spoken lines: start time and per-word pace. */
const LINES = [
  { who: "you", at: 0.6, pace: 0.24, text: "How did we do this month?" },
  { who: "ai", at: 2.5, pace: 0.26, text: "Revenue closed at ₱2.48M — 12% above target." },
  { who: "ai", at: 5.6, pace: 0.25, text: "Most of the lift came from the Visayas team: plus ₱310K." },
  { who: "ai", at: 9.6, pace: 0.24, text: "Want me to email this report to you?" },
  { who: "you", at: 11.4, pace: 0.22, text: "Yes, please." },
] as const;

const BARS = [
  { label: "Last month", value: 2.21, kind: "total" },
  { label: "Visayas", value: 0.31, kind: "up" },
  { label: "Luzon", value: 0.06, kind: "up" },
  { label: "Mindanao", value: -0.1, kind: "down" },
  { label: "This month", value: 2.48, kind: "total" },
] as const;

/** When a word in a line is spoken (seconds). */
function wordTime(lineIdx: number, word: string) {
  const line = LINES[lineIdx];
  const i = line.text.split(" ").findIndex((w) => w.includes(word));
  return line.at + i * line.pace;
}

const PULSE_VALUE = wordTime(1, "₱2.48M");
const PULSE_DELTA = wordTime(1, "12%");
const PULSE_DRIVER = wordTime(2, "Visayas");

function useClock(): number {
  const [t, setT] = useState(LOOP - 0.8);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.mode === "still") {
      setT(13.6);
      return;
    }
    const start = performance.now();
    let raf = 0;
    let loop = -1;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      setT(elapsed % LOOP);
      // Exposed so the capture script can cut exactly one loop from a recording.
      const n = Math.floor(elapsed / LOOP);
      if (n !== loop) {
        loop = n;
        document.documentElement.dataset.showcaseLoop = String(n);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

const pulse = (t: number, at: number) => t >= at && t < at + 0.9;

export function AinalyticsPresenter() {
  const t = useClock();

  const speakingLine = LINES.findIndex((l, i) => {
    const end = l.at + l.text.split(" ").length * l.pace + 0.4;
    return t >= l.at && t < end && (i === LINES.length - 1 || t < LINES[i + 1].at);
  });
  const aiSpeaking = speakingLine >= 0 && LINES[speakingLine].who === "ai";
  const shownLines = LINES.map((l, i) => ({ ...l, i })).filter((l) => t >= l.at);
  const cardIn = t >= 2.5;
  const chartIn = t >= 5.6;
  const pdfIn = t >= 12.1;
  const fading = t >= LOOP - 0.7;

  // Axis zoomed to ₱2.0M–₱2.6M (labelled), so the month-on-month movers read clearly.
  const min = 2.0;
  const max = 2.6;
  const span = max - min;
  let running = 0;

  return (
    <div className={styles.stage} data-fading={fading} role="img" aria-label="Demo: the voice presenter answers a question about this month's revenue, shows a metric card and a waterfall of what moved it, then emails a PDF report.">
      <aside className={styles.voice}>
        <div className={styles.voiceHead}>
          <span className={styles.live}>● Live</span>
          <span className={styles.voiceName}>Presenter</span>
        </div>
        <div className={styles.orbWrap}>
          <div className={styles.orb} data-speaking={aiSpeaking}>
            <span />
            <span />
            <span />
          </div>
        </div>
        <ol className={styles.captions}>
          {shownLines.slice(-3).map((l) => {
            const words = l.text.split(" ");
            const count = Math.min(words.length, Math.floor((t - l.at) / l.pace) + 1);
            return (
              <li key={l.i} data-who={l.who}>
                {words.slice(0, count).join(" ")}
              </li>
            );
          })}
        </ol>
      </aside>

      <main className={styles.board}>
        <header className={styles.boardHead}>
          <span className={styles.biz}>Northwind BPO</span>
          <span className={styles.period}>October · month to date</span>
        </header>

        <section className={styles.card} data-in={cardIn}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Revenue</span>
            <span className={styles.verdict}>On track</span>
          </div>
          <div className={styles.value} data-pulse={pulse(t, PULSE_VALUE)}>
            ₱2.48M
          </div>
          <div className={styles.delta} data-pulse={pulse(t, PULSE_DELTA)}>
            ▲ 12% vs target ₱2.21M
          </div>
          <div className={styles.bullet}>
            <span className={styles.bulletFill} style={{ width: cardIn ? "95%" : "0%" }} />
            <span className={styles.bulletTarget} />
          </div>
        </section>

        <section className={styles.chart} data-in={chartIn}>
          <div className={styles.chartTitle}>
            Who moved it <span className={styles.axis}>axis from ₱2.0M</span>
          </div>
          <div className={styles.bars}>
            {BARS.map((b, i) => {
              const start = b.kind === "total" ? 0 : running;
              if (b.kind !== "total") running += b.value;
              else running = b.value;
              const top = b.kind === "total" ? b.value : Math.max(start, start + b.value);
              const height = Math.abs(b.value);
              const shown = t >= 5.9 + i * 0.45;
              return (
                <div key={b.label} className={styles.barCol}>
                  <div className={styles.barArea}>
                    <span
                      className={styles.bar}
                      data-kind={b.kind}
                      data-hot={b.label === "Visayas" && t >= PULSE_DRIVER}
                      style={{
                        bottom: `${(Math.max(0, top - height - min) / span) * 100}%`,
                        height: shown ? `${((b.kind === "total" ? b.value - min : height) / span) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <span className={styles.barLabel}>{b.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.pdf} data-in={pdfIn}>
          <div className={styles.pdfPage}>
            <span className={styles.pdfLine} />
            <span className={styles.pdfLine} />
            <span className={styles.pdfKpis}>
              <i />
              <i />
              <i />
            </span>
            <span className={styles.pdfLine} />
          </div>
          <div className={styles.pdfText}>
            <strong>October performance.pdf</strong>
            <span>Emailed to the owner · 1 page</span>
          </div>
        </section>
      </main>
    </div>
  );
}
