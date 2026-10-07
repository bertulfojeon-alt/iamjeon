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
import { Jun } from "@/features/jun/Jun";
import { Welcome } from "./Welcome";
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

  const [gestured, setGestured] = useState(false);
  const audible = soundOn && gestured;
  const animated = ready && mode !== "still";
  // Read when the film is due to start, not when the scroll that leads to it began: a swipe
  // in the first moments after load starts before the engine is ready and ends after.
  const animatedRef = useRef(animated);
  animatedRef.current = animated;
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;
  const filmApprovedRef = useRef(false);

  // ── A tap or key press: the only moment iOS lets a page start a video or turn its sound on ──
  // (a swipe's touchend is not one). Low Power Mode refuses even silent autoplay, so the tap
  // starts the welcome loop if it is still waiting, and plays the film for an instant, unseen,
  // which approves it for the scroll that will run it. Sound is switched on here too: a video
  // unmuted any other time is paused by iOS.
  useEffect(() => {
    const onTap = () => {
      setGestured(true);
      const welcome = welcomeRef.current;
      const film = filmRef.current;
      const atWelcome = phaseRef.current === "welcome";
      if (welcome && atWelcome && welcome.paused && animatedRef.current) welcome.play().catch(() => {});
      if (film && atWelcome && animatedRef.current && !filmApprovedRef.current) {
        filmApprovedRef.current = true;
        film.muted = true;
        film
          .play()
          .then(() => {
            if (phaseRef.current !== "welcome") return;
            film.pause();
            film.currentTime = 0;
          })
          .catch(() => (filmApprovedRef.current = false));
      }
      if (soundOnRef.current) {
        if (welcome) welcome.muted = false;
        if (film && !atWelcome) film.muted = false;
      }
    };
    const types = ["click", "keydown"] as const;
    types.forEach((t) => window.addEventListener(t, onTap, { passive: true }));
    return () => types.forEach((t) => window.removeEventListener(t, onTap));
  }, []);
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

  // The ref changes at once (scroll handlers read it before React re-renders), then the state.
  const go = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  // The desk holds the page as well (see below), so the film's lock carries straight over.
  const toDesk = useCallback(() => {
    filmRef.current?.pause();
    go("desk");
  }, [go]);

  const playFilm = useCallback(() => {
    // Only from the welcome: a second glide finishing late must not restart anything.
    if (phaseRef.current !== "welcome") return;
    const film = filmRef.current;
    const skip = skipFilmRef.current;
    skipFilmRef.current = false;
    if (!animatedRef.current || !film || skip) {
      go("desk");
      return;
    }
    go("film");
    lock(true);
    film.currentTime = 0;
    film.muted = !audible;
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
  }, [go, lock, audible, toDesk]);

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
    let released = false;
    const release = () => {
      if (released) return;
      timer = window.setTimeout(() => {
        if (released) return;
        released = true;
        window.scrollTo(0, 0);
        pinnedRef.current = false;
      }, 300);
    };
    // The visitor's own input ends the hold at once (the browser restores before anyone can scroll),
    // and a late load event must not snap them back to the top afterwards.
    const onInput = () => {
      released = true;
      window.clearTimeout(timer);
      window.removeEventListener("load", release);
      pinnedRef.current = false;
    };
    if (document.readyState === "complete") release();
    else window.addEventListener("load", release, { once: true });
    for (const type of ["wheel", "touchstart", "keydown"] as const) window.addEventListener(type, onInput, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", release);
      for (const type of ["wheel", "touchstart", "keydown"] as const) window.removeEventListener(type, onInput);
      pinnedRef.current = false;
    };
  }, []);

  // ── Phase from scroll position and direction ──
  const movingRef = useRef(false); // a glide is running (kept across re-subscriptions)
  const arrivedRef = useRef(false); // the on-arrival checks below have run (once per mount)
  useEffect(() => {
    let lastY = window.scrollY;
    const glide = (top: number, done: () => void) => {
      movingRef.current = true;
      let finished = false;
      let timer = 0;
      const end = () => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        movingRef.current = false;
        lastY = window.scrollY;
        done();
      };
      // Safari does not always report the end of a glide that starts at (or next to) its
      // target, so a timer guarantees it finishes.
      timer = window.setTimeout(end, animated ? 1250 : 60);
      if (Math.abs(window.scrollY - top) < 2) return end();
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
      // The first scroll down carries the copy away, then the film rolls. At the desk,
      // scrolling never heads back up (it would fight the dashboard's own scrolling):
      // the back-to-top button does that.
      if (p === "welcome" && down && y > vh * 0.04) glide(vh, playFilm);
    };
    if (!pinnedRef.current && !movingRef.current) {
      const y = window.scrollY;
      const vh = window.innerHeight;
      // Arriving mid-page (back button within the site): go straight to the desk. On arrival
      // only: a later re-subscription (the first click changing the sound) must not undo
      // Back to the top while it glides up.
      if (!arrivedRef.current && y >= vh * 0.5) setPhase("desk");
      // Scrolled before this listener was attached (a fast first scroll while the page hydrates).
      else if (phaseRef.current === "welcome" && y > vh * 0.04) glide(vh, playFilm);
    }
    arrivedRef.current = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [animated, lenis, playFilm]);

  // ── At the desk the page itself holds still: only the screen's own panels scroll, so
  //    no wheel or swipe outside them can slide the hero copy back over the monitor ──
  useEffect(() => {
    if (phase === "welcome") return;
    lock(true);
    // iOS Safari ignores overflow: hidden for touch scrolling, so whenever the page moves
    // during the film or at the desk it is put straight back (the end of the scroll range,
    // which is one screen down unless the browser's toolbars changed the viewport height).
    const hold = () => {
      if (phaseRef.current === "welcome" || movingRef.current) return;
      const target = Math.min(window.innerHeight, document.documentElement.scrollHeight - window.innerHeight);
      if (Math.abs(window.scrollY - target) > 1) window.scrollTo(0, target);
    };
    window.addEventListener("scroll", hold, { passive: true });
    return () => {
      window.removeEventListener("scroll", hold);
      lock(false);
    };
  }, [phase, lock]);

  // ── Back to the top: from the desk to the bench (and the home address) ──
  const toTop = useCallback(() => {
    skipFilmRef.current = false;
    lock(false);
    phaseRef.current = "welcome"; // the desk's hold lets go before React re-renders
    setPhase("welcome");
    if (window.location.pathname !== "/") window.history.pushState(null, "", "/");
    // The glide up counts as moving, so nothing reads it as a scroll on the way.
    movingRef.current = true;
    const end = () => (movingRef.current = false);
    window.setTimeout(end, animated ? 1250 : 60);
    if (lenis && animated) lenis.scrollTo(0, { duration: 1, lock: true, force: true, onComplete: end });
    else window.scrollTo({ top: 0, behavior: animated ? "smooth" : "auto" });
  }, [animated, lenis, lock]);

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
    // "See what I'd build for you": a scroll down from the welcome, which plays the film.
    const onPlay = () => {
      if (phaseRef.current !== "welcome") return;
      const vh = window.innerHeight;
      if (lenis) lenis.scrollTo(vh, { duration: 1, force: true });
      else window.scrollTo({ top: vh, behavior: "smooth" });
    };
    // About / Contact pressed before the desk: go there directly (no film).
    const onOpen = () => {
      if (phaseRef.current !== "desk") onGo();
    };
    // The keyboard skip link targets #desk.
    const onHash = () => {
      if (location.hash === "#desk" || location.hash === "#main-content") onGo();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("ns:work", onGo);
    window.addEventListener("ns:open", onOpen);
    window.addEventListener("ns:play", onPlay);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ns:work", onGo);
      window.removeEventListener("ns:open", onOpen);
      window.removeEventListener("ns:play", onPlay);
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

  // A film that stops making progress (a stalled connection) gives way to the desk
  // rather than leaving the visitor on a frozen frame.
  useEffect(() => {
    if (phase !== "film") return;
    let last = -1;
    let still = 0;
    const id = window.setInterval(() => {
      const film = filmRef.current;
      if (!film) return;
      still = film.currentTime === last ? still + 1 : 0;
      last = film.currentTime;
      if (still >= 8) toDesk();
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, toDesk]);

  // ── Sound off follows the toggle at once; sound on is switched inside the tap (above) ──
  useEffect(() => {
    if (audible) return;
    if (welcomeRef.current) welcomeRef.current.muted = true;
    if (filmRef.current) filmRef.current.muted = true;
  }, [audible, phase, mediaReady]);

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
    // On a slow connection the film is not fetched ahead (it still plays, from a cold start).
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    if (conn?.effectiveType && /(^|-)2g$|^3g$/.test(conn.effectiveType)) return;
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
      // Projected smaller than this, the screen's text is too small to read: use the panel.
      const xs = quad.map(([x]) => x);
      const readable = (Math.max(...xs) - Math.min(...xs)) / DESK_W >= 0.62;
      if (visible && wide && readable) setDesk({ fit: "mapped", matrix: toCssMatrix3d(rectToQuadMatrix(DESK_W, DESK_H, quad)) });
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
            onPlaying={(e) => (e.currentTarget.dataset.playing = "true")}
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
        {phase === "desk" && (
          <button type="button" className={styles.top} onClick={toTop} aria-label="Back to the top">
            ↑
          </button>
        )}
        {/* Jun lives at the desk only: never on the welcome, never during the film. */}
        {phase === "desk" && <Jun items={props.items} where="desk" />}
      </div>

      {/* Target of the "Skip to the work" link; the hash handler takes it to the desk. */}
      <span id="main-content" className="sr-only" tabIndex={-1} />

      {/* The welcome copy scrolls away over the sticky picture. */}
      <Welcome active={phase === "welcome"} />
    </section>
  );
}
