"use client";

/**
 * One project on the monitor: the client's problem as the headline, what changed
 * under it, and the product in a framed window whose spotlights light one at a
 * time (all at once in still mode). "How does it work?" opens the full case.
 */

import Link from "next/link";
import { useEffect, useState, ViewTransition } from "react";
import { screenTransitionName } from "@/lib/transition";
import type { ScreenItem } from "./Screen";
import { Spotlights } from "./Spotlights";
import styles from "./ProjectScene.module.css";

interface Props {
  item: ScreenItem;
  trackTitle: string;
  still: boolean;
  hasNext: boolean;
  onNext: () => void;
  onExplore: () => void;
}

export function ProjectScene({ item, trackTitle, still, hasNext, onNext, onExplore }: Props) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const count = item.spotlights.length;

  useEffect(() => {
    setActive(0);
    setHeld(false);
  }, [item.slug]);

  useEffect(() => {
    if (still || held || count < 2) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % count), 2600);
    return () => window.clearInterval(id);
  }, [still, held, count]);

  return (
    <article className={styles.scene} aria-label={item.title} data-screen-view data-lenis-prevent>
      <div className={styles.copy}>
        <p className={styles.kicker}>
          {trackTitle} · {item.title}
        </p>
        <h2 className={styles.problem}>{item.problem}</h2>
        <p className={styles.outcome}>{item.outcome}</p>
        {item.classified && <p className={styles.nda}>Client work under NDA — names withheld.</p>}
        {count > 0 && (
          <ul className={styles.spots} aria-label="What to look at">
            {item.spotlights.map((s, i) => (
              <li key={s.feature}>
                <button
                  type="button"
                  aria-pressed={still || active === i}
                  onClick={() => {
                    setActive(i);
                    setHeld(true);
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.actions}>
          <Link href={`/work/${item.slug}`} scroll={false} className={styles.primary}>
            How does it work?
          </Link>
          {hasNext && (
            <button type="button" className={styles.ghost} onClick={onNext}>
              Another example
            </button>
          )}
          <button type="button" className={styles.ghost} onClick={onExplore}>
            All work
          </button>
        </div>
      </div>

      <figure className={styles.window}>
        <ViewTransition name={screenTransitionName(item.slug)} share="screen-morph" default="none">
          <div className={styles.frame}>
            <img src={item.poster} alt={`${item.title} — interface`} decoding="async" />
            <Spotlights spots={item.spotlights} active={still ? "all" : count ? active : null} />
            {item.classified && <span className={styles.privacy} aria-hidden="true" />}
          </div>
        </ViewTransition>
      </figure>
    </article>
  );
}
