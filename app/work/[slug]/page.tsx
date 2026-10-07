import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { getProject, projects } from "@/content";
import { CaseStudy } from "@/components/case/CaseStudy";
import { Jun } from "@/features/jun/Jun";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.logline };
}

/** Direct visits and shared project links land here; at the desk the same project opens in the dashboard. */
export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main id="main-content" className="screen-light">
        <CaseStudy project={p} />
      </main>
      {/* No project list in the page: a classified case page must not carry other projects' names. Jun fetches it. */}
      <Jun where="page" />
    </ViewTransition>
  );
}
