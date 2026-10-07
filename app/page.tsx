import { ViewTransition } from "react";
import { Theatre } from "@/components/theatre/Theatre";
import type { ScreenItem } from "@/components/screen/Screen";
import { BehindTheDesk } from "@/components/night/BehindTheDesk";
import { STATUS_LABEL } from "@/components/case/labels";
import { projects } from "@/content";
import { GROUP_ORDER } from "@/content/tracks";
import type { Project } from "@/content/schema";

/** Everything the dashboard shows for one project, public fields only. */
function toItem(p: Project): ScreenItem {
  const images = [p.coldOpen, ...p.gallery, ...p.beats.flatMap((b) => b.media ?? [])].filter((m) => m && m.type === "image");
  const shots = images
    .map((m) => ({ src: m!.src, alt: m!.alt, caption: m!.caption }))
    .filter((s, i, all) => all.findIndex((o) => o.src === s.src) === i);
  if (!shots.some((s) => s.src === p.screen.poster)) shots.unshift({ src: p.screen.poster, alt: `${p.title} interface`, caption: undefined });
  return {
    slug: p.slug,
    title: p.title,
    group: p.pitch?.track ?? "side",
    classified: p.redacted,
    summary: p.logline,
    problem: p.pitch?.problem ?? p.logline,
    outcome: p.pitch?.outcome ?? null,
    industry: p.industry,
    year: p.year,
    status: STATUS_LABEL[p.status],
    statusKey: p.status,
    role: p.role,
    poster: p.screen.poster,
    loop: p.screen.loop,
    landing: p.screen.landing,
    showcase: p.showcase,
    live: p.links.filter((l) => l.kind === "live" || l.kind === "demo" || l.kind === "waitlist").map((l) => ({ label: l.label, href: l.href })),
    shots,
    features: p.features,
    spotlights: p.spotlights,
    metrics: p.metrics.map((m) => ({ value: m.value, label: m.label })),
    stack: p.stack,
    story: p.beats.map((b) => ({ heading: b.heading, body: b.body })),
  };
}

export default function HomePage() {
  const all = projects.map(toItem);
  const items = GROUP_ORDER.flatMap((g) => all.filter((i) => i.group === g));

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main>
        <Theatre items={items} about={<BehindTheDesk />} />
      </main>
    </ViewTransition>
  );
}
