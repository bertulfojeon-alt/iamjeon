"use client";

/**
 * A coded presentation of JelAI's correctness core (the app is an Android
 * prototype with no web build). Shows only what is built: a spoken answer comes in
 * as a messy transcript, it is normalised (filler words, Unicode minus), math.js —
 * not the model — decides, a wrong answer gets its specific mistake named, and a
 * garbled one comes back "unparseable" instead of a guess. ~16 s loop.
 */

import { useLoopClock } from "./useLoopClock";
import styles from "./TutorMathCheck.module.css";

const LOOP = 16;

const TRIALS = [
  {
    at: 0.6,
    heard: "um so x equals… minus three",
    clean: "x = −3",
    verdict: "correct" as const,
    note: "2(−3) + 6 = 0 ✓",
  },
  {
    at: 5.6,
    heard: "x equals three",
    clean: "x = 3",
    verdict: "mistake" as const,
    note: "Sign flipped when moving +6 across",
  },
  {
    at: 10.6,
    heard: "x is uh the [inaudible]",
    clean: "—",
    verdict: "unparseable" as const,
    note: "Asks again instead of guessing",
  },
];

export function TutorMathCheck() {
  const t = useLoopClock(LOOP, 9.6);
  const fading = t >= LOOP - 0.6;

  return (
    <div
      className={styles.stage}
      data-fading={fading}
      role="img"
      aria-label="Demo: a student's spoken answers to 2x + 6 = 0 are cleaned up and checked by a math engine. The right answer passes, a sign error is named, and a garbled answer is marked unparseable instead of guessed."
    >
      <section className={styles.phone}>
        <div className={styles.notch} />
        <p className={styles.task}>Solve for x</p>
        <p className={styles.problem}>2x + 6 = 0</p>
        <div className={styles.tutor}>
          <span className={styles.avatar}>A</span>
          <span className={styles.wave} data-on={t % 5 < 1.6}>
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={{ animationDelay: `${i * 0.06}s` }} />
            ))}
          </span>
        </div>
        <p className={styles.say}>Talk me through it. What is x?</p>
      </section>

      <section className={styles.core}>
        <p className={styles.coreHead}>Correctness core · math.js decides, not the model</p>
        {TRIALS.map((trial) => {
          const shown = t >= trial.at;
          const cleaned = t >= trial.at + 1.2;
          const decided = t >= trial.at + 2.4;
          return (
            <div key={trial.at} className={styles.trial} data-in={shown}>
              <p className={styles.heard}>
                <span>Heard</span> “{trial.heard}”
              </p>
              <p className={styles.clean} data-in={cleaned}>
                <span>Parsed</span> {trial.clean}
              </p>
              <p className={styles.verdict} data-in={decided} data-kind={trial.verdict}>
                {trial.verdict === "correct" ? "Correct" : trial.verdict === "mistake" ? "Not yet" : "Unparseable"}
                <span>{trial.note}</span>
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
