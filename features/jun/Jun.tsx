"use client";

/**
 * Jun on the page: the badge, the call card, the voice session and the presentation.
 * Jun's tool calls run through runTool (checked, answered from the same items the
 * dashboard renders) and their effects land here:
 *   - the presentation reducer (the full-screen stage);
 *   - the desk, through the same events the HUD uses (ns:show, ns:open), or on a
 *     /work page through navigation and the call card;
 *   - contact, with Jun's note to Jeon.
 * Leaving the page, or this component unmounting, ends the call and frees the mic.
 */

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ScreenItem } from "@/components/screen/Screen";
import { CallCard, type CardView } from "@/components/jun/CallCard";
import { JunBadge } from "@/components/jun/JunBadge";
import { Presentation } from "@/components/jun/Presentation";
import { useCinematic } from "@/hooks/useCinematic";
import { JunSession, type JunFailure, type JunStatus } from "./live/session";
import { CLOSED, presentationReducer, type PresentationState } from "./presentation";
import { runTool, type JunEffect } from "./tools";

export interface JunProps {
  /** The desk passes the list it already has; a /work page leaves it out and Jun fetches it. */
  items?: ScreenItem[];
  /** The desk (home page) or a /work/<slug> page. */
  where: "desk" | "page";
}

export function Jun({ items, where }: JunProps) {
  const { mode, ready } = useCinematic();
  const still = ready && mode === "still";
  const router = useRouter();

  const [card, setCard] = useState<CardView | null>(null);
  const [status, setStatus] = useState<JunStatus>("connecting");
  const [subtitle, setSubtitle] = useState("");
  const [muted, setMuted] = useState(false);
  const [failure, setFailure] = useState<JunFailure | null>(null);
  const [note, setNote] = useState("");
  const [presentation, present] = useReducer(presentationReducer, CLOSED);
  const [offer, setOffer] = useState(false);

  const sessionRef = useRef<JunSession | null>(null);
  const itemsRef = useRef<ScreenItem[]>(items ?? []);
  const loadItems = useCallback(() => {
    if (itemsRef.current.length) return;
    fetch("/api/jun/items")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: ScreenItem[]) => {
        if (Array.isArray(list) && list.length) itemsRef.current = list;
      })
      .catch(() => {});
  }, []);
  // Several tool calls can arrive in one message: each must see the state the previous one left.
  const presRef = useRef<PresentationState>(CLOSED);
  const calling = card === "call";

  const apply = useCallback(
    (effect: JunEffect) => {
      switch (effect.type) {
        case "present":
          presRef.current = presentationReducer(presRef.current, effect.cmd);
          present(effect.cmd);
          if (effect.cmd.type === "show" && effect.cmd.slide.kind === "contact" && effect.cmd.slide.summary) setNote(effect.cmd.slide.summary);
          return;
        case "offer-presentation":
          setOffer(true);
          return;
        case "show-project":
          if (where === "desk") window.dispatchEvent(new CustomEvent("ns:show", { detail: effect.slug }));
          else router.push(`/work/${effect.slug}`);
          return;
        case "contact":
          setNote(effect.summary);
          if (where === "desk") window.dispatchEvent(new CustomEvent("ns:open", { detail: { panel: "contact", summary: effect.summary } }));
          return;
      }
    },
    [where, router],
  );

  const closePresentation = useCallback(() => {
    presRef.current = CLOSED;
    present({ type: "end" });
  }, []);

  const start = useCallback(() => {
    sessionRef.current?.stop();
    setFailure(null);
    setSubtitle("");
    setMuted(false);
    setStatus("connecting");
    setCard("call");
    const session = new JunSession({
      onStatus: (s) => {
        setStatus(s);
        if (s === "ended" || s === "capped") {
          closePresentation();
          setOffer(false);
          setCard((c) => (c === "call" ? "after" : c));
        }
      },
      onSubtitle: setSubtitle,
      onTool: (name, args) => {
        const { response, effect } = runTool(name, args, { items: itemsRef.current, presenting: presRef.current.open });
        if (effect) apply(effect);
        return response;
      },
      onFailure: (kind) => {
        setFailure(kind);
        setCard("error");
      },
    });
    sessionRef.current = session;
    void session.start();
  }, [apply, closePresentation]);

  // The visitor's answer to Jun's offer of the big screen.
  const answerOffer = useCallback((yes: boolean) => {
    setOffer(false);
    if (yes) {
      presRef.current = presentationReducer(presRef.current, { type: "start" });
      present({ type: "start" });
      sessionRef.current?.tell("(The visitor tapped to open the big screen. It is open now: present with show_slide.)");
    } else {
      sessionRef.current?.tell("(The visitor declined the big screen. Carry on by voice and do not offer it again.)");
    }
  }, []);

  const end = useCallback(() => {
    sessionRef.current?.stop();
    sessionRef.current = null;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      sessionRef.current?.setMuted(!m);
      return !m;
    });
  }, []);

  // The visitor closed the stage themselves: Jun hears about it, without being asked to reply.
  const closeByVisitor = useCallback(() => {
    closePresentation();
    sessionRef.current?.note("(The visitor closed the presentation. Do not call show_slide unless they ask to see more.)");
  }, [closePresentation]);

  // Leaving the page ends the call: the mic must never stay open behind the visitor's back.
  useEffect(() => {
    const onHide = () => sessionRef.current?.stop();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      sessionRef.current?.stop();
    };
  }, []);

  const level = !calling ? "idle" : status === "speaking" ? "speaking" : "listening";

  // Rendered at the top of the page: inside the theatre, the stage would sit under the site's top bar.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <>
      <JunBadge
        still={still}
        calling={calling}
        level={level}
        onTap={() => {
          // Fetch the list now, long before the first tool call needs it.
          loadItems();
          setCard((c) => (c === null ? "intro" : c === "call" ? c : null));
        }}
      />
      {card && (
        <CallCard
          view={card}
          status={status}
          subtitle={subtitle}
          muted={muted}
          failure={failure}
          note={note}
          offer={offer}
          onOffer={answerOffer}
          onStart={start}
          onClose={() => setCard(null)}
          onMute={toggleMute}
          onEnd={end}
        />
      )}
      {presentation.open && (
        <Presentation
          state={presentation}
          items={itemsRef.current}
          still={still}
          subtitle={subtitle}
          muted={muted}
          onMute={toggleMute}
          onEnd={end}
          onClose={closeByVisitor}
        />
      )}
    </>,
    document.body,
  );
}
