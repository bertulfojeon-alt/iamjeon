"use client";

/**
 * The work as a film's chapter menu: business problems down the left, each with
 * its projects; the hovered or focused project plays large on the right. Fits the
 * monitor without scrolling. Click (or Enter) opens the project's scene.
 */

import { useState } from "react";
import { TRACKS, TRACK_LINES, TRACK_TITLES } from "@/content/tracks";
import type { ScreenItem } from "./Screen";
import styles from "./ExploreMenu.module.css";

interface Props {
  items: ScreenItem[];
  focus: string;
  ready: boolean;
  onFocus: (slug: string) => void;
  onOpen: (slug: string) => void;
}

export function ExploreMenu({ items, focus, ready, onFocus, onOpen }: Props) {
  const [playing, setPlaying] = useState(false);
  const current = items.find((i) => i.slug === focus) ?? items[0];

  return (
    <div className={styles.menu} data-screen-view data-lenis-prevent>
      <nav className={styles.list} aria-label="Work by business problem">
        {TRACKS.map((track) => {
          const group = items.filter((i) => i.track === track);
          if (!group.length) return null;
          return (
            <section key={track} className={styles.group}>
              <h2 className={styles.groupTitle}>{TRACK_TITLES[track]}</h2>
              <p className={styles.groupLine}>{TRACK_LINES[track]}</p>
              <ul>
                {group.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      className={styles.item}
                      aria-current={item.slug === current.slug ? "true" : undefined}
                      onMouseEnter={() => onFocus(item.slug)}
                      onFocus={() => onFocus(item.slug)}
                      onClick={() => onOpen(item.slug)}
                    >
                      {item.title}
                      {item.classified && <span className={styles.chip}>Under NDA</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </nav>

      <section className={styles.preview} aria-label="Preview" aria-live="polite">
        <button
          type="button"
          className={styles.frame}
          onClick={() => onOpen(current.slug)}
          onMouseEnter={() => setPlaying(true)}
          onMouseLeave={() => setPlaying(false)}
          aria-label={`Open ${current.title}`}
        >
          {playing && current.loop && !current.classified ? (
            <video key={current.slug} src={current.loop} poster={current.poster} muted loop playsInline autoPlay aria-hidden="true" />
          ) : ready ? (
            <img key={current.slug} src={current.poster} alt="" decoding="async" />
          ) : null}
          {current.classified && <span className={styles.privacy} aria-hidden="true" />}
        </button>
        <h3 className={styles.title}>{current.title}</h3>
        <p className={styles.problem}>{current.problem}</p>
        <p className={styles.outcome}>{current.outcome}</p>
      </section>
    </div>
  );
}
