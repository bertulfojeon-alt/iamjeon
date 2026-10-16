"use client";

/**
 * What I build: the features a client can ask for, apart from the projects. A list
 * of capabilities on the left (a strip on phones) and the chosen one on the right:
 * what it does, what the client gets, the plain truth where it is not live
 * everywhere, a demo (a coded showcase or a real screen), and the projects that
 * prove it. "Ask me for this" opens Contact with the visitor's note filled in; where
 * the AI twin on this site is itself the example, the visitor can try it.
 * Only the chosen demo runs, so one showcase clock plays at a time.
 */

import { useState } from "react";
import { AI_PROMISE, CAPABILITIES, CAPABILITIES_LEAD } from "@/content/capabilities";
import { SHOWCASES } from "@/components/showcase";
import { STATUS_SHORT } from "@/components/case/labels";
import type { ScreenItem } from "./Screen";
import styles from "./CapabilitiesView.module.css";

const Svg = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const ARROW = "M5 12h13M13 6l6 6-6 6";
const MIC = "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3";
const SHIELD = "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6Z M9 12l2 2 4-4";

interface CapabilitiesViewProps {
  items: ScreenItem[];
  /** Load media (false until the visitor heads for the desk). */
  ready: boolean;
  onOpen: (slug: string) => void;
  onAsk: (note: string) => void;
  onTwin: () => void;
}

export function CapabilitiesView({ items, ready, onOpen, onAsk, onTwin }: CapabilitiesViewProps) {
  const [id, setId] = useState(CAPABILITIES[0].id);
  const c = CAPABILITIES.find((x) => x.id === id) ?? CAPABILITIES[0];
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  const proof = c.proof.map((slug) => bySlug.get(slug)).filter((i): i is ScreenItem => !!i);
  const showcaseId = c.demo.kind === "showcase" ? c.demo.id : null;
  const Showcase = showcaseId ? SHOWCASES[showcaseId] : null;
  // A coded demo is credited to the project it was made for, not the first proof.
  const demoOf = showcaseId ? items.find((i) => i.showcase === showcaseId) : undefined;
  const promise = AI_PROMISE.proof.map((slug) => bySlug.get(slug)).filter((i): i is ScreenItem => !!i);

  return (
    <section className={styles.build} aria-label="What I build" data-screen-view data-lenis-prevent>
      <header className={styles.head}>
        <p className={styles.kicker}>What I build</p>
        <h2 className={`display ${styles.title}`}>What I can build for you</h2>
        <p className={styles.lead}>{CAPABILITIES_LEAD}</p>
      </header>

      <div className={styles.body}>
        <nav className={styles.list} aria-label="Features">
          {CAPABILITIES.map((x) => (
            <button key={x.id} type="button" aria-pressed={x.id === c.id} onClick={() => setId(x.id)}>
              {x.title}
            </button>
          ))}
        </nav>

        <article className={styles.detail} aria-label={c.title}>
          <div className={styles.grid}>
            <div className={styles.copy}>
              <h3 className={`display ${styles.name}`}>{c.title}</h3>
              <p className={styles.line}>{c.line}</p>
              <ul className={styles.points}>
                {c.points.map((p) => (
                  <li key={p}>
                    <Svg d={CHECK} />
                    {p}
                  </li>
                ))}
              </ul>
              {c.note && <p className={styles.note}>{c.note}</p>}
              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={() => onAsk(c.ask)}>
                  Ask me for this
                  <Svg d={ARROW} />
                </button>
                {c.tryTwin && (
                  <button type="button" className={styles.ghost} onClick={onTwin}>
                    <Svg d={MIC} />
                    Try it: talk to my AI twin
                  </button>
                )}
              </div>
            </div>

            <figure className={styles.demo}>
              <div className={styles.frame}>
                {ready &&
                  (Showcase ? (
                    <Showcase key={c.id} />
                  ) : (
                    c.demo.kind === "image" && <img key={c.id} src={c.demo.src} alt={c.demo.alt} decoding="async" />
                  ))}
              </div>
              <figcaption>
                {c.demo.kind === "image" ? c.demo.caption : `A coded demo of ${demoOf?.title ?? "the product"}, with demo data.`}
              </figcaption>
            </figure>

            <div className={styles.proof}>
              <h4>Built in</h4>
              <ul>
                {proof.map((p) => (
                  <li key={p.slug}>
                    <a
                      href={`/work/${p.slug}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                        e.preventDefault();
                        onOpen(p.slug);
                      }}
                    >
                      <span className={styles.badge} data-live={p.statusKey === "live" || undefined}>
                        <i aria-hidden="true" />
                        {STATUS_SHORT[p.statusKey]}
                      </span>
                      {p.title}
                      {p.classified && <span className={styles.nda}>NDA</span>}
                      <Svg d={ARROW} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>

      <aside className={styles.promise} aria-label={AI_PROMISE.title}>
        <Svg d={SHIELD} />
        <div>
          <h3>{AI_PROMISE.title}</h3>
          <p>{AI_PROMISE.body}</p>
          <p className={styles.promiseProof}>
            Seen in{" "}
            {promise.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && (i === promise.length - 1 ? " and " : ", ")}
                <a
                  href={`/work/${p.slug}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    onOpen(p.slug);
                  }}
                >
                  {p.title}
                </a>
              </span>
            ))}
            .
          </p>
        </div>
      </aside>
    </section>
  );
}
