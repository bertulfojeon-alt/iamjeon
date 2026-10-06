/**
 * Amber markers over a screen image, each with a short label. Positions are
 * percentages of the image, so they hold at any size; a marker in the right part
 * of the image puts its label on its left. Decorative: the same labels are always
 * listed as text next to the image.
 */

import type { Spot } from "./Screen";
import styles from "./Spotlights.module.css";

export function Spotlights({ spots, active }: { spots: Spot[]; active: number | "all" | null }) {
  return (
    <div className={styles.layer} aria-hidden="true">
      {spots.map((s, i) => (
        <span
          key={s.feature}
          className={styles.spot}
          data-on={active === "all" || active === i}
          data-side={s.x > 60 ? "left" : "right"}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          <span className={styles.label}>{s.label}</span>
        </span>
      ))}
    </div>
  );
}
