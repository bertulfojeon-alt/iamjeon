"use client";

/**
 * The home stage, in three phases on one sticky screen:
 *
 *   welcome — the bench shot loops behind the name. Scrolling slides the copy up
 *             and away while the picture stays.
 *   film    — the moment the copy is gone the one-shot film plays (sea → rooftops →
 *             window → desk → monitor). Its first frame matches the welcome shot, so
 *             it reads as one take. The page holds still while it runs; Skip or Esc
 *             ends it early. It plays every time the visitor scrolls down from the
 *             welcome; "See the work" and the HUD "Work" link go straight to the desk.
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
import { Screen, type ScreenProps } from "@/components/screen/Screen";
import styles from "./Theatre.module.css";

type Phase = "welcome" | "film" | "desk";

export const DESK_W = 1280;
export const DESK_H = 736;
const MONITOR = theatre.monitor as Quad;
// True until the stage first mounts after a full page load; client navigations back home keep their place.
let firstMount = true;

export function Theatre(props: ScreenProps) {
  const { mode, ready, lenis, soundOn } = useCinematic();
  const stageRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLVideoElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("welcome");
  const [desk, setDesk] = useState<{ fit: "mapped" | "panel"; matrix: string }>({ fit: "panel", matrix: "none" });
  // Heavy media waits until the page has painted: the poster (same frame) shows
  // first, so the video and desk images never compete with the fonts and LCP.
  const [mediaReady, setMediaReady] = useState(false);
  const [deskReady, setDeskReady] = useState(false);
  const phaseRef = useRef<Phase>("welcome");
  phaseRef.current = phase;
  const skipFilmRef = useRef(false); // the next trip to the desk skips the film

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
    setPhase("desk");
    lock(false);
  }, [lock]);

  const playFilm = useCallback(() => {
    const film = filmRef.current;
    const skip = skipFilmRef.current;
    skipFilmRef.current = false;
    if (!animated || !film || skip) {
      setPhase("desk");
      return;
    }
    setPhase("film");
    lock(true);
    film.currentTime = 0;
    film.muted = !soundOn;
    // A play() interrupted by loading (AbortError) is retried once the film can
    // play; refused with sound (NotAllowedError) it retries muted; anything else
    // (decode error) falls back to the desk.
    film.play().catch((err: DOMException) => {
      if (err?.name === "AbortError") {
        film.addEventListener("canplay", () => film.play().catch(() => toDesk()), { once: true });
      } else if (err?.name === "NotAllowedError" && !film.muted) {
        film.muted = true;
        film.play().catch(() => toDesk());
      } else toDesk();
    });
  }, [animated, lock, soundOn, toDesk]);

  // ── A refresh (or Back into the site from elsewhere) opens on the welcome ──
  // The browser restores the old scroll position while the page loads; until it
  // has loaded, the page is held at the top and no scroll starts the film.
  // (Turning history.scrollRestoration off instead breaks some client navigations.)
  const pinnedRef = useRef(false);
  useEffect(() => {
    if (!firstMount) return;
    firstMount = false;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (location.hash || (nav?.type !== "reload" && nav?.type !== "back_forward")) return;
    pinnedRef.current = true;
    window.scrollTo(0, 0);
    let timer = 0;
    const release = () => {
      timer = window.setTimeout(() => {
        window.scrollTo(0, 0);
        pinnedRef.current = false;
      }, 300);
    };
    if (document.readyState === "complete") release();
    else window.addEventListener("load", release, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", release);
      pinnedRef.current = false;
    };
  }, []);

  // ── Phase from scroll position and direction ──
  const movingRef = useRef(false); // a glide is running (kept across re-subscriptions)
  useEffect(() => {
    let lastY = window.scrollY;
    // Only the visitor's own scroll-up (wheel, swipe, keys) heads back to the welcome —
    // not the small scrolls the browser makes to reveal a focused element.
    let upIntentAt = -Infinity;
    let touchY = 0;
    const markUp = () => (upIntentAt = performance.now());
    const onWheel = (e: WheelEvent) => e.deltaY < 0 && markUp();
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0]?.clientY ?? 0);
    const onTouchMove = (e: TouchEvent) => (e.touches[0]?.clientY ?? 0) > touchY + 4 && markUp();
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "Home" || (e.key === " " && e.shiftKey)) markUp();
    };
    const glide = (top: number, done: () => void) => {
      movingRef.current = true;
      const end = () => {
        movingRef.current = false;
        lastY = window.scrollY;
        done();
      };
      if (lenis && animated) lenis.scrollTo(top, { duration: 1, lock: true, force: true, onComplete: end });
      else {
        window.scrollTo({ top, behavior: animated ? "smooth" : "auto" });
        window.setTimeout(end, animated ? 700 : 0);
      }
    };
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const down = y > lastY;
      lastY = y;
      if (pinnedRef.current) {
        if (y) window.scrollTo(0, 0);
        lastY = 0;
        return;
      }
      if (movingRef.current) return;
      const p = phaseRef.current;
      if (p === "welcome" && down && y > vh * 0.04) {
        // The first scroll down carries the copy away, then the film rolls.
        glide(vh, playFilm);
      } else if (p === "desk" && !down && y < vh * 0.92 && performance.now() - upIntentAt < 600) {
        // Scrolling back up returns to the bench; the copy slides back in.
        skipFilmRef.current = false;
        setPhase("welcome");
        glide(0, () => {});
      }
    };
    if (!pinnedRef.current && !movingRef.current) {
      const y = window.scrollY;
      const vh = window.innerHeight;
      // Arriving mid-page (back button within the site): go straight to the desk.
      if (y >= vh * 0.5) setPhase("desk");
      // Scrolled before this listener was attached (a fast first scroll while the page hydrates).
      else if (phaseRef.current === "welcome" && y > vh * 0.04) glide(vh, playFilm);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyUp);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyUp);
    };
  }, [animated, lenis, playFilm]);

  // ── Skip: button, Esc, or the HUD "Work" link ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phaseRef.current === "film") toDesk();
    };
    const onGo = () => {
      if (phaseRef.current === "film") return toDesk();
      const vh = window.innerHeight;
      if (phaseRef.current === "welcome") skipFilmRef.current = true;
      if (lenis) lenis.scrollTo(vh, { duration: 1, force: true });
      else window.scrollTo({ top: vh, behavior: "smooth" });
    };
    // The keyboard skip link targets #desk.
    const onHash = () => {
      if (location.hash === "#desk" || location.hash === "#main-content") onGo();
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

  useEffect(() => {
    const go = () => {
      const idle = (window as typeof window & { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
      if (idle) idle(() => setMediaReady(true), { timeout: 2500 });
      else window.setTimeout(() => setMediaReady(true), 600);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  // Desk images load once the visitor heads there (or the page is idle long after load).
  useEffect(() => {
    if (phase !== "welcome") setDeskReady(true);
  }, [phase]);
  useEffect(() => {
    if (!mediaReady) return;
    const id = window.setTimeout(() => setDeskReady(true), 6000);
    return () => window.clearTimeout(id);
  }, [mediaReady]);

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

  // Start fetching the film once the page has loaded and gone idle, so it is
  // ready by the first scroll without competing with first paint.
  useEffect(() => {
    if (!animated || !mediaReady) return;
    const id = window.setTimeout(() => {
      const film = filmRef.current;
      // Only kick off loading if nothing has started it yet — load() aborts a pending play().
      if (!film || phaseRef.current !== "welcome" || film.readyState > 0) return;
      film.preload = "auto";
      film.load();
    }, 800);
    return () => window.clearTimeout(id);
  }, [animated, mediaReady]);

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
        {animated && mediaReady && (
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
          <Screen {...props} ready={deskReady} />
        </div>

        {phase === "film" && (
          <button type="button" className={styles.skip} onClick={toDesk}>
            Skip
          </button>
        )}
      </div>

      {/* Target of the "Skip to the work" link; the hash handler takes it to the desk. */}
      <span id="main-content" className="sr-only" tabIndex={-1} />

      {/* The welcome copy scrolls away over the sticky picture. */}
      <div className={styles.copy} inert={phase !== "welcome"}>
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
