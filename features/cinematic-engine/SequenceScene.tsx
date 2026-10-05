"use client";

/**
 * SequenceScene — the scene shell every footage section is authored against.
 *
 *   1. SequenceCanvas   — the scroll-scrubbed shot, on a sticky stage.
 *   2. Overlay DOM      — semantic HTML positioned over the footage.
 *   3. useScrollSequence — one GSAP timeline syncing 1 + 2 to scroll progress.
 *
 * A scene is fully described by a SceneConfig plus overlay content keyed by id.
 * Layout per mode lives in CSS (see `.scene` in globals.css), keyed off
 * `html[data-mode]`, so "still" visitors get stacked, readable overlays from the
 * first paint instead of overlapping ones.
 */

import { useRef, type CSSProperties, type ReactNode } from "react";
import { SequenceCanvas, type SequenceCanvasHandle } from "@/components/sequence/SequenceCanvas";
import { useScrollSequence } from "@/hooks/useScrollSequence";
import { useCinematic } from "@/hooks/useCinematic";
import type { SceneConfig } from "@/lib/sequence/types";

interface SequenceSceneProps {
  scene: SceneConfig;
  overlayContent: Record<string, ReactNode>;
  priority?: boolean;
  /** Extra layers drawn above the footage and below the overlays (shade, grain…). */
  children?: ReactNode;
  id?: string;
}

export function SequenceScene({ scene, overlayContent, priority, children, id }: SequenceSceneProps) {
  const { mode, ready } = useCinematic();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHandleRef = useRef<SequenceCanvasHandle>(null);
  const overlayRefs = useRef<Map<string, HTMLElement>>(new Map());

  useScrollSequence({ sectionRef, canvasHandleRef, overlayRefs, overlays: scene.overlays, mode, ready });

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label={scene.ariaLabel}
      className={scene.chained ? "scene scene--chained" : "scene"}
      style={{ "--scene-len": scene.scrollLengthVh ?? 2 } as CSSProperties}
    >
      <div className="scene-stage">
        <SequenceCanvas
          ref={canvasHandleRef}
          sequence={scene.sequence}
          ariaLabel={scene.ariaLabel}
          priority={priority}
          className="scene-footage"
        />
        {children}
        <div className="scene-overlays">
          {scene.overlays.map((o) => (
            <div
              key={o.id}
              data-align={o.align ?? "center"}
              data-initial={o.at <= 0 ? "visible" : undefined}
              className="scene-overlay"
              ref={(el) => {
                if (el) overlayRefs.current.set(o.id, el);
                else overlayRefs.current.delete(o.id);
              }}
            >
              {overlayContent[o.id]}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
