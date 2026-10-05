import { ViewTransition } from "react";
import { Theatre } from "@/components/theatre/Theatre";
import { Panels } from "@/components/theatre/Panels";
import type { DeskChapter } from "@/components/theatre/Desktop";
import { Archive } from "@/components/night/Archive";
import { BehindTheDesk } from "@/components/night/BehindTheDesk";
import { CHAPTER_TITLES, WALL_CHAPTERS, projectsInChapter } from "@/content";

export default function HomePage() {
  const chapters: DeskChapter[] = WALL_CHAPTERS.map((id) => ({
    id,
    title: CHAPTER_TITLES[id],
    items: projectsInChapter(id).map((p) => ({
      slug: p.slug,
      title: p.title,
      logline: p.logline,
      poster: p.screen.poster,
      loop: p.screen.loop,
      classified: p.redacted,
      status: p.status,
    })),
  }));
  const side = projectsInChapter("archive");

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main>
        <Theatre chapters={chapters} sideCount={side.length} />
        <Panels about={<BehindTheDesk />} side={<Archive projects={side} />} />
      </main>
    </ViewTransition>
  );
}
