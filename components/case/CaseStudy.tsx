/**
 * A case study told like a short film: cold open → context → the hard part → the
 * decision → the result → numbers → credits → next screen. Rendered both as a full
 * page (/work/[slug], for direct links and search) and inside the desk's modal.
 */

import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { CHAPTER_TITLES, nextProject } from "@/content";
import type { Project } from "@/content/schema";
import { STATUS_LABEL } from "@/components/case/labels";
import { RedactionStrip } from "@/components/case/RedactionStrip";
import { screenTransitionName } from "@/lib/transition";
import styles from "./CaseStudy.module.css";

const BEAT_LABEL = {
  context: "The situation",
  rising: "The hard part",
  decision: "The decision",
  resolution: "The result",
} as const;

const EMAIL = "bertulfojeon@gmail.com";

export function CaseStudy({ project: p, inModal = false }: { project: Project; inModal?: boolean }) {
  const next = nextProject(p.slug);
  const hero = p.coldOpen;
  return (
    <article className={styles.page} data-classified={p.redacted} data-in-modal={inModal}>
      <div className="wrap">
        {!inModal && (
          <Link href="/" transitionTypes={["nav-back"]} className={styles.back}>
            ← Back to the desk
          </Link>
        )}

        <header className={styles.head}>
          <p className={styles.kicker}>
            {CHAPTER_TITLES[p.chapter]} · {p.industry} · {p.year}
          </p>
          <h1 className={`display ${styles.title}`}>{p.title}</h1>
          <p className={styles.logline}>{p.logline}</p>
          <dl className={styles.meta}>
            <div>
              <dt>Role</dt>
              <dd>{p.role}</dd>
            </div>
            {p.client && (
              <div>
                <dt>Client</dt>
                <dd>{p.client}</dd>
              </div>
            )}
            <div>
              <dt>Status</dt>
              <dd data-status={p.status}>{STATUS_LABEL[p.status]}</dd>
            </div>
          </dl>
        </header>
      </div>

      <div className={styles.screenWrap}>
        <ViewTransition name={screenTransitionName(p.slug)} share="screen-morph" default="none">
          <figure className={styles.screen}>
            {hero ? (
              <Image
                src={hero.src}
                alt={hero.alt}
                width={hero.width}
                height={hero.height}
                priority
                sizes="(max-width: 1400px) 100vw, 1400px"
              />
            ) : (
              <img src={p.screen.poster} alt={`${p.title} — interface`} width={1280} height={800} />
            )}
            {p.redacted && <div className={styles.privacy} aria-hidden="true" />}
          </figure>
        </ViewTransition>
        {hero?.caption && <p className={styles.caption}>{hero.caption}</p>}
      </div>

      <div className="wrap">
        {p.redacted && <RedactionStrip codename={p.title} />}

        {p.beats.map((b, i) => (
          <section key={i} className={styles.beat} aria-labelledby={`beat-${i}`}>
            <p className={styles.beatKind}>{BEAT_LABEL[b.kind]}</p>
            <div className={styles.beatBody}>
              <h2 id={`beat-${i}`} className={styles.beatHeading}>
                {b.heading}
              </h2>
              {b.body.split(/\n\s*\n/).map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
            {b.media?.map((m) => (
              <figure key={m.src} className={styles.figure}>
                {m.type === "image" ? (
                  <Image src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="(max-width: 1240px) 100vw, 1240px" />
                ) : (
                  <video src={m.src} poster={m.poster} width={m.width} height={m.height} controls muted playsInline preload="none" />
                )}
                {m.caption && <figcaption>{m.caption}</figcaption>}
              </figure>
            ))}
          </section>
        ))}

        {p.features.length > 0 && (
          <section className={styles.features} aria-labelledby="features-title">
            <h2 id="features-title" className={styles.sectionTitle}>
              What it does
            </h2>
            <ul>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        {p.metrics.length > 0 && (
          <section className={styles.metrics} aria-labelledby="metrics-title">
            <h2 id="metrics-title" className={styles.sectionTitle}>
              By the numbers
            </h2>
            <dl>
              {p.metrics.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className={styles.credits} aria-labelledby="credits-title">
          <h2 id="credits-title" className={styles.sectionTitle}>
            Credits
          </h2>
          <p className={styles.stack}>{p.stack.join(" · ")}</p>
          <div className={styles.links}>
            {p.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener" className={styles.linkPrimary}>
                {l.label} ↗
              </a>
            ))}
            {p.redacted ? (
              <a
                className={styles.linkPrimary}
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Private screening — ${p.title}`)}`}
              >
                Request a private screening
              </a>
            ) : (
              <a
                className={styles.linkGhost}
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(`About ${p.title}`)}`}
              >
                Ask me about this build
              </a>
            )}
          </div>
        </section>
      </div>

      <Link href={`/work/${next.slug}`} scroll={false} className={styles.next}>
        <div className="wrap">
          <span className={styles.nextLabel}>Next screen</span>
          <span className={`display ${styles.nextTitle}`}>{next.title}</span>
          <span className={styles.nextLine}>{next.logline}</span>
        </div>
      </Link>
    </article>
  );
}
