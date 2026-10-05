"use client";

/**
 * Midnight → the room. Three chained shots: each clip's last frame is the next
 * clip's first, so the three sticky scenes read as one unbroken camera move.
 */

import { SequenceScene } from "@/features/cinematic-engine/SequenceScene";
import { approachScene, seaScene, windowScene } from "@/content/night";
import styles from "./Journey.module.css";

interface JourneyProps {
  liveCount: number;
}

export function Journey({ liveCount }: JourneyProps) {
  return (
    <>
      <SequenceScene
        id="top"
        scene={seaScene}
        priority
        overlayContent={{
          title: (
            <div className={styles.title}>
              <h1 className={`display ${styles.name}`}>
                <span>Loreto “Jeon”</span>
                <span>Saquilabon Jr.</span>
              </h1>
              <p className={styles.role}>Full-stack developer &amp; automation engineer · Lapu-Lapu City, Cebu</p>
            </div>
          ),
          line: <p className={styles.line}>Systems for businesses everywhere, built in Cebu after dark.</p>,
        }}
      >
        <div className="scene-shade" />
      </SequenceScene>

      <SequenceScene
        scene={approachScene}
        overlayContent={{
          proof: (
            <ul className={styles.proof}>
              <li>
                <strong>{liveCount}</strong> systems live in production
              </li>
              <li>
                <strong>Trading · Voice AI · SaaS</strong> for clients and my own products
              </li>
              <li>
                <strong>Solo</strong> from first sketch to deployment
              </li>
            </ul>
          ),
        }}
      >
        <div className="scene-shade" />
      </SequenceScene>

      <SequenceScene
        scene={windowScene}
        overlayContent={{
          inside: <p className={styles.inside}>Every screen in this room is a system I built. Pick one.</p>,
        }}
      />
    </>
  );
}
