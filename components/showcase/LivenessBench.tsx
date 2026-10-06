"use client";

/**
 * A coded presentation of PROJECT FACEGATE's liveness check (classified: neutral
 * palette, no name, an illustrated face — never a photo of a person). Shows only
 * what is built: a random challenge, landmark tracking, a logged pass for a live
 * face and a timed-out rejection for a photo held up to the camera. ~16 s loop.
 */

import { useLoopClock } from "./useLoopClock";
import styles from "./LivenessBench.module.css";

const LOOP = 16;

/** Eye openness 0..1 for the live trial: two blinks. */
function eyeOpen(t: number) {
  for (const b of [2.3, 3.3]) {
    const d = Math.abs(t - b);
    if (d < 0.18) return d / 0.18;
  }
  return 1;
}

function Face({ open, photo }: { open: number; photo: boolean }) {
  const ry = 5.5 * Math.max(0.08, open);
  return (
    <svg viewBox="0 0 120 150" className={styles.face} data-photo={photo} aria-hidden="true">
      <ellipse cx="60" cy="72" rx="40" ry="52" className={styles.skin} />
      <path d="M22 58 C 26 18, 94 18, 98 58 C 92 36, 30 34, 22 58 Z" className={styles.hair} />
      <ellipse cx="44" cy="70" rx="6.5" ry={photo ? 5.5 : ry} className={styles.eye} />
      <ellipse cx="76" cy="70" rx="6.5" ry={photo ? 5.5 : ry} className={styles.eye} />
      <path d="M60 76 L56 94 L63 94" className={styles.line} />
      <path d="M47 106 Q 60 114 73 106" className={styles.line} />
      {[
        [44, 70],
        [76, 70],
        [60, 92],
        [47, 106],
        [73, 106],
        [30, 80],
        [90, 80],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" className={styles.dot} />
      ))}
    </svg>
  );
}

export function LivenessBench() {
  const t = useLoopClock(LOOP, 14.6);
  const live = t < 6;
  const blinks = t >= 3.4 ? 2 : t >= 2.4 ? 1 : 0;
  const livePass = t >= 3.6;
  const turnLeft = Math.max(0, Math.min(1, (t - 6.6) / 4)); // timer for the photo trial
  const photoFail = t >= 10.6;
  const fading = t >= LOOP - 0.7;

  return (
    <div
      className={styles.stage}
      data-fading={fading}
      role="img"
      aria-label="Demo: a liveness check asks a live face to blink twice and passes it, then asks a photo held to the camera to turn left and rejects it when nothing moves."
    >
      <section className={styles.kiosk}>
        <div className={styles.kioskHead}>
          <span>Clock-in · liveness check</span>
          <span className={styles.tag} data-kind={live ? "live" : "photo"}>
            {live ? "Holding up: live face" : "Holding up: photo / screen"}
          </span>
        </div>
        <div className={styles.viewport}>
          <div className={styles.oval} data-state={live ? (livePass ? "pass" : "track") : photoFail ? "fail" : "track"}>
            <div className={styles.faceWrap} data-photo={!live}>
              <Face open={live ? eyeOpen(t) : 1} photo={!live} />
            </div>
          </div>
          {!live && (
            <svg className={styles.timer} viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="17" className={styles.timerTrack} />
              <circle cx="20" cy="20" r="17" className={styles.timerFill} style={{ strokeDashoffset: 106.8 * turnLeft }} />
            </svg>
          )}
        </div>
        <div className={styles.prompt} data-state={live ? (livePass ? "pass" : "ask") : photoFail ? "fail" : "ask"}>
          {live
            ? livePass
              ? "✓ Live face confirmed"
              : `Blink twice · ${blinks}/2`
            : photoFail
              ? "✗ No turn detected, rejected"
              : "Turn your head left"}
        </div>
      </section>

      <section className={styles.log}>
        <div className={styles.logHead}>Trial log</div>
        <ul>
          <li data-in={livePass}>
            <span className={styles.res} data-ok="true">
              Pass
            </span>
            <span>Live face · blink ×2</span>
            <span className={styles.dim}>1.3 s</span>
          </li>
          <li data-in={photoFail}>
            <span className={styles.res} data-ok="false">
              Reject
            </span>
            <span>Photo / screen · turn left</span>
            <span className={styles.dim}>timeout 4.0 s</span>
          </li>
        </ul>
        <div className={styles.crop} data-in={livePass}>
          <div className={styles.cropBox}>
            <Face open={1} photo={false} />
          </div>
          <div>
            <strong>Face crop for verification</strong>
            <span className={styles.dim}>112 × 112 · 3.8 KB · what verification would send</span>
          </div>
        </div>
        <div className={styles.summary} data-in={t >= 11.2}>
          <span>Live faces passed</span>
          <strong>1 / 1</strong>
          <span>Photos passed</span>
          <strong>0 / 1</strong>
        </div>
      </section>
    </div>
  );
}
