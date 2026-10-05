"use client";

/**
 * The one dialog shell: native <dialog> (focus trap, Esc, inert background for
 * free), a close button, backdrop click to close, and the page's smooth scroll
 * paused while it is open. Its body scrolls on its own (data-lenis-prevent).
 */

import { useEffect, useRef, type ReactNode } from "react";
import { useCinematic } from "@/hooks/useCinematic";
import styles from "./Modal.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  size?: "case" | "panel";
}

export function Modal({ open, onClose, label, children, size = "case" }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { lenis } = useCinematic();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.querySelector<HTMLElement>("[data-modal-body]")?.scrollTo(0, 0);
      lenis?.stop();
    } else if (!open && d.open) {
      d.close();
    }
    return () => {
      if (open) lenis?.start();
    };
  }, [open, lenis]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      data-size={size}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={styles.frame}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className={styles.body} data-modal-body data-lenis-prevent>
          {children}
        </div>
      </div>
    </dialog>
  );
}
