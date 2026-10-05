import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SHOWCASES, SHOWCASE_IDS, type ShowcaseId } from "@/components/showcase";

/** Full-frame render of a coded showcase — recorded into the desk tile's loop. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return SHOWCASE_IDS.map((id) => ({ id }));
}

export default async function ShowcaseFrame({ params }: PageProps<"/showcase/[id]">) {
  const { id } = await params;
  const Showcase = SHOWCASES[id as ShowcaseId];
  if (!Showcase) notFound();
  return (
    <main style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", background: "#000" }}>
      <div style={{ width: "100vw", maxWidth: "160vh" }}>
        <Showcase />
      </div>
    </main>
  );
}
