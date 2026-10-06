"use client";

/**
 * A coded presentation of UnsayBalita (an n8n pipeline — no screen of its own).
 * Shows only what is built: a feed item is picked up, the article and image are
 * fetched, the first model fails and the chain falls over to the next with an
 * alert, the JSON is repaired to its field limits, and headless Chrome renders a
 * 1080×1080 card with bold keywords. Demo headline. ~16 s loop.
 */

import { useLoopClock } from "./useLoopClock";
import styles from "./NewsCardPipeline.module.css";

const LOOP = 16;

const STEPS = [
  { at: 0.4, label: "Feed polled", detail: "1 new item" },
  { at: 1.8, label: "Article + image fetched", detail: "fallback source not needed" },
  { at: 3.4, label: "Model 1", detail: "timed out", state: "fail" as const },
  { at: 4.6, label: "Model 2", detail: "answered · alert sent", state: "ok" as const },
  { at: 6.2, label: "JSON repaired", detail: "headline trimmed to 70 chars" },
  { at: 7.6, label: "Card rendered", detail: "1080×1080 PNG · fonts loaded" },
];

export function NewsCardPipeline() {
  const t = useLoopClock(LOOP, 12);
  const fading = t >= LOOP - 0.6;
  const card = t >= 8.2;

  return (
    <div
      className={styles.stage}
      data-fading={fading}
      role="img"
      aria-label="Demo: a news feed item is fetched, the first AI model fails and the chain falls back to the second with an alert, the JSON is repaired, and a square news card is rendered with bold keywords."
    >
      <section className={styles.flow}>
        <p className={styles.head}>Pipeline run</p>
        <ol>
          {STEPS.map((s) => (
            <li key={s.label} data-in={t >= s.at} data-state={s.state ?? "ok"}>
              <span className={styles.dot} />
              <strong>{s.label}</strong>
              <span className={styles.detail}>{s.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.cardWrap}>
        <div className={styles.card} data-in={card}>
          <span className={styles.badge}>Balita</span>
          <p className={styles.headline}>
            City opens a new <b>flood pumping station</b> ahead of the <b>rainy season</b>
          </p>
          <p className={styles.dek}>Three barangays along the river are covered first.</p>
          <span className={styles.size}>1080 × 1080</span>
        </div>
      </section>
    </div>
  );
}
