"use client";

/**
 * Everything about one project, in the monitor's main pane, like a product
 * dashboard: the problem and result up top with a link to the live site, the
 * product's video, then sections the visitor scrolls through or jumps to with the
 * text buttons — Screens, Features, Numbers, Built with. The long write-up waits
 * behind "Read the story". The pane scrolls on its own inside the monitor.
 */

import { useEffect, useRef, useState } from "react";
import { SHOWCASES } from "@/components/showcase";
import type { ScreenItem, Shot } from "./Screen";
import { Spotlights } from "./Spotlights";
import styles from "./ProjectPane.module.css";


interface Props {
  item: ScreenItem;
  groupTitle: string;
  still: boolean;
  onZoom: (shot: Shot) => void;
}

export function ProjectPane({ item, groupTitle, still, onZoom }: Props) {
  const pane = useRef<HTMLElement>(null);
  const [spot, setSpot] = useState<number | null>(null);
  const [story, setStory] = useState(false);
  const Showcase = item.showcase ? SHOWCASES[item.showcase] : null;

  // A new project starts at the top, with the story closed.
  useEffect(() => {
    pane.current?.scrollTo(0, 0);
    setSpot(null);
    setStory(false);
  }, [item.slug]);

  const sections = [
    { id: "screens", label: "Screens", show: item.shots.length > 0 },
    { id: "features", label: "Features", show: item.features.length > 0 },
    { id: "numbers", label: "Numbers", show: item.metrics.length > 0 },
    { id: "built", label: "Built with", show: item.stack.length > 0 },
  ].filter((s) => s.show);

  // Scroll the pane itself (never the page) so the section sits under the sticky tabs.
  const jump = (id: string) => {
    const root = pane.current;
    const target = root?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!root || !target) return;
    const tabs = root.querySelector<HTMLElement>("[data-tabs]")?.offsetHeight ?? 0;
    root.scrollTo({ top: target.offsetTop - tabs - 8, behavior: still ? "auto" : "smooth" });
  };

  return (
    <section ref={pane} className={styles.pane} aria-label={item.title} data-screen-view data-lenis-prevent>
      <header className={styles.head}>
        <p className={styles.kicker}>
          {groupTitle} · {item.industry} · {item.year} · {item.status}
        </p>
        <h2 className={`display ${styles.title}`}>{item.title}</h2>
        <p className={styles.problem}>{item.problem}</p>
        {item.outcome && <p className={styles.outcome}>{item.outcome}</p>}
        <div className={styles.actions}>
          {item.live.map((l) => (
            <a key={l.href} className={styles.primary} href={l.href} target="_blank" rel="noopener">
              Visit live site ↗
            </a>
          ))}
          {item.classified && <p className={styles.nda}>Client work under NDA — names withheld; a live walkthrough is available.</p>}
        </div>
      </header>

      <figure className={styles.proof}>
        {Showcase ? (
          <Showcase />
        ) : item.loop && !still ? (
          <video key={item.slug} src={item.loop} poster={item.poster} muted loop playsInline autoPlay aria-hidden="true" />
        ) : (
          <img src={item.poster} alt={`${item.title} — interface`} decoding="async" />
        )}
        {item.classified && <span className={styles.privacy} aria-hidden="true" />}
      </figure>

      {sections.length > 0 && (
        <nav className={styles.tabs} aria-label="Sections" data-tabs>
          {sections.map((s) => (
            <button key={s.id} type="button" onClick={() => jump(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>
      )}

      {item.shots.length > 0 && (
        <section className={styles.section} aria-labelledby={`${item.slug}-screens`} data-section="screens">
          <h3 id={`${item.slug}-screens`}>Screens</h3>
          <ul className={styles.gallery}>
            {item.shots.map((shot) => (
              <li key={shot.src}>
                <button type="button" onClick={() => onZoom(shot)} aria-label={`Enlarge: ${shot.alt}`}>
                  <img src={shot.src} alt="" loading="lazy" decoding="async" />
                </button>
                {shot.caption && <p>{shot.caption}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {item.features.length > 0 && (
        <section className={styles.section} aria-labelledby={`${item.slug}-features`} data-section="features">
          <h3 id={`${item.slug}-features`}>Features</h3>
          <div className={styles.features}>
            {item.spotlights.length > 0 && (
              <div className={styles.featureShot}>
                <img src={item.poster} alt="" loading="lazy" decoding="async" />
                <Spotlights spots={item.spotlights} active={still ? "all" : spot} />
                {item.classified && <span className={styles.privacy} aria-hidden="true" />}
              </div>
            )}
            <ul className={styles.featureList}>
              {item.features.map((f) => {
                const i = item.spotlights.findIndex((s) => s.feature === f);
                return (
                  <li key={f}>
                    {i >= 0 ? (
                      <button type="button" aria-pressed={spot === i} onClick={() => setSpot(i)}>
                        {f}
                      </button>
                    ) : (
                      <span>{f}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {item.metrics.length > 0 && (
        <section className={styles.section} aria-labelledby={`${item.slug}-numbers`} data-section="numbers">
          <h3 id={`${item.slug}-numbers`}>Numbers</h3>
          <dl className={styles.metrics}>
            {item.metrics.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {item.stack.length > 0 && (
        <section className={styles.section} aria-labelledby={`${item.slug}-built`} data-section="built">
          <h3 id={`${item.slug}-built`}>Built with</h3>
          <p className={styles.role}>{item.role}</p>
          <ul className={styles.stack}>
            {item.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {item.story.length > 0 && (
        <section className={styles.section}>
          <button type="button" className={styles.storyToggle} aria-expanded={story} onClick={() => setStory(!story)}>
            {story ? "Hide the story" : "Read the story"}
          </button>
          {story && (
            <div className={styles.story}>
              {item.story.map((b) => (
                <article key={b.heading}>
                  <h4>{b.heading}</h4>
                  {b.body.split(/\n\s*\n/).map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className={styles.foot}>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => window.dispatchEvent(new CustomEvent("ns:open", { detail: "contact" }))}
        >
          {item.classified ? "Request a private walkthrough" : "Want something like this? Let's talk"}
        </button>
      </footer>
    </section>
  );
}
