"use client";

/**
 * The desk's dock windows — About, Side projects, Contact — opened by an
 * "ns:open" event from the dock, the welcome buttons or the HUD.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import styles from "./Panels.module.css";

type PanelId = "about" | "side" | "contact";

const EMAIL = "bertulfojeon@gmail.com";

export function Panels({ about, side }: { about: ReactNode; side: ReactNode }) {
  const [open, setOpen] = useState<PanelId | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => setOpen((e as CustomEvent<PanelId>).detail);
    window.addEventListener("ns:open", onOpen);
    return () => window.removeEventListener("ns:open", onOpen);
  }, []);

  const close = () => setOpen(null);

  return (
    <>
      <Modal open={open === "about"} onClose={close} label="About Jeon">
        {about}
      </Modal>
      <Modal open={open === "side"} onClose={close} label="Side projects">
        {side}
      </Modal>
      <Modal open={open === "contact"} onClose={close} label="Contact" size="panel">
        <div className={styles.contact}>
          <h2 className={`display ${styles.title}`}>Let&rsquo;s build something.</h2>
          <p className={styles.lead}>
            A platform, an AI agent, an automation that gives your team its evenings back — or a live walkthrough of
            anything on the desk. Freelance and full-time.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href={`mailto:${EMAIL}?subject=Project%20enquiry`}>
              {EMAIL}
            </a>
            <a className={styles.secondary} href="tel:+639684333479">
              +63 968 4333 479
            </a>
            <a className={styles.secondary} href="/IamjeonResume.pdf" target="_blank" rel="noopener">
              Résumé (PDF)
            </a>
          </div>
          <p className={styles.where}>Lapu-Lapu City, Cebu · working with clients in any time zone</p>
        </div>
      </Modal>
    </>
  );
}
