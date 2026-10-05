/**
 * The project registry. Each project lives in its own file under ./projects and is
 * validated here, once, at module load — a malformed project fails the build.
 */

import { projectSchema, type Chapter, type Project, type ProjectInput } from "./schema";
import { projectInputs } from "./projects";

function load(inputs: ProjectInput[]): Project[] {
  const seen = new Set<string>();
  return inputs.map((input) => {
    const project = projectSchema.parse(input);
    if (seen.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}`);
    seen.add(project.slug);
    return project;
  });
}

export const projects: Project[] = load(projectInputs);

export const CHAPTER_TITLES: Record<Chapter, string> = {
  trading: "Trading",
  voice: "Voice AI",
  saas: "SaaS & Operations",
  classified: "Classified",
  archive: "Archive",
};

/** Chapters shown on the monitor wall, in screen order. */
export const WALL_CHAPTERS: Chapter[] = ["trading", "voice", "saas", "classified"];

const byOrder = (a: Project, b: Project) => a.order - b.order || a.title.localeCompare(b.title);

export function projectsInChapter(chapter: Chapter): Project[] {
  return projects.filter((p) => p.chapter === chapter).sort(byOrder);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Projects that have a case-study page (everything except the archive). */
export function caseStudyProjects(): Project[] {
  return WALL_CHAPTERS.flatMap(projectsInChapter);
}

/** The project after `slug` in wall order, wrapping around — powers "Next screen". */
export function nextProject(slug: string): Project {
  const list = caseStudyProjects();
  const i = list.findIndex((p) => p.slug === slug);
  return list[(i + 1) % list.length];
}
