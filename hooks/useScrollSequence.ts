"use client";

/**
 * useScrollSequence — binds a scene's scroll progress to its footage and its
 * overlays on a SINGLE GSAP timeline.
 *
 * Scenes are tall sections with a sticky stage (pure CSS), not GSAP pins, so the
 * layout is identical before and after hydration — no pin-spacer layout shift.
 * The timeline is normalised to a duration of 1, so overlay positions read as
 * plain scene progress (0..1).
 *
 * Overlays enter with a focus pull (blur → sharp), the camera's own way of
 * directing attention, instead of the stock fade-up.
 *
 * "still" mode: no timeline at all. CSS shows every overlay, stacked and readable.
 */

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { SequenceCanvasHandle } from "@/components/sequence/SequenceCanvas";
import type { OverlayConfig } from "@/lib/sequence/types";
import type { Mode } from "@/lib/mode";
import type { RefObject } from "react";

interface UseScrollSequenceArgs {
  sectionRef: RefObject<HTMLElement | null>;
  canvasHandleRef: RefObject<SequenceCanvasHandle | null>;
  overlayRefs: RefObject<Map<string, HTMLElement>>;
  overlays: OverlayConfig[];
  mode: Mode;
  ready: boolean;
}

/** Fraction of scene progress an overlay spends coming into / out of focus. */
const FOCUS = 0.08;

export function useScrollSequence({
  sectionRef,
  canvasHandleRef,
  overlayRefs,
  overlays,
  mode,
  ready,
}: UseScrollSequenceArgs): void {
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !ready || mode === "still") return;

    const ctx = gsap.context(() => {
      const playhead = { value: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        playhead,
        { value: 1, duration: 1, onUpdate: () => canvasHandleRef.current?.setProgress(playhead.value) },
        0,
      );

      for (const o of overlays) {
        const el = overlayRefs.current.get(o.id);
        if (!el) continue;
        // at <= 0: already visible from first paint (CSS); it only ever leaves.
        if (o.at > 0) {
          const inStart = Math.max(0, o.at - FOCUS);
          tl.fromTo(
          el,
          { autoAlpha: 0, filter: "blur(10px)" },
          { autoAlpha: 1, filter: "blur(0px)", duration: FOCUS, ease: "power2.out" },
            inStart,
          );
        }
        if (o.until !== undefined) {
          tl.to(
            el,
            { autoAlpha: 0, filter: "blur(6px)", duration: FOCUS, ease: "power2.in" },
            Math.min(1 - FOCUS, o.until),
          );
        }
      }
      // A chained scene stays hidden under the previous shot until its own first
      // frame — identical to that shot's last — takes over at the viewport top.
      if (section.classList.contains("scene--chained")) {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          toggleClass: { targets: section, className: "is-on" },
        });
      }
    }, section);

    return () => ctx.revert();
  }, [sectionRef, canvasHandleRef, overlayRefs, overlays, mode, ready]);
}
