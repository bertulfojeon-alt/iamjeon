"use client";

/**
 * A coded presentation of Unified CX — the AI voice front desk that routes a
 * caller to the right company's agent. Fictional providers and caller, product
 * palette (dark, cyan glass). One ~16 s loop:
 *
 *   call in → the front desk asks which provider → the caller answers in Taglish →
 *   provider identified → handoff along the routing map → the company agent checks
 *   the outage list and books a callback → logged → reset.
 */

import { lineEnd, useLoopClock, wordsShown, type Line } from "./useLoopClock";
import styles from "./VoiceRouter.module.css";

const LOOP = 16;

const LINES: Line[] = [
  { who: "desk", at: 1.0, pace: 0.22, text: "Hello! Which provider are you calling about today?" },
  { who: "caller", at: 3.4, pace: 0.24, text: "Fibernet po — walang internet since kanina." },
  { who: "agent", at: 7.4, pace: 0.23, text: "This is Fibernet support. There's an outage in your area, fixed by 6 PM. Want a callback when it's back?" },
  { who: "caller", at: 12.0, pace: 0.24, text: "Yes, please." },
];

const PROVIDERS = [
  { name: "Fibernet", tag: "Fiber internet" },
  { name: "MetroCable", tag: "Cable TV" },
  { name: "IslaMobile", tag: "Mobile" },
];

const IDENTIFIED = 5.6;
const HANDOFF = 6.4;
const KB = 8.1;
const CALLBACK = 12.9;

const SPEAKER: Record<string, string> = { desk: "Front desk", caller: "Caller", agent: "Fibernet agent" };

export function VoiceRouter() {
  const t = useLoopClock(LOOP, 14.6);
  const speaking = LINES.find((l) => t >= l.at && t < lineEnd(l) + 0.3);
  const routed = t >= HANDOFF;
  const fading = t >= LOOP - 0.7;

  return (
    <div
      className={styles.stage}
      data-fading={fading}
      role="img"
      aria-label="Demo: an AI front desk answers a call, identifies the caller's provider, hands the call to that company's agent, which checks the outage list and books a callback."
    >
      <aside className={styles.call}>
        <div className={styles.head}>
          <span className={styles.live}>● Live · PSTN</span>
          <span className={styles.who}>{routed ? "Fibernet agent" : "Front desk"}</span>
        </div>
        <div className={styles.wave} data-active={Boolean(speaking)} data-who={speaking?.who ?? "none"}>
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${(i % 6) * 0.08}s` }} />
          ))}
        </div>
        <ol className={styles.transcript}>
          {LINES.filter((l) => t >= l.at)
            .slice(-3)
            .map((l) => (
              <li key={l.at} data-who={l.who}>
                <span className={styles.speaker}>{SPEAKER[l.who]}</span>
                {wordsShown(l, t)}
              </li>
            ))}
        </ol>
      </aside>

      <main className={styles.board}>
        <div className={styles.boardHead}>
          <span>Routing</span>
          <span className={styles.chip} data-in={t >= IDENTIFIED}>
            Provider identified · Fibernet
          </span>
        </div>

        <div className={styles.map}>
          <div className={styles.desk} data-active={!routed}>
            Front desk
          </div>
          <svg className={styles.lines} viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
            {PROVIDERS.map((p, i) => (
              <path
                key={p.name}
                d={`M0 30 C 40 30, 50 ${10 + i * 20}, 100 ${10 + i * 20}`}
                data-hot={routed && i === 0}
                className={styles.path}
              />
            ))}
          </svg>
          <ul className={styles.providers}>
            {PROVIDERS.map((p, i) => (
              <li key={p.name} data-hot={routed && i === 0}>
                <strong>{p.name}</strong>
                <span>{p.tag}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.cards}>
          <section className={styles.card} data-in={t >= KB}>
            <span className={styles.cardLabel}>Knowledge</span>
            <strong>Outage list · Area 4</strong>
            <span className={styles.ok}>Fix ETA 6:00 PM</span>
          </section>
          <section className={styles.card} data-in={t >= CALLBACK}>
            <span className={styles.cardLabel}>Callback</span>
            <strong>Today, 6:10 PM</strong>
            <span className={styles.ok}>Queued · caller&rsquo;s own number</span>
          </section>
        </div>
      </main>
    </div>
  );
}
