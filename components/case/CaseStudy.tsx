/**
 * A case study told as scenes: the business problem and what changed → the product
 * → what it does (pinned screen, spotlights) → what changed in numbers → behind the
 * build → credits → next screen. Rendered as the full-screen takeover from the desk
 * and as a page for direct links.
 */

import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { CHAPTER_TITLES, nextProject } from "@/content";
import type { Project } from "@/content/schema";
import { STATUS_LABEL } from "@/components/case/labels";
import { RedactionStrip } from "@/components/case/RedactionStrip";
import { screenTransitionName } from "@/lib/transition";
import { SHOWCASES } from "@/components/showcase";
import { TRACK_TITLES } from "@/content/tracks";
import { FeatureScenes } from "./FeatureScenes";
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
  const Showcase = p.showcase ? SHOWCASES[p.showcase] : null;
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
            {p.pitch ? TRACK_TITLES[p.pitch.track] : CHAPTER_TITLES[p.chapter]} · {p.industry} · {p.year}
          </p>
          <h1 className={`display ${styles.title}`}>{p.title}</h1>
          {p.pitch ? (
            <div className={styles.pitch}>
              <p className={styles.problem}>{p.pitch.problem}</p>
              <p className={styles.outcome}>{p.pitch.outcome}</p>
            </div>
          ) : (
            <p className={styles.logline}>{p.logline}</p>
          )}
          <dl className={styles.meta}>
            <div>
              <dt>Status</dt>
              <dd data-status={p.status}>{STATUS_LABEL[p.status]}</dd>
            </div>
            {p.client && (
              <div>
                <dt>Client</dt>
                <dd>{p.client}</dd>
              </div>
            )}
          </dl>
        </header>
      </div>

      <div className={styles.screenWrap}>
        <ViewTransition name={screenTransitionName(p.slug)} share="screen-morph" default="none">
          <figure className={styles.screen}>
            {Showcase ? (
              <Showcase />
            ) : hero ? (
              <Image
                src={hero.src}
                alt={hero.alt}
                width={hero.width}
                height={hero.height}
                priority
                sizes="(max-width: 1400px) 100vw, 1400px"
              />
            ) : (
              <img src={p.screen.poster} alt={`${p.title} interface`} width={1280} height={800} />
            )}
            {p.redacted && <div className={styles.privacy} aria-hidden="true" />}
          </figure>
        </ViewTransition>
        {hero?.caption && <p className={styles.caption}>{hero.caption}</p>}
      </div>

      <div className="wrap">
        {p.redacted && <RedactionStrip codename={p.title} />}

        {p.features.length > 0 && (
          <FeatureScenes
            poster={p.screen.poster}
            title={p.title}
            features={p.features}
            spotlights={p.spotlights}
            classified={p.redacted}
          />
        )}

        {p.metrics.length > 0 && (
          <section className={styles.metrics} aria-labelledby="metrics-title">
            <h2 id="metrics-title" className={styles.sectionTitle}>
              What changed
            </h2>
            <dl>
              {p.metrics.map((m) => (
                <div key={m.label}>
                  <dd>{m.value}</dd>
                  <dt>{m.label}</dt>
                </div>
              ))}
            </dl>
          </section>
        )}

        {p.beats.length > 0 && (
          <section className={styles.story} aria-labelledby="story-title">
            <h2 id="story-title" className={styles.sectionTitle}>
              Behind the build
            </h2>
            {p.beats.map((b, i) => (
              <section key={i} className={styles.beat} aria-labelledby={`beat-${i}`}>
                <p className={styles.beatKind}>{BEAT_LABEL[b.kind]}</p>
                <div className={styles.beatBody}>
                  <h3 id={`beat-${i}`} className={styles.beatHeading}>
                    {b.heading}
                  </h3>
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
          </section>
        )}

        <section className={styles.credits} aria-labelledby="credits-title">
          <h2 id="credits-title" className={styles.sectionTitle}>
            Credits
          </h2>
          <p className={styles.role}>
            <span>Role</span> {p.role}
          </p>
          <ul className={styles.stack} aria-label="Built with">
            {p.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <div className={styles.links}>
            {p.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener" className={styles.linkPrimary}>
                {l.label} ↗
              </a>
            ))}
            {p.redacted ? (
              <a
                className={styles.linkPrimary}
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Private walkthrough: ${p.title}`)}`}
              >
                Request a private screening
              </a>
            ) : (
              <a
                className={styles.linkGhost}
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(`About ${p.title}`)}`}
              >
                Email me about a project like this
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
