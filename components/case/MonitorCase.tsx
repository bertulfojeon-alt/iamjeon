"use client";

/**
 * A case opened from the desk plays inside the monitor: it is portalled into the
 * screen's case slot and scrolls within it while the dark room stays around the
 * screen. Esc, Back or the browser's Back return to the scene underneath. With no
 * monitor on the page (a case opened from another case page) it falls back to the
 * full-screen light takeover.
 */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import styles from "./MonitorCase.module.css";

export function MonitorCase({ label, children }: { label: string; children: ReactNode }) {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  // undefined until mounted; null when there is no monitor to play in.
  const [slot, setSlot] = useState<HTMLElement | null | undefined>(undefined);
  const close = () => router.push("/", { scroll: false });

  useEffect(() => {
    setSlot(document.getElementById("screen-case"));
  }, []);

  useEffect(() => {
    if (!slot) return;
    ref.current?.scrollTo(0, 0);
    ref.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/", { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slot, label, router]);

  if (slot === undefined) return null;
  if (slot === null) {
    return (
      <Modal open label={label} size="takeover" onClose={close}>
        {children}
      </Modal>
    );
  }
  return createPortal(
    <section
      ref={ref}
      className={`screen-light ${styles.case}`}
      aria-label={label}
      tabIndex={-1}
      data-case-scroll
      data-lenis-prevent
    >
      <button type="button" className={styles.back} onClick={close}>
        ← Back
      </button>
      {children}
    </section>,
    slot,
  );
}
