"use client";

/**
 * What a monitor shows: the project's real UI (poster, or a muted loop in full
 * mode), wrapped in a named <ViewTransition> so clicking it match-cuts into the
 * case study hero with the same name. Classified screens sit behind a privacy
 * filter that only lifts (partially) when the screen is faced head-on — hover or focus.
 */

import { ViewTransition } from "react";
import { useCinematic } from "@/hooks/useCinematic";
import { screenTransitionName } from "@/lib/transition";
import styles from "./Screen.module.css";

export interface ScreenItem {
  slug: string;
  title: string;
  logline: string;
  poster: string;
  loop?: string;
  classified: boolean;
}

export function ScreenContent({ item }: { item: ScreenItem }) {
  const { mode, ready } = useCinematic();
  const playLoop = Boolean(item.loop) && ready && mode === "full";

  return (
    <ViewTransition name={screenTransitionName(item.slug)} share="screen-morph" default="none">
      <div className={styles.content} data-classified={item.classified}>
        {playLoop ? (
          <video
            className={styles.media}
            src={item.loop}
            poster={item.poster}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            aria-hidden="true"
          />
        ) : (
          <img className={styles.media} src={item.poster} alt="" loading="lazy" decoding="async" />
        )}
        {item.classified && <div className={styles.privacy} aria-hidden="true" />}
        <div className={styles.glass} aria-hidden="true" />
      </div>
    </ViewTransition>
  );
}
