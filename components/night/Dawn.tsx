"use client";

/**
 * Dawn — the camera pulls back out of the window as the sky warms. The dawn
 * palette appears here for the first time on the site: the work happens at night;
 * the next project starts at sunrise.
 */

import { SequenceScene } from "@/features/cinematic-engine/SequenceScene";
import { dawnScene } from "@/content/night";
import styles from "./Dawn.module.css";

const EMAIL = "bertulfojeon@gmail.com";

export function Dawn() {
  return (
    <div id="contact" className={styles.dawn}>
      <SequenceScene
        scene={dawnScene}
        overlayContent={{
          contact: (
            <div className={styles.card}>
              <h2 className={`display ${styles.title}`}>Let&rsquo;s build something.</h2>
              <p className={styles.lead}>
                A platform, an AI agent, an automation that gives your team its evenings back — or a walkthrough of
                anything on those screens. Freelance and full-time.
              </p>
              <div className={styles.actions}>
                <a className={styles.primary} href={`mailto:${EMAIL}?subject=Project%20enquiry`}>
                  {EMAIL}
                </a>
                <a className={styles.secondary} href="tel:+639684333479">
                  +63 968 4333 479
                </a>
                <a className={styles.secondary} href="/IamjeonResume.pdf" target="_blank" rel="noopener">
                  Résumé (PDF)
                </a>
              </div>
            </div>
          ),
        }}
      >
        <div className={styles.warmth} aria-hidden="true" />
      </SequenceScene>
      <footer className={styles.footer}>
        <div className="wrap">
          <span>© {new Date().getFullYear()} Loreto Saquilabon Jr. · Lapu-Lapu City, Cebu</span>
          <span>Rendered on Project Genesis, a cinematic engine I built.</span>
        </div>
      </footer>
    </div>
  );
}
