import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { caseStudyProjects, getProject } from "@/content";
import { CaseStudy } from "@/components/case/CaseStudy";

export function generateStaticParams() {
  return caseStudyProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.logline };
}

/** Direct visits and search land here; from the desk the same study opens in a modal. */
export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p || p.tier === "archive") notFound();
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main>
        <CaseStudy project={p} />
      </main>
    </ViewTransition>
  );
}
