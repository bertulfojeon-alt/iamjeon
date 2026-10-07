/**
 * What Jun knows about one project, built from the same public view the dashboard
 * renders (ScreenItem). The index line goes into Jun's instruction; the detail is
 * answered in the browser when Jun calls get_project, so a project's depth costs
 * tokens only when a visitor asks about it.
 */

import type { ScreenItem } from "@/components/screen/Screen";

export const SLIDE_KINDS = ["hero", "feature", "numbers", "screens", "stack", "about", "contact"] as const;
export type SlideKind = (typeof SLIDE_KINDS)[number];

export interface ProjectDetail {
  slug: string;
  title: string;
  group: string;
  classified: boolean;
  industry: string;
  year: number;
  status: string;
  role: string;
  problem: string;
  outcome: string | null;
  features: string[];
  spotlights: { feature: string; label: string }[];
  metrics: { value: string; label: string }[];
  stack: string[];
  story: { heading: string; body: string }[];
  links: { label: string; href: string }[];
  /** The slides show_slide can put up for this project. */
  slides: SlideKind[];
}

/** The project-level slides this item can fill (about and contact are not per project). */
export function projectSlides(item: ScreenItem): SlideKind[] {
  const slides: SlideKind[] = ["hero"];
  if (item.spotlights.length) slides.push("feature");
  if (item.metrics.length) slides.push("numbers");
  if (item.shots.length >= 2) slides.push("screens");
  slides.push("stack");
  return slides;
}

export function indexLine(item: ScreenItem): string {
  const nda = item.classified ? " [classified client work under NDA: describe what was built, never who for]" : "";
  return `- ${item.slug} | ${item.title} | ${item.group} | ${item.industry}, ${item.year}, ${item.status}${nda} | ${item.summary}`;
}

export function projectDetail(item: ScreenItem): ProjectDetail {
  return {
    slug: item.slug,
    title: item.title,
    group: item.group,
    classified: item.classified,
    industry: item.industry,
    year: item.year,
    status: item.status,
    role: item.role,
    problem: item.problem,
    outcome: item.outcome,
    features: item.features,
    spotlights: item.spotlights.map((s) => ({ feature: s.feature, label: s.label })),
    metrics: item.metrics.map((m) => ({ value: m.value, label: m.label })),
    stack: item.stack,
    story: item.story,
    links: item.live,
    slides: projectSlides(item),
  };
}
