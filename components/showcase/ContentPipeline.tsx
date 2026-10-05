"use client";

/**
 * A coded presentation of the SMM System's content loop — trend → score →
 * script → independent critic → approval → schedule. Fictional trends and copy,
 * product palette (navy, gold). One ~16 s loop.
 */

import { useLoopClock } from "./useLoopClock";
import styles from "./ContentPipeline.module.css";

const LOOP = 16;

const STAGES = ["Trends", "Scored", "Script", "Critic", "Scheduled"] as const;

const SCRIPT = [
  "HOOK: “Ginto sa all-time high — huli na ba ako?”",
  "1 · Why price at a record isn't a buy signal",
  "2 · Where structure says wait",
  "CTA: Comment “PLAN” for the free lesson",
];

const CHECKS = ["No profit promises", "One call to action", "Taglish, beginner level", "Hook in first 2 s"];

export function ContentPipeline() {
  const t = useLoopClock(LOOP, 14.6);
  // Which stage the winning card is in.
  const stage = t < 2.2 ? 0 : t < 4.2 ? 1 : t < 8.4 ? 2 : t < 11.6 ? 3 : 4;
  const scriptLines = Math.max(0, Math.min(SCRIPT.length, Math.floor((t - 4.6) / 0.8) + 1));
  const checks = Math.max(0, Math.min(CHECKS.length, Math.floor((t - 8.8) / 0.6) + 1));
  const fading = t >= LOOP - 0.7;

  return (
    <div
      className={styles.stage}
      data-fading={fading}
      role="img"
      aria-label="Demo: a trending topic is scored, turned into a script, checked by an independent AI critic, approved and scheduled to Facebook, Instagram and YouTube; a weak trend is rejected."
    >
      <header className={styles.head}>
        <span className={styles.title}>Content desk</span>
        <ol className={styles.rail}>
          {STAGES.map((s, i) => (
            <li key={s} data-on={i <= stage} data-now={i === stage}>
              {s}
            </li>
          ))}
        </ol>
      </header>

      <div className={styles.body}>
        <section className={styles.trends}>
          <div className={styles.colTitle}>Trend radar · PH finance</div>
          <article className={styles.trend} data-score={t >= 2.2 ? "high" : "pending"}>
            <span className={styles.trendName}>Gold hits a record high — beginners ask “too late?”</span>
            <span className={styles.score}>{t >= 2.2 ? "82 · generate" : "scoring…"}</span>
          </article>
          <article className={styles.trend} data-score={t >= 2.9 ? "low" : "pending"}>
            <span className={styles.trendName}>Meme coin giveaway challenge</span>
            <span className={styles.score}>{t >= 2.9 ? "31 · reject" : "scoring…"}</span>
          </article>
          <article className={styles.trend} data-score={t >= 3.5 ? "mid" : "pending"}>
            <span className={styles.trendName}>Peso slips past 58 per dollar</span>
            <span className={styles.score}>{t >= 3.5 ? "64 · review" : "scoring…"}</span>
          </article>
        </section>

        <section className={styles.script} data-in={t >= 4.4}>
          <div className={styles.colTitle}>Script · v1</div>
          <ul>
            {SCRIPT.slice(0, scriptLines).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>

        <section className={styles.critic} data-in={t >= 8.6}>
          <div className={styles.colTitle}>Critic · independent pass</div>
          <ul>
            {CHECKS.map((c, i) => (
              <li key={c} data-ok={i < checks}>
                <i>{i < checks ? "✓" : "·"}</i> {c}
              </li>
            ))}
          </ul>
          <span className={styles.approved} data-in={t >= 11.6}>
            Approved by admin
          </span>
        </section>

        <section className={styles.schedule} data-in={t >= 11.9}>
          <div className={styles.colTitle}>Scheduled · Thu 7:00 PM</div>
          <div className={styles.platforms}>
            {["Facebook", "Instagram Reels", "YouTube Shorts"].map((p, i) => (
              <span key={p} data-in={t >= 12.2 + i * 0.35}>
                {p}
              </span>
            ))}
          </div>
          <span className={styles.note}>TikTok: manual upload, by design</span>
        </section>
      </div>
    </div>
  );
}
