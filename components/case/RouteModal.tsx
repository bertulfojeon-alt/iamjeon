"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";

/** A full-screen case owned by a route: closing it returns to the desk underneath. */
export function RouteModal({ label, children }: { label: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <Modal open label={label} size="takeover" onClose={() => router.push("/", { scroll: false })}>
      {children}
    </Modal>
  );
}
