"use client";

/** "…answering your calls." typed and retyped like the laptop in the shot. Static in still mode. */

import { useEffect, useState } from "react";
import styles from "./Welcome.module.css";

const PHRASES = ["answering your calls.", "placing your trades.", "running your payroll."];
const SENTENCE = "…answering your calls, placing your trades, running your payroll.";

export function RotatingLine({ still }: { still: boolean }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (still) return;
    const full = PHRASES[i];
    const done = !erasing && n === full.length;
    const t = window.setTimeout(
      () => {
        if (!erasing && n < full.length) setN(n + 1);
        else if (!erasing) setErasing(true);
        else if (n > 0) setN(n - 1);
        else {
          setErasing(false);
          setI((i + 1) % PHRASES.length);
        }
      },
      done ? 1800 : erasing ? 28 : 55,
    );
    return () => window.clearTimeout(t);
  }, [i, n, erasing, still]);

  return (
    <p className={styles.rotating}>
      <span className="sr-only">{SENTENCE}</span>
      <span aria-hidden="true">
        {still ? (
          SENTENCE
        ) : (
          <>
            …{PHRASES[i].slice(0, n)}
            <span className={styles.caret} />
          </>
        )}
      </span>
    </p>
  );
}
