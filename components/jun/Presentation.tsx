"use client";

/**
 * Jun's presentation: a full-viewport light stage over the desk, one slide at a time,
 * changed by Jun as it speaks. Every slide is built from what the site already shows
 * (the same items the dashboard renders, classified ones with their masked screens),
 * so nothing appears here that is not on the site. The drama is the stage; the slide
 * itself stays flat and accurate.
 */

import { useEffect, useRef } from "react";
import type { ScreenItem } from "@/components/screen/Screen";
import { Spotlights } from "@/components/screen/Spotlights";
import { ABOUT_LEAD } from "@/content/about";
import { SERVICES } from "@/content/services";
import { GROUP_TITLES } from "@/content/tracks";
import type { PresentationState, Slide } from "@/features/jun/presentation";
import { EMAIL, VIBER, WHATSAPP, mailtoHref, viberHref, whatsappHref } from "@/lib/contact";
import styles from "./Presentation.module.css";

export interface PresentationProps {
  state: Extract<PresentationState, { open: true }>;
  items: ScreenItem[];
  still: boolean;
  subtitle: string;
  muted: boolean;
  onMute: () => void;
  onEnd: () => void;
  onClose: () => void;
}

function Hero({ item, still }: { item: ScreenItem; still: boolean }) {
  const loop = item.landing?.loop ?? item.loop;
  const poster = item.landing?.poster ?? item.poster;
  return (
    <div className={styles.hero}>
      <figure className={styles.window}>
        {loop && !still ? <video src={loop} poster={poster} muted loop autoPlay playsInline aria-hidden="true" /> : <img src={poster} alt={`${item.title} interface`} />}
      </figure>
      <div className={styles.copy}>
        <p className={styles.kicker}>{GROUP_TITLES[item.group]}</p>
        <h2 className={`display ${styles.heading}`}>{item.title}</h2>
        <p className={styles.problem}>{item.problem}</p>
        {item.outcome && <p className={styles.outcome}>{item.outcome}</p>}
      </div>
    </div>
  );
}

function Feature({ item, feature }: { item: ScreenItem; feature: string }) {
  const index = item.spotlights.findIndex((s) => s.feature === feature);
  const spot = item.spotlights[index];
  return (
    <div className={styles.feature}>
      <figure className={styles.window}>
        <div className={styles.spotFrame}>
          <img src={item.poster} alt={`${item.title} interface`} />
          <Spotlights spots={item.spotlights} active={index} />
        </div>
      </figure>
      <div className={styles.copy}>
        <p className={styles.kicker}>{item.title}</p>
        <h2 className={`display ${styles.heading}`} data-jun-feature>
          {spot?.label}
        </h2>
        <p className={styles.problem}>{feature}</p>
      </div>
    </div>
  );
}

function Numbers({ item }: { item: ScreenItem }) {
  return (
    <div className={styles.numbers}>
      <p className={styles.kicker}>{item.title}</p>
      <ul>
        {item.metrics.map((m) => (
          <li key={m.label}>
            <strong className="display">{m.value}</strong>
            <span>{m.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Screens({ item }: { item: ScreenItem }) {
  return (
    <div className={styles.screens}>
      <p className={styles.kicker}>{item.title}</p>
      <div className={styles.grid}>
        {item.shots.slice(0, 6).map((s) => (
          <img key={s.src} src={s.src} alt={s.alt} loading="lazy" />
        ))}
      </div>
    </div>
  );
}

function Stack({ item }: { item: ScreenItem }) {
  return (
    <div className={styles.stack}>
      <p className={styles.kicker}>{item.title}</p>
      <h2 className={`display ${styles.heading}`}>Built with</h2>
      <ul>
        {item.stack.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

function About() {
  return (
    <div className={styles.hero}>
      <figure className={styles.window}>
        <img src="/media/me/me-about.webp" alt="Loreto “Jeon” Saquilabon Jr. at his desk" />
      </figure>
      <div className={styles.copy}>
        <p className={styles.kicker}>Lapu-Lapu City, Cebu · clients in any time zone</p>
        <h2 className={`display ${styles.heading}`}>Jeon</h2>
        <p className={styles.problem}>{ABOUT_LEAD}</p>
        <ul className={styles.services}>
          {SERVICES.map((s) => (
            <li key={s.id}>{s.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Contact({ summary }: { summary?: string }) {
  return (
    <div className={styles.contact}>
      <h2 className={`display ${styles.heading}`}>Tell Jeon about it</h2>
      {summary && (
        <div className={styles.note} data-jun-note>
          <strong>Your note to Jeon</strong>
          <p>{summary}</p>
        </div>
      )}
      <div className={styles.links}>
        <a href={mailtoHref(summary)}>Email · {EMAIL}</a>
        <a href={whatsappHref(summary)} target="_blank" rel="noopener" data-jun-whatsapp>
          WhatsApp · {WHATSAPP.label}
        </a>
        <a href={viberHref()} onClick={() => summary && navigator.clipboard?.writeText(summary).catch(() => {})}>
          Viber · {VIBER.label}
        </a>
      </div>
    </div>
  );
}

function SlideView({ slide, items, still }: { slide: Slide; items: ScreenItem[]; still: boolean }) {
  if (slide.kind === "about") return <About />;
  if (slide.kind === "contact") return <Contact summary={slide.summary} />;
  const item = items.find((i) => i.slug === slide.slug);
  if (!item) return null;
  switch (slide.kind) {
    case "hero":
      return <Hero item={item} still={still} />;
    case "feature":
      return <Feature item={item} feature={slide.feature ?? ""} />;
    case "numbers":
      return <Numbers item={item} />;
    case "screens":
      return <Screens item={item} />;
    case "stack":
      return <Stack item={item} />;
  }
}

export function Presentation({ state, items, still, subtitle, muted, onMute, onEnd, onClose }: PresentationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const slide = state.slides[state.current];

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div ref={ref} className={`screen-light ${styles.stage}`} role="dialog" aria-modal="true" aria-label="Jeon's AI presentation" tabIndex={-1} data-still={still}>
      <header className={styles.top}>
        <span className={styles.who}>Jeon&rsquo;s AI twin</span>
        {state.slides.length > 1 && (
          <span className={styles.rail} aria-hidden="true">
            {state.slides.map((s, i) => (
              <i key={s.key} data-on={i === state.current} />
            ))}
          </span>
        )}
        <button type="button" className={styles.close} onClick={onClose}>
          Close
        </button>
      </header>

      <main className={styles.slideArea} data-lenis-prevent>
        {slide ? (
          <div key={slide.key} className={styles.slide} data-slide-kind={slide.kind}>
            <SlideView slide={slide} items={items} still={still} />
          </div>
        ) : (
          <p className={styles.waiting}>Getting the first slide ready…</p>
        )}
      </main>

      <footer className={styles.bottom}>
        <p className={styles.subtitle} aria-live="polite">
          {subtitle}
        </p>
        <button type="button" onClick={onMute} aria-pressed={muted}>
          {muted ? "Unmute" : "Mute"}
        </button>
        <button type="button" className={styles.endCall} onClick={onEnd}>
          End call
        </button>
      </footer>
    </div>
  );
}
