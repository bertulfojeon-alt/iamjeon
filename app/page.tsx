import { ViewTransition } from "react";
import { Journey } from "@/components/night/Journey";
import { MonitorWall, type WallChapter } from "@/components/night/MonitorWall";
import { Archive } from "@/components/night/Archive";
import { BehindTheDesk } from "@/components/night/BehindTheDesk";
import { Dawn } from "@/components/night/Dawn";
import { CHAPTER_TITLES, WALL_CHAPTERS, projects, projectsInChapter } from "@/content";

export default function NightPage() {
  const chapters: WallChapter[] = WALL_CHAPTERS.map((id) => ({
    id,
    title: CHAPTER_TITLES[id],
    items: projectsInChapter(id).map((p) => ({
      slug: p.slug,
      title: p.title,
      logline: p.logline,
      poster: p.screen.poster,
      loop: p.screen.loop,
      classified: p.redacted,
    })),
  }));
  const liveCount = projects.filter((p) => p.status === "live").length;

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main>
        <Journey liveCount={liveCount} />
        <MonitorWall chapters={chapters} />
        <Archive projects={projectsInChapter("archive")} />
        <BehindTheDesk />
        <Dawn />
      </main>
    </ViewTransition>
  );
}
