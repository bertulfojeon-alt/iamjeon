"use client";

/**
 * A coded presentation of EZVibe, shown instead of screenshots (the real app
 * opens on its sign-in screen). App design tokens, fictional accounts. One ~16 s
 * loop:
 *
 *   "Acme" profile tab starts Claude Code under its own accounts → switch to the
 *   "My SaaS" tab, git push goes out as a different GitHub identity while Acme's
 *   agent keeps working → cd into Acme's pinned folder from the wrong profile:
 *   warning bar, "Reopen in Acme" → Acme's agent finishes and waits: amber dot
 *   and a desktop notification → reset.
 */

import { useLoopClock } from "./useLoopClock";
import styles from "./EZVibeTerminal.module.css";

const LOOP = 16;

type Profile = { id: string; name: string; color: string; gh: string; folder: string };
const ACME: Profile = { id: "acme", name: "Acme", color: "#e5484d", gh: "acme-dev", folder: "F:\\acme-shop" };
const SAAS: Profile = { id: "saas", name: "My SaaS", color: "#ffb224", gh: "jeon-builds", folder: "F:\\my-saas" };
const NOTES: Profile = { id: "notes", name: "Freelance", color: "#3e63dd", gh: "jeon-freelance", folder: "F:\\clients" };

/** A typed command: starts at `at`, one character per `cps` seconds. */
function typed(text: string, at: number, t: number, cps = 0.045) {
  if (t < at) return "";
  return text.slice(0, Math.min(text.length, Math.floor((t - at) / cps) + 1));
}

export function EZVibeTerminal() {
  const t = useLoopClock(LOOP, 14.8);

  // Which tab is in front.
  const front = t < 4.2 ? "acme" : t < 10.6 ? "saas" : "acme";
  const profile = front === "acme" ? ACME : SAAS;
  const warning = t >= 8.6 && t < 10.6;
  const clicking = t >= 10.0 && t < 10.6;
  const reopened = t >= 10.6 && t < 12.6;
  // Acme's activity dot: working (green) while away, waiting (amber) at the end.
  const acmeDot = t >= 12.6 ? "waiting" : t >= 2.2 ? "working" : "idle";
  const notify = t >= 13.2;
  const fading = t >= LOOP - 0.7;

  return (
    <div
      className={styles.stage}
      data-fading={fading}
      role="img"
      aria-label="Demo: EZVibe tabs each run under their own profile. A push goes out under the right GitHub account, a wrong-profile folder triggers a warning with a one-click fix, and a background agent signals it is waiting."
    >
      <div className={styles.window}>
        {/* Merged title bar with profile-colored tabs */}
        <div className={styles.titlebar}>
          <span className={styles.logo}>EZ</span>
          {[ACME, SAAS, NOTES].map((p) => (
            <span key={p.id} className={styles.tab} data-active={front === p.id} style={{ "--tab": p.color } as React.CSSProperties}>
              <i
                className={styles.dot}
                data-state={p.id === "acme" ? acmeDot : p.id === "saas" && front === "saas" ? "working" : "idle"}
              />
              {p.name}
            </span>
          ))}
          <span className={styles.plus}>+</span>
        </div>

        {/* Wrong-profile warning */}
        <div className={styles.warning} data-in={warning}>
          <span>
            <b>F:\acme-shop</b> is pinned to <b style={{ color: ACME.color }}>Acme</b> — this tab is <b style={{ color: SAAS.color }}>My SaaS</b>.
          </span>
          <span className={styles.fix} data-press={clicking}>
            Reopen in Acme
          </span>
        </div>

        {/* Terminal */}
        <div className={styles.term} style={{ "--tab": profile.color } as React.CSSProperties}>
          {front === "acme" && t < 4.2 && (
            <>
              <p>
                <span className={styles.prompt}>PS F:\acme-shop&gt;</span> {typed("claude", 0.5, t)}
              </p>
              {t >= 1.3 && <p className={styles.out}>✻ Claude Code — signed in as dev@acme.example (Acme team)</p>}
              {t >= 1.9 && <p className={styles.out}>  Working on: checkout flow refactor…</p>}
              {t >= 2.6 && <p className={styles.dim}>  ◼◼◼◼◻◻ reading src/checkout/*.ts</p>}
            </>
          )}
          {front === "saas" && (
            <>
              <p>
                <span className={styles.prompt}>PS F:\my-saas&gt;</span> {typed("git push", 4.6, t)}
              </p>
              {t >= 5.3 && <p className={styles.out}>To github.com:jeon-builds/my-saas.git</p>}
              {t >= 5.7 && <p className={styles.ok}>  ✓ pushed main as jeon-builds &lt;jeon@my-saas.example&gt;</p>}
              {t >= 6.6 && (
                <p>
                  <span className={styles.prompt}>PS F:\my-saas&gt;</span> {typed("cd F:\\acme-shop", 6.8, t)}
                </p>
              )}
              {t >= 8.6 && <p className={styles.dim}>  Pinned folder detected.</p>}
            </>
          )}
          {front === "acme" && t >= 10.6 && (
            <>
              {reopened && <p className={styles.ok}>  ✓ Reopened in Acme — dev@acme.example, gh acme-dev</p>}
              <p>
                <span className={styles.prompt}>PS F:\acme-shop&gt;</span> {typed("claude --continue", 11.0, t)}
              </p>
              {t >= 12.0 && <p className={styles.out}>✻ Refactor ready. Apply the changes to 6 files? (y/n)</p>}
            </>
          )}
          <span className={styles.cursor} />
        </div>

        {/* Status bar: the active profile's identities */}
        <div className={styles.status} style={{ "--tab": profile.color } as React.CSSProperties}>
          <span className={styles.chip}>{profile.name}</span>
          <span>📌 {profile.folder}</span>
          <span>gh: {profile.gh}</span>
          <span>claude: {profile.id === "acme" ? "Acme team" : "personal"}</span>
          <span className={styles.statusRight}>Isolated · no shared tokens</span>
        </div>
      </div>

      <div className={styles.toast} data-in={notify}>
        <i className={styles.toastDot} />
        <div>
          <strong>Acme is waiting for you</strong>
          <span>Claude asked a question in a background tab</span>
        </div>
      </div>
    </div>
  );
}
