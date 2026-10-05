"use client";

/**
 * The always-reachable controls: home, Work / About / Contact, résumé, Sound and
 * Pause motion. On the home page the links act on the desk (events); elsewhere
 * they lead home. Kept small and quiet — the picture is the interface.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCinematic } from "@/hooks/useCinematic";
import styles from "./Hud.module.css";

export function Hud() {
  const { motionPaused, setMotionPaused, soundOn, setSoundOn } = useCinematic();
  const home = usePathname() === "/";

  const act = (name: string, detail?: string) => () =>
    window.dispatchEvent(detail ? new CustomEvent(name, { detail }) : new Event(name));

  return (
    <header className={styles.hud}>
      <Link href="/" className={styles.brand} aria-label="Jeon — back to the start">
        <img src="/media/me/avatar-64.webp" alt="" width={32} height={32} className={styles.avatar} />
        <span>Jeon</span>
      </Link>
      <nav aria-label="Site" className={styles.nav}>
        {home ? (
          <>
            <button type="button" className={styles.link} onClick={act("ns:work")}>
              Work
            </button>
            <button type="button" className={styles.link} onClick={act("ns:open", "about")}>
              About
            </button>
            <button type="button" className={styles.link} onClick={act("ns:open", "contact")}>
              Contact
            </button>
          </>
        ) : (
          <Link href="/" className={styles.link}>
            Back to the desk
          </Link>
        )}
        <a href="/IamjeonResume.pdf" target="_blank" rel="noopener" className={styles.link}>
          Résumé
        </a>
        <button type="button" className={styles.toggle} aria-pressed={soundOn} onClick={() => setSoundOn(!soundOn)}>
          <span className={styles.dot} data-on={soundOn} aria-hidden="true" />
          <span>
            Sound<span className={styles.long}>{soundOn ? " on" : " off"}</span>
          </span>
        </button>
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={motionPaused}
          onClick={() => setMotionPaused(!motionPaused)}
        >
          <span className={styles.dot} data-on={!motionPaused} aria-hidden="true" />
          <span>
            {motionPaused ? "Play" : "Pause"}
            <span className={styles.long}> motion</span>
          </span>
        </button>
      </nav>
    </header>
  );
}
