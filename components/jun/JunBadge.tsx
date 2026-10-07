"use client";

/**
 * The AI twin's badge: at rest, only a glowing microphone in the bottom-right corner.
 * Once a minute the ring appears around it, mini Jeon rises out of the ring, waves (the
 * stacked-alpha clip), sinks back, and the ring fades, leaving the microphone. The ring is drawn in two halves,
 * back behind him and front in front of him, and he is clipped below the ring's centre
 * line, so he appears to come up out of an opening.
 *
 * No wave in still mode, while the tab is hidden, or during a call. If the clip cannot
 * play (iOS Low Power Mode refuses even muted video), the rest frame stays and the
 * wave is skipped; the microphone still says what a tap does.
 */

import { useEffect, useRef, useState } from "react";
import { attachStackedVideo } from "./stackedAlpha";
import styles from "./JunBadge.module.css";

export const WAVE_EVERY_MS = 60_000;
/** The first wave, a few seconds after the desk appears. */
const FIRST_WAVE_MS = 4_000;
/** He sinks back this long after the clip ends. */
const SETTLE_MS = 600;

export interface JunBadgeProps {
  still: boolean;
  calling: boolean;
  level: "idle" | "listening" | "speaking";
  onTap: () => void;
}

export function JunBadge({ still, calling, level, onTap }: JunBadgeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [up, setUp] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const quiet = still || calling;
  const quietRef = useRef(quiet);
  quietRef.current = quiet;

  // Join the clip's frames onto the canvas.
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (still || !video || !canvas) return;
    const detach = attachStackedVideo(video, canvas);
    const onDrawn = () => setDrawn(true);
    video.addEventListener("loadeddata", onDrawn, { once: true });
    return () => {
      detach();
      video.removeEventListener("loadeddata", onDrawn);
    };
  }, [still]);

  // The wave: on a timer, never while quiet or hidden.
  useEffect(() => {
    if (still) return;
    const video = videoRef.current;
    if (!video) return;
    let settle = 0;
    const wave = () => {
      if (quietRef.current || document.hidden || !video.paused) return;
      video.currentTime = 0;
      video
        .play()
        .then(() => setUp(true))
        .catch(() => {});
    };
    const onEnded = () => {
      settle = window.setTimeout(() => {
        setUp(false);
        video.currentTime = 0;
      }, SETTLE_MS);
    };
    video.addEventListener("ended", onEnded);
    const first = window.setTimeout(wave, FIRST_WAVE_MS);
    const every = window.setInterval(wave, WAVE_EVERY_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
      window.clearTimeout(settle);
      video.removeEventListener("ended", onEnded);
    };
  }, [still]);

  // A call starting mid-wave: sink back at once.
  useEffect(() => {
    if (!calling) return;
    videoRef.current?.pause();
    setUp(false);
  }, [calling]);

  return (
    <button
      type="button"
      className={styles.badge}
      data-up={up}
      data-level={level}
      data-still={still}
      onClick={onTap}
      aria-label="Talk to Jeon's AI twin"
      data-jun-badge
    >
      <svg className={styles.ring} viewBox="0 0 240 250" aria-hidden="true">
        <defs>
          <linearGradient id="jun-ring" x1="0" x2="1">
            <stop offset="0" stopColor="#2d6bff" />
            <stop offset=".5" stopColor="#9fd8ff" />
            <stop offset="1" stopColor="#2d6bff" />
          </linearGradient>
          <radialGradient id="jun-floor">
            <stop offset="0" stopColor="#3b82ff" stopOpacity=".45" />
            <stop offset="1" stopColor="#3b82ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="120" cy="208" rx="104" ry="26" fill="url(#jun-floor)" />
        <path className={styles.back} d="M16 208 A104 26 0 0 1 224 208" />
      </svg>

      <span className={styles.figure} aria-hidden="true">
        <img className={styles.person} src="/media/jun/rest.webp" alt="" width={320} height={298} data-hidden={drawn && !still} />
        {!still && <canvas ref={canvasRef} className={styles.person} width={320} height={298} />}
      </span>

      <svg className={styles.ring} viewBox="0 0 240 250" aria-hidden="true">
        <path className={styles.front} data-ring-front d="M16 208 A104 26 0 0 0 224 208" />
      </svg>

      <span className={styles.mic} aria-hidden="true" data-jun-mic>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
      </span>

      {!still && <video ref={videoRef} className={styles.source} src="/media/jun/wave.mp4" muted playsInline preload="auto" aria-hidden="true" />}
    </button>
  );
}
