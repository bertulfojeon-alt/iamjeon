import { notFound } from "next/navigation";
import { getProject } from "@/content";
import { CaseStudy } from "@/components/case/CaseStudy";
import { RouteModal } from "@/components/case/RouteModal";

/** Opening a project from the desk: the same case study, in a modal over the desk. */
export default async function CaseStudyModal({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p || p.tier === "archive") notFound();
  return (
    <RouteModal label={p.title}>
      <CaseStudy project={p} inModal />
    </RouteModal>
  );
}
