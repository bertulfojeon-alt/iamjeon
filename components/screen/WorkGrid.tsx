"use client";

/**
 * All work: the monitor's landing view. A sidebar to browse by business problem,
 * service or skill (with a nudge to get in touch), and a grid of project cards
 * with category chips and search. A service swaps the page header for what the
 * service covers, and the grid for the projects that show it.
 */

import { useEffect, useRef, type MutableRefObject } from "react";
import { GROUP_ORDER, GROUP_TITLES, type Group } from "@/content/tracks";
import { SERVICES, SKILLS, skillMatches } from "@/content/services";
import { STATUS_SHORT } from "@/components/case/labels";
import type { ScreenItem } from "./Screen";
import styles from "./WorkGrid.module.css";

export type Filter =
  | { kind: "all" }
  | { kind: "group"; group: Group }
  | { kind: "service"; id: string }
  | { kind: "skill"; label: string };

export const ALL: Filter = { kind: "all" };

const same = (a: Filter, b: Filter) => JSON.stringify(a) === JSON.stringify(b);

export function matches(item: ScreenItem, filter: Filter, query: string): boolean {
  if (filter.kind === "group" && item.group !== filter.group) return false;
  if (filter.kind === "service" && !SERVICES.find((s) => s.id === filter.id)?.proof.includes(item.slug)) return false;
  if (filter.kind === "skill") {
    const skill = SKILLS.find((s) => s.label === filter.label);
    if (!skill || !skillMatches(skill, item.stack)) return false;
  }
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.title, item.summary, item.problem, item.industry, ...item.stack, ...item.features].join(" ").toLowerCase().includes(q);
}

/* ── Icons (inline, stroke = currentColor) ── */
const Svg = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const GROUP_ICON: Record<Group | "all", string> = {
  all: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  calls: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  trading: "M3 20h18M5 16l4-5 4 3 6-8M15 6h4v4",
  admin: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
  other: "M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2Z",
  side: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3",
};
const ICON = {
  projects: "M3 7h7l2 2h9v10H3z",
  services: "M4 12h4l3-7 2 14 3-7h4",
  skills: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h13M13 6l6 6-6 6",
  mail: "M3 6h18v12H3zM3.5 6.5 12 13l8.5-6.5",
};

/* ── Sidebar ── */
interface BrowseProps {
  items: ScreenItem[];
  filter: Filter | null;
  onFilter: (f: Filter) => void;
  onContact: () => void;
}

export function Browse({ items, filter, onFilter, onContact }: BrowseProps) {
  const groups = GROUP_ORDER.filter((g) => items.some((i) => i.group === g));
  const pressed = (f: Filter) => (filter ? same(filter, f) : false);
  return (
    <aside className={styles.browse} aria-label="Browse" data-lenis-prevent>
      <h2 className={styles.sideTitle}>
        <Svg d={ICON.projects} />
        Projects
      </h2>
      <ul className={styles.sideList}>
        {[ALL, ...groups.map((group): Filter => ({ kind: "group", group }))].map((f) => {
          const key = f.kind === "group" ? f.group : "all";
          const count = f.kind === "group" ? items.filter((i) => i.group === f.group).length : items.length;
          return (
            <li key={key}>
              <button type="button" className={styles.sideItem} aria-pressed={pressed(f)} onClick={() => onFilter(f)}>
                <Svg d={GROUP_ICON[key]} />
                <span>{f.kind === "group" ? GROUP_TITLES[f.group] : "All projects"}</span>
                <span className={styles.count}>{count}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className={styles.sideTitle}>
        <Svg d={ICON.services} />
        Services
      </h2>
      <ul className={styles.sideList}>
        {SERVICES.map((s) => {
          const f: Filter = { kind: "service", id: s.id };
          return (
            <li key={s.id}>
              <button type="button" className={styles.sideLink} aria-pressed={pressed(f)} title={s.line} onClick={() => onFilter(f)}>
                {s.title}
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className={styles.sideTitle}>
        <Svg d={ICON.skills} />
        Skills
      </h2>
      <ul className={styles.sideList}>
        {SKILLS.map((s) => {
          const f: Filter = { kind: "skill", label: s.label };
          return (
            <li key={s.label}>
              <button type="button" className={styles.sideLink} aria-pressed={pressed(f)} onClick={() => onFilter(f)}>
                {s.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.cta}>
        <Svg d={ICON.spark} />
        <p className={styles.ctaTitle}>Have a project in mind?</p>
        <p className={styles.ctaText}>Tell me what is slowing your business down, and I&rsquo;ll tell you honestly whether software can fix it.</p>
        <button type="button" className={styles.ctaButton} onClick={onContact}>
          <Svg d={ICON.mail} />
          Get in touch
          <Svg d={ICON.arrow} />
        </button>
      </div>
    </aside>
  );
}

/* ── The grid ── */
interface GridProps {
  items: ScreenItem[];
  filter: Filter;
  query: string;
  ready: boolean;
  scrollRef: MutableRefObject<number>;
  onFilter: (f: Filter) => void;
  onQuery: (q: string) => void;
  onOpen: (slug: string) => void;
  onContact: () => void;
}

export function WorkGrid({ items, filter, query, ready, scrollRef, onFilter, onQuery, onOpen, onContact }: GridProps) {
  const root = useRef<HTMLElement>(null);
  const service = filter.kind === "service" ? SERVICES.find((s) => s.id === filter.id) : undefined;
  const groups = GROUP_ORDER.filter((g) => items.some((i) => i.group === g));
  const shown = items.filter((i) => matches(i, filter, query));
  // A service lists its proof in the order the service names it.
  if (service) shown.sort((a, b) => service.proof.indexOf(a.slug) - service.proof.indexOf(b.slug));

  // Coming back from a project lands where the visitor left the grid.
  useEffect(() => {
    if (root.current) root.current.scrollTop = scrollRef.current;
  }, [scrollRef]);

  const chips: Filter[] = [ALL, ...groups.map((group): Filter => ({ kind: "group", group }))];
  const scope =
    filter.kind === "group"
      ? ` in ${GROUP_TITLES[filter.group]}`
      : filter.kind === "skill"
        ? ` built with ${filter.label}`
        : "";

  return (
    <section
      ref={root}
      className={styles.work}
      aria-label="All work"
      data-screen-view
      data-lenis-prevent
      onScroll={(e) => (scrollRef.current = e.currentTarget.scrollTop)}
    >
      {service ? (
        <header className={styles.head}>
          <p className={styles.kicker}>Service</p>
          <h2 className={`display ${styles.title}`}>{service.title}</h2>
          <p className={styles.lead}>{service.lead}</p>
          <ul className={styles.points}>
            {service.points.map((p) => (
              <li key={p}>
                <Svg d={ICON.check} />
                {p}
              </li>
            ))}
          </ul>
          <div className={styles.headActions}>
            <button type="button" className={styles.primary} onClick={onContact}>
              Talk to me about this
            </button>
            <button type="button" className={styles.ghost} onClick={() => onFilter(ALL)}>
              See all projects
            </button>
          </div>
        </header>
      ) : (
        <header className={styles.head}>
          <p className={styles.kicker}>My work</p>
          <h2 className={`display ${styles.title}`}>Projects</h2>
          <p className={styles.lead}>
            Software I have designed, built and shipped: AI agents that answer customers, platforms for traders, and back-office
            systems for growing businesses. Open any project to see it running.
          </p>
        </header>
      )}

      <div className={styles.tools}>
        {!service && (
          <div className={styles.chips} role="group" aria-label="Filter by category">
            {chips.map((f) => {
              const key = f.kind === "group" ? f.group : "all";
              const count = f.kind === "group" ? items.filter((i) => i.group === f.group).length : items.length;
              return (
                <button key={key} type="button" aria-pressed={same(filter, f)} onClick={() => onFilter(f)}>
                  {f.kind === "group" ? GROUP_TITLES[f.group] : "All"}
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
        )}
        {service && <h3 className={styles.sub}>Projects that show it</h3>}
        <label className={styles.search}>
          <Svg d={ICON.search} />
          <input type="search" placeholder="Search projects…" aria-label="Search projects" value={query} onChange={(e) => onQuery(e.target.value)} />
        </label>
      </div>

      <p className={styles.status} aria-live="polite">
        {shown.length === 1 ? "1 project" : `${shown.length} projects`}
        {scope}
        {query.trim() && ` matching “${query.trim()}”`}
      </p>

      <ul className={styles.cards}>
        {shown.map((i) => (
          <li key={i.slug} className={styles.card}>
            <div className={styles.thumb}>
              {ready && <img src={i.poster} alt="" loading="lazy" decoding="async" />}
              {i.classified && <span className={styles.privacy} aria-hidden="true" />}
              <span className={styles.badge} data-live={i.statusKey === "live" || undefined}>
                <i aria-hidden="true" />
                {STATUS_SHORT[i.statusKey]}
              </span>
              {i.classified && <span className={styles.nda}>NDA</span>}
            </div>
            <h3 className={styles.cardTitle}>
              <a
                href={`/work/${i.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  onOpen(i.slug);
                }}
              >
                {i.title}
              </a>
            </h3>
            <p className={styles.summary}>{i.summary}</p>
            <p className={styles.tags}>
              {i.stack.slice(0, 3).map((s) => (
                <span key={s}>{s}</span>
              ))}
            </p>
            <span className={styles.view} aria-hidden="true">
              View project
              <Svg d={ICON.arrow} />
            </span>
          </li>
        ))}
      </ul>

      {shown.length === 0 && (
        <div className={styles.empty}>
          <p>No projects match &ldquo;{query.trim()}&rdquo;{scope}.</p>
          <button type="button" className={styles.ghost} onClick={() => onQuery("")}>
            Clear search
          </button>
        </div>
      )}
    </section>
  );
}
