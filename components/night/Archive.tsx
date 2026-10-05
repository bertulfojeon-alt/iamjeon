/**
 * The side desk — smaller and earlier work, as a fast, readable list. No footage,
 * no scrubbing: a deliberate pause in the rhythm after the wall.
 */

import type { Project } from "@/content/schema";
import { STATUS_LABEL } from "@/components/case/labels";
import styles from "./Archive.module.css";

export function Archive({ projects }: { projects: Project[] }) {
  return (
    <section id="archive" className={styles.archive} aria-labelledby="archive-title">
      <div className="wrap">
        <header className={styles.head}>
          <h2 id="archive-title" className={`display ${styles.title}`}>
            The side desk
          </h2>
          <p className="dim">Experiments, tools and earlier builds. Each one taught something the bigger systems use.</p>
        </header>
        <ul className={styles.list}>
          {projects.map((p) => {
            const primary = p.links[0];
            return (
              <li key={p.slug} className={styles.row}>
                <div className={styles.name}>
                  <h3>{p.title}</h3>
                  <span className={styles.status} data-status={p.status}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <div className={styles.what}>
                  <p className={styles.logline}>{p.logline}</p>
                  {p.features.length > 0 && (
                    <ul className={styles.features}>
                      {p.features.slice(0, 4).map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className={styles.stack}>{p.stack.slice(0, 5).join(" · ")}</p>
                <div className={styles.links}>
                  {primary ? (
                    <a href={primary.href} target="_blank" rel="noopener" className={styles.link}>
                      {primary.label} ↗
                    </a>
                  ) : (
                    <span className="dim">Walkthrough on request</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
