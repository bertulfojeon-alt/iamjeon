"use client";

/**
 * The monitor's screen — light, like a bright display in a dark room. It shows
 * the work grouped by business problem, one project as a scene, or a panel. What
 * it shows is owned by the stage reducer, so the assistant (Phase 2) can drive the
 * same commands the buttons use.
 */

import { useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { initialStage, stageReducer, type Panel, type StageWorld } from "@/features/stage/stage";
import { TRACK_TITLES, type Track } from "@/content/tracks";
import { useCinematic } from "@/hooks/useCinematic";
import { ExploreMenu } from "./ExploreMenu";
import { ProjectScene } from "./ProjectScene";
import styles from "./Screen.module.css";

export type Spot = { feature: string; x: number; y: number; label: string };

export interface ScreenItem {
  slug: string;
  title: string;
  track: Track;
  problem: string;
  outcome: string;
  poster: string;
  loop?: string;
  classified: boolean;
  spotlights: Spot[];
}

export interface ScreenProps {
  items: ScreenItem[];
  about: ReactNode;
  side: ReactNode;
  /** Load preview images (false until the visitor heads for the desk). */
  ready?: boolean;
}

function useLocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });
    const tick = () => setTime(fmt.format(new Date()).replace(/ /g, " "));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

const openPanel = (panel: Panel) => window.dispatchEvent(new CustomEvent("ns:open", { detail: panel }));

export function Screen({ items, ready = true }: ScreenProps) {
  const { mode, ready: modeReady } = useCinematic();
  const still = modeReady && mode === "still";
  const world = useMemo<StageWorld>(
    () => ({ order: items.map((i) => i.slug), trackOf: Object.fromEntries(items.map((i) => [i.slug, i.track])) }),
    [items],
  );
  const reducer = useMemo(() => stageReducer(world), [world]);
  const [view, dispatch] = useReducer(reducer, world, initialStage);
  const time = useLocalTime();
  const bySlug = useMemo(() => new Map(items.map((i) => [i.slug, i])), [items]);

  const scene = view.kind === "scene" ? bySlug.get(view.slug) : undefined;
  const trackSize = (t: Track) => items.filter((i) => i.track === t).length;

  return (
    <div className={`screen-light ${styles.screen}`} data-screen>
      <header className={styles.bar}>
        <span className={styles.owner}>Jeon&rsquo;s desk</span>
        <nav className={styles.nav} aria-label="Screen">
          <button type="button" aria-current={view.kind === "explore" ? "page" : undefined} onClick={() => dispatch({ type: "explore" })}>
            All work
          </button>
          <button type="button" onClick={() => openPanel("about")}>
            About
          </button>
          <button type="button" onClick={() => openPanel("side")}>
            Side projects
          </button>
          <button type="button" onClick={() => openPanel("contact")}>
            Contact
          </button>
          <a href="/IamjeonResume.pdf" target="_blank" rel="noopener">
            Résumé
          </a>
        </nav>
        <span className={styles.clock} suppressHydrationWarning>
          {time && `${time} · Lapu-Lapu City`}
        </span>
      </header>

      <div className={styles.view}>
        {scene ? (
          <ProjectScene
            item={scene}
            trackTitle={TRACK_TITLES[scene.track]}
            still={still}
            hasNext={trackSize(scene.track) > 1}
            onNext={() => dispatch({ type: "next" })}
            onExplore={() => dispatch({ type: "explore" })}
          />
        ) : (
          <ExploreMenu
            items={items}
            focus={view.kind === "explore" ? view.focus : items[0].slug}
            ready={ready}
            onFocus={(slug) => dispatch({ type: "focus", slug })}
            onOpen={(slug) => dispatch({ type: "show", slug })}
          />
        )}
      </div>
    </div>
  );
}
