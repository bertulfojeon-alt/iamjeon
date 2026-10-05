"use client";

/**
 * The monitor wall — the work index.
 *
 * Full mode: the room footage's final frame is the backdrop; up to six live
 * screens are projected onto its monitors (lib/homography). Scrolling through the
 * section steps through chapters like changing channels; the tabs jump directly.
 * Hover or focus puts a subtitle under the wall.
 *
 * Lite / still mode (and before hydration): the same projects as a stacked,
 * fully accessible list grouped by chapter.
 */

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useCinematic } from "@/hooks/useCinematic";
import { coverTransform, mapQuad, rectToQuadMatrix, toCssMatrix3d, type Quad } from "@/lib/homography";
import room from "@/content/room.json";
import { ScreenContent, type ScreenItem } from "./Screen";
import { WarmTitle } from "@/components/ui/WarmTitle";
import styles from "./MonitorWall.module.css";

export interface WallChapter {
  id: string;
  title: string;
  items: ScreenItem[];
}

const SCREEN_W = 640;
const SCREEN_H = 400;
const MONITORS = room.monitors as Quad[];

export function MonitorWall({ chapters }: { chapters: WallChapter[] }) {
  const { mode, ready } = useCinematic();
  const showWall = ready && mode === "full";
  return showWall ? <Wall chapters={chapters} /> : <StackedWall chapters={chapters} />;
}

function Wall({ chapters }: { chapters: WallChapter[] }) {
  const { lenis } = useCinematic();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [matrices, setMatrices] = useState<string[]>([]);
  const [caption, setCaption] = useState<ScreenItem | null>(null);

  // Project each screen onto its monitor; recompute whenever the stage resizes.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const compute = () => {
      const { width, height } = stage.getBoundingClientRect();
      const t = coverTransform(room.plate.width, room.plate.height, width, height);
      setMatrices(MONITORS.map((q) => toCssMatrix3d(rectToQuadMatrix(SCREEN_W, SCREEN_H, mapQuad(q, t)))));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // Scroll position → chapter.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const i = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
        setActive((prev) => (prev === i ? prev : i));
      },
    });
    // The wall continues straight from the room shot's last frame (the plate itself):
    // tucked under it, it only shows once that shot has finished.
    const reveal = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      toggleClass: { targets: section, className: "is-on" },
    });
    return () => {
      st.kill();
      reveal.kill();
    };
  }, [chapters.length]);

  const jumpTo = useCallback(
    (i: number) => {
      const section = sectionRef.current;
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = section.offsetHeight - window.innerHeight;
      const y = top + ((i + 0.5) / chapters.length) * travel;
      if (lenis) lenis.scrollTo(y, { duration: 1.2 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    },
    [chapters.length, lenis],
  );

  const chapter = chapters[active];

  return (
    <section
      id="work"
      ref={sectionRef}
      className={`${styles.wall} scene--chained`}
      style={{ "--chapters": chapters.length } as React.CSSProperties}
      aria-label="Work — the monitor wall"
    >
      <div className={`${styles.stage} scene-stage`} ref={stageRef}>
        <img className={styles.plate} src={room.plate.src} alt="" aria-hidden="true" />

        <div className={styles.screens}>
          {MONITORS.map((_, slot) => {
            const item = chapter.items[slot];
            return (
              <div
                key={slot}
                className={styles.slot}
                style={{ width: SCREEN_W, height: SCREEN_H, transform: matrices[slot] ?? "scale(0)" }}
              >
                {item ? (
                  <Link
                    key={`${chapter.id}-${item.slug}`}
                    href={`/work/${item.slug}`}
                    transitionTypes={["nav-forward"]}
                    className={styles.screenLink}
                    aria-label={`${item.title}${item.classified ? " (classified)" : ""} — ${item.logline}`}
                    onMouseEnter={() => setCaption(item)}
                    onMouseLeave={() => setCaption(null)}
                    onFocus={() => setCaption(item)}
                    onBlur={() => setCaption(null)}
                  >
                    <div className={styles.powerOn}>
                      <ScreenContent item={item} />
                    </div>
                  </Link>
                ) : (
                  <div className={styles.off} aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.chrome}>
          <div className={styles.head}>
            <WarmTitle as="h2" className={styles.chapterTitle} relightKey={chapter.id}>
              {chapter.title}
            </WarmTitle>
            <div className={styles.tabs} role="group" aria-label="Chapters">
              {chapters.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className={styles.tab}
                  aria-pressed={i === active}
                  onClick={() => jumpTo(i)}
                >
                  {c.title}
                  <span className={styles.count}>{c.items.length}</span>
                </button>
              ))}
            </div>
          </div>
          <p className={styles.caption} aria-live="polite">
            {caption ? (
              <>
                <strong>{caption.title}</strong> — {caption.logline}
              </>
            ) : (
              <span className="dim">Hover a screen, or tab through them. Click to step inside.</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function StackedWall({ chapters }: { chapters: WallChapter[] }) {
  return (
    <section id="work" className={styles.stacked} aria-label="Work">
      <div className="wrap">
        {chapters.map((c) => (
          <div key={c.id} className={styles.stackChapter}>
            <WarmTitle as="h2" className={styles.stackTitle}>
              {c.title}
            </WarmTitle>
            <ul className={styles.stackGrid}>
              {c.items.map((item) => (
                <li key={item.slug}>
                  <Link href={`/work/${item.slug}`} transitionTypes={["nav-forward"]} className={styles.card}>
                    <div className={styles.cardScreen}>
                      <ScreenContent item={item} />
                    </div>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardLine}>{item.logline}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
