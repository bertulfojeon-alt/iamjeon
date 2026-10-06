"use client";

/**
 * "What it does": the product stays pinned while the features scroll past. The
 * feature crossing the middle of the screen is active; if it has a spotlight, the
 * marker lights on the pinned screen. Still mode shows every marker and no pin.
 */

import { useEffect, useRef, useState } from "react";
import { useCinematic } from "@/hooks/useCinematic";
import { Spotlights } from "@/components/screen/Spotlights";
import type { Spot } from "@/components/screen/Screen";
import styles from "./FeatureScenes.module.css";

interface Props {
  poster: string;
  title: string;
  features: string[];
  spotlights: Spot[];
  classified: boolean;
}

export function FeatureScenes({ poster, title, features, spotlights, classified }: Props) {
  const { mode, ready } = useCinematic();
  const still = ready && mode === "still";
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // Inside the monitor the case scrolls in its own box; on the page, the viewport.
    const root = items.current[0]?.closest<HTMLElement>("[data-case-scroll]") ?? null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { root, rootMargin: "-45% 0px -45% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [features.length]);

  const spot = spotlights.findIndex((s) => s.feature === features[active]);

  return (
    <section className={styles.scenes} aria-labelledby="features-title" data-still={still}>
      <h2 id="features-title" className={styles.title}>
        What it does
      </h2>
      <div className={styles.grid}>
        <figure className={styles.pinned}>
          <div className={styles.frame}>
            <img src={poster} alt={`${title} — interface`} loading="lazy" decoding="async" />
            <Spotlights spots={spotlights} active={still ? "all" : spot >= 0 ? spot : null} />
            {classified && <span className={styles.privacy} aria-hidden="true" />}
          </div>
        </figure>
        <ol className={styles.list}>
          {features.map((f, i) => (
            <li
              key={f}
              ref={(el) => {
                items.current[i] = el;
              }}
              data-index={i}
              data-active={!still && i === active}
            >
              {f}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
