"use client";

/**
 * The always-reachable controls: home, chapter menu, Pause motion, résumé, and a
 * hairline showing how far into the night the visitor is. Kept small and quiet —
 * the footage is the interface.
 */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCinematic } from "@/hooks/useCinematic";
import styles from "./Hud.module.css";

const CHAPTERS = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Hud() {
  const { motionPaused, setMotionPaused } = useCinematic();
  const progressRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Scroll hairline — written straight to the DOM, no re-renders.
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <header className={styles.hud}>
      <Link href="/" className={styles.brand} aria-label="Jeon — back to the start">
        <img src="/media/me/avatar.png" alt="" width={32} height={32} className={styles.avatar} />
        <span>Jeon</span>
      </Link>
      <nav aria-label="Chapters" className={styles.nav}>
        {CHAPTERS.map((c) => (
          <Link key={c.href} href={c.href} className={styles.link}>
            {c.label}
          </Link>
        ))}
        <a href="/IamjeonResume.pdf" target="_blank" rel="noopener" className={styles.link}>
          Résumé
        </a>
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={motionPaused}
          onClick={() => setMotionPaused(!motionPaused)}
        >
          <span className={styles.dot} data-on={!motionPaused} aria-hidden="true" />
          {motionPaused ? "Play motion" : "Pause motion"}
        </button>
      </nav>
      <div className={styles.progress} ref={progressRef} aria-hidden="true" />
    </header>
  );
}
