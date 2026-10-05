"use client";

/**
 * The home stage, in three phases on one sticky screen:
 *
 *   welcome — the bench shot loops behind the name. Scrolling slides the copy up
 *             and away while the picture stays.
 *   film    — the moment the copy is gone the one-shot film plays (sea → rooftops →
 *             window → desk → monitor). Its first frame matches the welcome shot, so
 *             it reads as one take. The page holds still while it runs; Skip or Esc
 *             ends it early. It plays once per visit.
 *   desk    — the film's last frame holds; the work is projected onto the monitor's
 *             screen (lib/homography) as a live desktop.
 *
 * "still" mode (reduced motion, data saver, Pause motion): no autoplay, no film —
 * the welcome poster, then straight to the desk.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useCinematic } from "@/hooks/useCinematic";
import { coverTransform, mapQuad, rectToQuadMatrix, toCssMatrix3d, type Quad } from "@/lib/homography";
import theatre from "@/content/theatre.json";
import { Desktop, type DesktopProps } from "./Desktop";
import styles from "./Theatre.module.css";

type Phase = "welcome" | "film" | "desk";

export const DESK_W = 1280;
export const DESK_H = 736;
const SEEN_KEY = "ns-film-seen";
const MONITOR = theatre.monitor as Quad;

export function Theatre(props: DesktopProps) {
  const { mode, ready, lenis, soundOn } = useCinematic();
  const stageRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLVideoElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("welcome");
  const [desk, setDesk] = useState<{ fit: "mapped" | "panel"; matrix: string }>({ fit: "panel", matrix: "none" });
  const phaseRef = useRef<Phase>("welcome");
  phaseRef.current = phase;

  const animated = ready && mode !== "still";
  const mobile = mode === "lite";

  // ── Scroll lock while the film runs ──
  const lock = useCallback(
    (on: boolean) => {
      document.documentElement.style.overflow = on ? "hidden" : "";
      if (on) lenis?.stop();
      else lenis?.start();
    },
    [lenis],
  );

  const toDesk = useCallback(() => {
    filmRef.current?.pause();
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setPhase("desk");
    lock(false);
  }, [lock]);

  const playFilm = useCallback(() => {
    const film = filmRef.current;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (!animated || !film || seen) {
      setPhase("desk");
      return;
    }
    setPhase("film");
    lock(true);
    film.currentTime = 0;
    film.muted = !soundOn;
    // A play() interrupted by loading (AbortError) is retried once the film can
    // play; anything else (autoplay refused, decode error) falls back to the desk.
    film.play().catch((err: DOMException) => {
      if (err?.name !== "AbortError") return toDesk();
      film.addEventListener("canplay", () => film.play().catch(() => toDesk()), { once: true });
    });
  }, [animated, lock, soundOn, toDesk]);

  // ── Phase from scroll position ──
  useEffect(() => {
    let leaving = false;
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const p = phaseRef.current;
      if (p === "welcome" && y > vh * 0.04 && !leaving) {
        // The first scroll intent carries the copy away, then the film rolls.
        leaving = true;
        const done = () => {
          leaving = false;
          playFilm();
        };
        if (lenis && animated) lenis.scrollTo(vh, { duration: 1, lock: true, force: true, onComplete: done });
        else {
          window.scrollTo({ top: vh, behavior: animated ? "smooth" : "auto" });
          window.setTimeout(done, animated ? 700 : 0);
        }
      } else if (p === "desk" && y < vh * 0.5) {
        setPhase("welcome");
      }
    };
    // Arriving mid-page (refresh, back button): go straight to the desk.
    if (window.scrollY >= window.innerHeight * 0.5) setPhase("desk");
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [animated, lenis, playFilm]);

  // ── Skip: button, Esc, or the HUD "Work" link ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phaseRef.current === "film") toDesk();
    };
    const onGo = () => {
      if (phaseRef.current === "film") return toDesk();
      const vh = window.innerHeight;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      if (lenis) lenis.scrollTo(vh, { duration: 1, force: true });
      else window.scrollTo({ top: vh, behavior: "smooth" });
    };
    // The keyboard skip link targets #desk.
    const onHash = () => {
      if (location.hash === "#desk") onGo();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("ns:work", onGo);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ns:work", onGo);
      window.removeEventListener("hashchange", onHash);
    };
  }, [lenis, toDesk]);

  // ── Sound follows the toggle ──
  useEffect(() => {
    if (welcomeRef.current) welcomeRef.current.muted = !soundOn;
    if (filmRef.current) filmRef.current.muted = !soundOn;
  }, [soundOn, phase]);

  // The welcome loop only runs while it is on screen.
  useEffect(() => {
    const v = welcomeRef.current;
    if (!v) return;
    if (phase === "welcome") v.play().catch(() => {});
    else v.pause();
  }, [phase, animated]);

  // Start fetching the film once the page is idle, so it is ready by the first scroll.
  useEffect(() => {
    if (!animated) return;
    const id = window.setTimeout(() => {
      const film = filmRef.current;
      // Only kick off loading if nothing has started it yet — load() aborts a pending play().
      if (!film || phaseRef.current !== "welcome" || film.readyState > 0) return;
      film.preload = "auto";
      film.load();
    }, 1200);
    return () => window.clearTimeout(id);
  }, [animated]);

  // ── Project the desktop onto the monitor, or show it as a panel on tall screens ──
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const compute = () => {
      const { width, height } = stage.getBoundingClientRect();
      const t = coverTransform(theatre.frame.width, theatre.frame.height, width, height);
      const quad = mapQuad(MONITOR, t);
      const visible = quad.every(([x, y]) => x >= -2 && y >= -2 && x <= width + 2 && y <= height + 2);
      const wide = width / height >= 1.25;
      if (visible && wide) setDesk({ fit: "mapped", matrix: toCssMatrix3d(rectToQuadMatrix(DESK_W, DESK_H, quad)) });
      else setDesk({ fit: "panel", matrix: "none" });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const welcomeSrc = mobile ? theatre.welcome.srcMobile : theatre.welcome.src;
  const filmSrc = mobile ? theatre.film.srcMobile : theatre.film.src;

  return (
    <section className={styles.theatre} data-phase={phase} aria-label="Welcome and work">
      <div className={styles.stage} ref={stageRef}>
        {/* Welcome: poster first (LCP), then the loop. */}
        <picture>
          <source media="(max-width: 899px)" srcSet={theatre.welcome.posterMobile} />
          <img className={`${styles.layer} ${styles.welcome}`} src={theatre.welcome.poster} alt="" fetchPriority="high" />
        </picture>
        {animated && (
          <video
            ref={welcomeRef}
            className={`${styles.layer} ${styles.welcome}`}
            src={welcomeSrc}
            poster={mobile ? theatre.welcome.posterMobile : theatre.welcome.poster}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-hidden="true"
          />
        )}

        {/* The film. */}
        {animated && (
          <video
            ref={filmRef}
            className={`${styles.layer} ${styles.film}`}
            src={filmSrc}
            poster={theatre.film.first}
            muted
            playsInline
            preload="none"
            onEnded={toDesk}
            aria-label="A single shot from the seawall over the sea and rooftops, through a lit window, to Jeon sitting down at his desk."
          />
        )}

        {/* The desk: the film's last frame holds under the live desktop. */}
        <img className={`${styles.layer} ${styles.deskPlate}`} src={theatre.film.last} alt="" loading="lazy" />
        <div className={styles.deskShade} aria-hidden="true" />
        <div
          id="desk"
          className={styles.desktopWrap}
          data-fit={desk.fit}
          style={(desk.fit === "mapped" ? { width: DESK_W, height: DESK_H, transform: desk.matrix } : {}) as CSSProperties}
          inert={phase !== "desk"}
        >
          <Desktop {...props} />
        </div>

        {phase === "film" && (
          <button type="button" className={styles.skip} onClick={toDesk}>
            Skip
          </button>
        )}
      </div>

      {/* The welcome copy scrolls away over the sticky picture. */}
      <div className={styles.copy}>
        <div className={styles.copyInner}>
          <h1 className={`display ${styles.name}`}>
            <span>Loreto “Jeon”</span>
            <span>Saquilabon Jr.</span>
          </h1>
          <p className={styles.role}>Full-stack developer &amp; automation engineer</p>
          <p className={styles.line}>Systems for businesses everywhere, built in Lapu-Lapu City after dark.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => window.dispatchEvent(new Event("ns:work"))}>
              See the work
            </button>
            <button type="button" className={styles.ghost} onClick={() => window.dispatchEvent(new CustomEvent("ns:open", { detail: "contact" }))}>
              Get in touch
            </button>
          </div>
        </div>
        <p className={styles.cue} aria-hidden="true">
          Scroll
        </p>
      </div>
    </section>
  );
}
