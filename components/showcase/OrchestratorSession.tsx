"use client";

/**
 * A coded presentation of claude-orchestrator (a Claude Code plugin — it has no
 * screen of its own, only a terminal). Shows only what is built: the session-start
 * brief from the live repo, the ~60-token standards re-injected each turn, a role
 * agent inheriting the session's model instead of downgrading, the eval harness's
 * per-skill verdicts, and a hook that times out and fails open. ~16 s loop.
 */

import { useLoopClock } from "./useLoopClock";
import styles from "./OrchestratorSession.module.css";

const LOOP = 16;

type Row = { at: number; kind: "cmd" | "hook" | "ok" | "warn" | "dim"; text: string };

const ROWS: Row[] = [
  { at: 0.3, kind: "cmd", text: "$ claude" },
  { at: 1.0, kind: "hook", text: "session-start · brief from the live repo" },
  { at: 1.5, kind: "dim", text: "  branch feature/invoices · 3 changed files" },
  { at: 1.9, kind: "dim", text: "  recent: fix rounding in tax totals · add CSV export" },
  { at: 3.2, kind: "cmd", text: "> add a refund endpoint with tests" },
  { at: 3.8, kind: "hook", text: "turn · working standards re-injected (≈60 tokens)" },
  { at: 5.6, kind: "hook", text: "agent · test-writer spawned" },
  { at: 6.1, kind: "ok", text: "  model inherited from session, no silent downgrade" },
  { at: 8.6, kind: "hook", text: "hook · lint-check timed out after 2.0 s" },
  { at: 9.1, kind: "warn", text: "  failed open, session continues" },
];

const EVALS = [
  { skill: "brief", verdict: "keep" },
  { skill: "standards", verdict: "keep" },
  { skill: "deep-research", verdict: "experimental" },
  { skill: "auto-summary", verdict: "cut" },
];

export function OrchestratorSession() {
  const t = useLoopClock(LOOP, 14);
  const fading = t >= LOOP - 0.6;

  return (
    <div
      className={styles.stage}
      data-fading={fading}
      role="img"
      aria-label="Demo: a Claude Code session starts with a brief from the live repo, re-injects short working standards each turn, spawns a role agent that keeps the session's model, fails open when a hook times out, and shows eval verdicts per skill."
    >
      <section className={styles.term}>
        <div className={styles.bar}>
          <i />
          <i />
          <i />
          <span>~/projects/invoicing</span>
        </div>
        <div className={styles.body}>
          {ROWS.filter((r) => t >= r.at).map((r) => (
            <p key={r.at} className={styles.row} data-kind={r.kind}>
              {r.text}
            </p>
          ))}
          <span className={styles.cursor} />
        </div>
      </section>

      <section className={styles.evals} data-in={t >= 10.6}>
        <p className={styles.evalsHead}>Eval harness · per-skill verdicts</p>
        <ul>
          {EVALS.map((e, i) => (
            <li key={e.skill} data-in={t >= 11 + i * 0.5}>
              <span>{e.skill}</span>
              <strong data-verdict={e.verdict}>{e.verdict}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
