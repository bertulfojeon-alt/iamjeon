"use client";

/**
 * The monitor's screen — light, like a bright display in a dark room — laid out as
 * a project dashboard: every project in a side nav (grouped by the business
 * problem it solves, side projects last), and the selected one in full in the
 * main pane. Opening a project gives it its own address (/work/<slug>), so it can
 * be shared and Back steps through what was opened. What the screen shows is owned
 * by the stage reducer, so the assistant (Phase 2) can drive the same commands.
 */

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { initialStage, stageReducer, type Panel, type StageWorld } from "@/features/stage/stage";
import { GROUP_ORDER, GROUP_TITLES, type Group } from "@/content/tracks";
import type { ShowcaseId } from "@/components/showcase";
import { useCinematic } from "@/hooks/useCinematic";
import { clockLine } from "@/lib/clock";
import { ProjectPane } from "./ProjectPane";
import { ContactView } from "./ContactView";
import styles from "./Screen.module.css";

export type Spot = { feature: string; x: number; y: number; label: string };
export type Shot = { src: string; alt: string; caption?: string };

export interface ScreenItem {
  slug: string;
  title: string;
  group: Group;
  classified: boolean;
  /** The client's problem (or the logline for side projects) and what changed. */
  problem: string;
  outcome: string | null;
  industry: string;
  year: number;
  status: string;
  role: string;
  poster: string;
  loop?: string;
  showcase?: ShowcaseId;
  live: { label: string; href: string }[];
  shots: Shot[];
  features: string[];
  spotlights: Spot[];
  metrics: { value: string; label: string }[];
  stack: string[];
  story: { heading: string; body: string }[];
}

export interface ScreenProps {
  items: ScreenItem[];
  about: ReactNode;
  /** Load media (false until the visitor heads for the desk). */
  ready?: boolean;
}

function useLocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(clockLine(new Date()).here);
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export function Screen({ items, about, ready = true }: ScreenProps) {
  const { mode, ready: modeReady } = useCinematic();
  const still = modeReady && mode === "still";
  const world = useMemo<StageWorld>(() => ({ order: items.map((i) => i.slug) }), [items]);
  const reducer = useMemo(() => stageReducer(world), [world]);
  const [view, dispatch] = useReducer(reducer, world, initialStage);
  const [zoom, setZoom] = useState<Shot | null>(null);
  const time = useLocalTime();
  const pathname = usePathname();
  const bySlug = useMemo(() => new Map(items.map((i) => [i.slug, i])), [items]);

  // The address leads: Back/Forward (and a project link) select the project.
  useEffect(() => {
    const m = pathname.match(/^\/work\/([^/]+)$/);
    if (m) dispatch({ type: "show", slug: m[1] });
  }, [pathname]);

  // About / Contact, from the HUD or the welcome buttons.
  useEffect(() => {
    const onOpen = (e: Event) => dispatch({ type: "panel", panel: (e as CustomEvent<Panel>).detail });
    window.addEventListener("ns:open", onOpen);
    return () => window.removeEventListener("ns:open", onOpen);
  }, []);

  // Esc closes the enlarged screenshot.
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const open = (slug: string) => {
    dispatch({ type: "show", slug });
    if (window.location.pathname !== `/work/${slug}`) window.history.pushState(null, "", `/work/${slug}`);
  };

  const selected = view.kind === "project" ? view.slug : view.back;
  const item = bySlug.get(selected) ?? items[0];
  const panelCurrent = (panel: Panel) => (view.kind === "panel" && view.panel === panel ? "page" : undefined);

  return (
    <div className={`screen-light ${styles.screen}`} data-screen>
      <header className={styles.bar}>
        <span className={styles.owner}>Jeon&rsquo;s desk</span>
        <nav className={styles.nav} aria-label="Screen">
          <button type="button" aria-current={view.kind === "project" ? "page" : undefined} onClick={() => dispatch({ type: "back" })}>
            All work
          </button>
          <button type="button" aria-current={panelCurrent("about")} onClick={() => dispatch({ type: "panel", panel: "about" })}>
            About
          </button>
          <button type="button" aria-current={panelCurrent("contact")} onClick={() => dispatch({ type: "panel", panel: "contact" })}>
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
        {view.kind === "panel" ? (
          view.panel === "contact" ? (
            <ContactView />
          ) : (
            <section className={styles.panel} aria-label="About Jeon" data-screen-view data-lenis-prevent>
              {about}
            </section>
          )
        ) : (
          <div className={styles.dashboard}>
            <nav className={styles.side} aria-label="Projects" data-lenis-prevent>
              {GROUP_ORDER.map((group) => {
                const list = items.filter((i) => i.group === group);
                if (!list.length) return null;
                return (
                  <section key={group} className={styles.group}>
                    <h2 className={styles.groupTitle}>{GROUP_TITLES[group]}</h2>
                    <ul>
                      {list.map((i) => (
                        <li key={i.slug}>
                          <button
                            type="button"
                            className={styles.item}
                            aria-current={i.slug === item.slug ? "true" : undefined}
                            onClick={() => open(i.slug)}
                          >
                            {i.title}
                            {i.classified && <span className={styles.chip}>NDA</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </nav>
            {ready ? (
              <ProjectPane item={item} groupTitle={GROUP_TITLES[item.group]} still={still} onZoom={setZoom} />
            ) : (
              <div className={styles.paneWait} />
            )}
          </div>
        )}

        {zoom && (
          <div className={styles.zoom} role="dialog" aria-label={zoom.alt}>
            <button type="button" className={styles.zoomClose} onClick={() => setZoom(null)}>
              Close
            </button>
            <img src={zoom.src} alt={zoom.alt} />
            {zoom.caption && <p>{zoom.caption}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
