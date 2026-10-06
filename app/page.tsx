import { ViewTransition } from "react";
import { Theatre } from "@/components/theatre/Theatre";
import type { ScreenItem } from "@/components/screen/Screen";
import { Archive } from "@/components/night/Archive";
import { BehindTheDesk } from "@/components/night/BehindTheDesk";
import { TRACKS, caseStudyProjects, projectsInChapter } from "@/content";

export default function HomePage() {
  const all = caseStudyProjects();
  const items: ScreenItem[] = TRACKS.flatMap((t) => all.filter((p) => p.pitch?.track === t)).map((p) => ({
    slug: p.slug,
    title: p.title,
    track: p.pitch!.track,
    problem: p.pitch!.problem,
    outcome: p.pitch!.outcome,
    poster: p.screen.poster,
    loop: p.screen.loop,
    classified: p.redacted,
    spotlights: p.spotlights,
  }));
  const side = projectsInChapter("archive");

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main>
        <Theatre items={items} about={<BehindTheDesk />} side={<Archive projects={side} />} />
      </main>
    </ViewTransition>
  );
}
