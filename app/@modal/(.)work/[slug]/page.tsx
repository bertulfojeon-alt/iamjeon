import { notFound } from "next/navigation";
import { getProject } from "@/content";
import { CaseStudy } from "@/components/case/CaseStudy";
import { MonitorCase } from "@/components/case/MonitorCase";

/** Opening a project from the desk: the same case study, playing inside the monitor. */
export default async function CaseStudyOnMonitor({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p || p.tier === "archive") notFound();
  return (
    <MonitorCase label={p.title}>
      <CaseStudy project={p} inModal />
    </MonitorCase>
  );
}
