"use client";

/**
 * The desktop on Jeon's monitor — the work index. Chapter tabs, one tile per
 * project (real screen; its loop plays on hover or focus), and a dock for About,
 * Contact, Side projects and the résumé. Tiles open the case study in a modal
 * (an intercepted /work/[slug] route); each tile and its modal hero share a view
 * transition name, so the screen grows into the modal.
 */

import Link from "next/link";
import { useEffect, useState, ViewTransition } from "react";
import { screenTransitionName } from "@/lib/transition";
import styles from "./Desktop.module.css";

export interface DeskItem {
  slug: string;
  title: string;
  logline: string;
  poster: string;
  loop?: string;
  classified: boolean;
  status: string;
}

export interface DeskChapter {
  id: string;
  title: string;
  items: DeskItem[];
}

export interface DesktopProps {
  chapters: DeskChapter[];
  sideCount: number;
}

function useLocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

const open = (what: string) => window.dispatchEvent(new CustomEvent("ns:open", { detail: what }));

export function Desktop({ chapters, sideCount }: DesktopProps) {
  const [active, setActive] = useState(0);
  const time = useLocalTime();
  const chapter = chapters[active];

  return (
    <div className={styles.desktop}>
      <header className={styles.bar}>
        <span className={styles.owner}>Jeon&rsquo;s desk</span>
        <div className={styles.tabs} role="tablist" aria-label="Chapters">
          {chapters.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={styles.tab}
              onClick={() => setActive(i)}
            >
              {c.title}
              <span className={styles.count}>{c.items.length}</span>
            </button>
          ))}
        </div>
        <span className={styles.clock} suppressHydrationWarning>
          {time && `${time} · Lapu-Lapu City`}
        </span>
      </header>

      <div className={styles.grid} role="tabpanel" aria-label={chapter.title} data-lenis-prevent>
        {chapter.items.map((item) => (
          <Tile key={`${chapter.id}-${item.slug}`} item={item} />
        ))}
      </div>

      <nav className={styles.dock} aria-label="More">
        <button type="button" className={styles.dockItem} onClick={() => open("about")}>
          <span className={styles.dockIcon} aria-hidden="true">
            ◐
          </span>
          About
        </button>
        <button type="button" className={styles.dockItem} onClick={() => open("side")}>
          <span className={styles.dockIcon} aria-hidden="true">
            ▤
          </span>
          Side projects <span className={styles.count}>{sideCount}</span>
        </button>
        <button type="button" className={styles.dockItem} onClick={() => open("contact")}>
          <span className={styles.dockIcon} aria-hidden="true">
            ✉
          </span>
          Contact
        </button>
        <a className={styles.dockItem} href="/IamjeonResume.pdf" target="_blank" rel="noopener">
          <span className={styles.dockIcon} aria-hidden="true">
            ↓
          </span>
          Résumé
        </a>
      </nav>
    </div>
  );
}

function Tile({ item }: { item: DeskItem }) {
  const [hot, setHot] = useState(false);
  return (
    <Link
      href={`/work/${item.slug}`}
      scroll={false}
      className={styles.tile}
      data-classified={item.classified}
      aria-label={`${item.title}${item.classified ? " (classified)" : ""} — ${item.logline}`}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
    >
      <ViewTransition name={screenTransitionName(item.slug)} share="screen-morph" default="none">
        <div className={styles.thumb}>
          {hot && item.loop && !item.classified ? (
            <video src={item.loop} poster={item.poster} muted loop playsInline autoPlay aria-hidden="true" />
          ) : (
            <img src={item.poster} alt="" loading="lazy" decoding="async" />
          )}
          {item.classified && <span className={styles.privacy} aria-hidden="true" />}
        </div>
      </ViewTransition>
      <span className={styles.tileTitle}>
        {item.title}
        {item.classified && <span className={styles.chip}>Classified</span>}
      </span>
      <span className={styles.tileLine}>{item.logline}</span>
    </Link>
  );
}
