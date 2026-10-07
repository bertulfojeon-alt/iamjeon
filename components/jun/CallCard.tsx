"use client";

/**
 * The small card above Jun's badge: the start of a call (what Jun is, and that it needs
 * the microphone), the call itself (state, Jun's words, Mute, End), and the ways out
 * (an error, the call cap, or Jun's note to Jeon with the contact links). There is no
 * text input: Jun is voice only.
 */

import { useState } from "react";
import type { JunFailure, JunStatus } from "@/features/jun/live/session";
import { mailtoHref, viberHref, whatsappHref } from "@/lib/contact";
import styles from "./CallCard.module.css";

export type CardView = "intro" | "call" | "error" | "after";

const FAILURE: Record<JunFailure, string> = {
  denied: "Your browser blocked the microphone. Allow it for this site in the address bar, then try again, or reach Jeon directly.",
  missing: "I couldn't find a microphone on this device. You can reach Jeon directly.",
  insecure: "Voice needs a secure connection. You can reach Jeon directly.",
  unsupported: "This browser can't hold a voice call. You can reach Jeon directly.",
  busy: "My line is busy right now. Here is how to reach Jeon directly.",
  off: "I'm offline right now. Here is how to reach Jeon directly.",
  unavailable: "I couldn't connect just now. Here is how to reach Jeon directly.",
};

const STATE: Record<JunStatus, string> = {
  connecting: "Connecting…",
  listening: "Listening",
  speaking: "Speaking",
  ended: "Call ended",
  capped: "That's our five minutes",
};

export interface CallCardProps {
  view: CardView;
  status: JunStatus;
  subtitle: string;
  muted: boolean;
  failure: JunFailure | null;
  /** Jun's note to Jeon, once Jun has written one. */
  note: string;
  onStart: () => void;
  onClose: () => void;
  onMute: () => void;
  onEnd: () => void;
}

function Links({ note }: { note: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={styles.links} data-jun-links>
      <a href={mailtoHref(note)}>Email</a>
      <a href={whatsappHref(note)} target="_blank" rel="noopener">
        WhatsApp
      </a>
      <a
        href={viberHref()}
        onClick={() => {
          if (note) navigator.clipboard?.writeText(note).then(() => setCopied(true), () => {});
        }}
      >
        {copied ? "Viber (note copied)" : "Viber"}
      </a>
    </div>
  );
}

function Note({ note }: { note: string }) {
  return (
    <div className={styles.note} data-jun-note>
      <strong>Your note to Jeon</strong>
      <p>{note}</p>
      <small>Email and WhatsApp open with it filled in; you can edit it before sending. For Viber it is copied, ready to paste.</small>
    </div>
  );
}

export function CallCard({ view, status, subtitle, muted, failure, note, onStart, onClose, onMute, onEnd }: CallCardProps) {
  return (
    <section className={styles.card} role="dialog" aria-label="Talk to Jun" data-jun-card={view}>
      {view === "intro" && (
        <>
          <h2 className={styles.title}>I&rsquo;m Jun, Jeon&rsquo;s AI twin.</h2>
          <p>I talk by voice, so I&rsquo;ll need your microphone. Ask me anything about Jeon&rsquo;s work, or I can walk you through it.</p>
          <p className={styles.fine}>
            Our conversation is processed by Google&rsquo;s Gemini. While Jun is in testing, Google may use it to improve its models, so please
            don&rsquo;t share anything private.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onStart}>
              Start
            </button>
            <button type="button" className={styles.secondary} onClick={onClose}>
              Not now
            </button>
          </div>
        </>
      )}

      {view === "call" && (
        <>
          <p className={styles.state} role="status" aria-live="polite" data-status={status}>
            <i aria-hidden="true" />
            {muted && status !== "connecting" ? "Muted" : STATE[status]}
          </p>
          <p className={styles.subtitle} data-jun-subtitle>
            {subtitle || (status === "connecting" ? "" : " ")}
          </p>
          {note && (
            <>
              <Note note={note} />
              <Links note={note} />
            </>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onMute} aria-pressed={muted} disabled={status === "connecting"}>
              {muted ? "Unmute" : "Mute"}
            </button>
            <button type="button" className={styles.end} onClick={onEnd}>
              End
            </button>
          </div>
        </>
      )}

      {view === "error" && failure && (
        <>
          <p data-jun-failure={failure}>{FAILURE[failure]}</p>
          <Links note={note} />
          <div className={styles.actions}>
            {(failure === "denied" || failure === "busy" || failure === "unavailable") && (
              <button type="button" className={styles.primary} onClick={onStart}>
                Try again
              </button>
            )}
            <button type="button" className={styles.secondary} onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}

      {view === "after" && (
        <>
          <p className={styles.title}>{status === "capped" ? "That's our five minutes. Thanks for talking." : "Thanks for talking."}</p>
          {note ? <Note note={note} /> : <p>Want to tell Jeon about your project? He replies personally.</p>}
          <Links note={note} />
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}
    </section>
  );
}
