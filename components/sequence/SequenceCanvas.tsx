"use client";

/**
 * SequenceCanvas — the scroll-driven image-sequence player.
 *
 * Responsibilities:
 *  - Paint a poster immediately (LCP) that also serves as the "still" mode frame.
 *  - Only once the scene is within ~1.5 viewports, create a FrameLoader and start
 *    drawing — scenes further down the page cost nothing until approached.
 *  - Pick the desktop or the lighter mobile rendition from the viewing mode.
 *  - Draw the current frame imperatively from the GSAP ticker — never via React
 *    state, so scrubbing causes zero re-renders.
 *  - Keep the canvas invisible until a real frame is painted, so the poster is
 *    never covered by an empty canvas.
 *
 * It knows nothing about ScrollTrigger or Lenis; the parent writes progress
 * through the imperative handle.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useCinematic } from "@/hooks/useCinematic";
import { memoryBudget } from "@/lib/mode";
import { FrameLoader } from "@/lib/sequence/frameLoader";
import { drawFrame, resizeCanvasToDisplay } from "@/lib/sequence/canvasRenderer";
import type { SequenceConfig } from "@/lib/sequence/types";

export interface SequenceCanvasHandle {
  /** Drive the playhead. `progress` is clamped to [0, 1]. */
  setProgress: (progress: number) => void;
}

export interface SequenceCanvasProps {
  sequence: SequenceConfig;
  /** Accessible description of the (decorative) footage. */
  ariaLabel: string;
  /** Mark the poster as the page's LCP candidate (first scene only). */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SequenceCanvas = forwardRef<SequenceCanvasHandle, SequenceCanvasProps>(function SequenceCanvas(
  { sequence, ariaLabel, priority = false, className, style },
  ref,
) {
  const { mode, ready } = useCinematic();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const [near, setNear] = useState(false);
  const [painted, setPainted] = useState(false);

  const fit = sequence.fit ?? "cover";
  const source = mode === "lite" && sequence.mobile ? sequence.mobile : sequence.desktop;
  const animated = ready && mode !== "still";

  useImperativeHandle(ref, () => ({
    setProgress(p: number) {
      progressRef.current = Math.min(1, Math.max(0, p));
    },
  }));

  // Lazy activation: start loading frames only as the scene approaches.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !animated) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animated]);

  useIsomorphicLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !animated || !near) return;
    const ctx = canvas.getContext("2d", { alpha: fit === "contain" });
    if (!ctx) return;

    const budget = memoryBudget(mode);
    const startIndex = source.startIndex ?? 0;
    const loader = new FrameLoader({
      basePath: source.basePath,
      pattern: source.pattern,
      frameCount: source.frameCount,
      startIndex,
      windowAhead: budget.windowAhead,
      windowBehind: budget.windowBehind,
    });
    loader.preloadInitial(2);

    let dirty = true;
    const ro = new ResizeObserver(() => {
      dirty = true;
    });
    ro.observe(canvas);

    let lastIndex = -1;
    let lastBitmap: ImageBitmap | null = null;
    let didPaint = false;
    const render = () => {
      const resized = dirty;
      if (resized) {
        resizeCanvasToDisplay(canvas, budget.maxDpr);
        dirty = false;
      }
      const index = startIndex + Math.round(progressRef.current * (source.frameCount - 1));
      if (index !== lastIndex) {
        loader.setActive(index);
        lastIndex = index;
      }
      // Prefer the exact frame; fall back to the nearest loaded one so fast
      // scrubbing never flashes a blank canvas.
      const bitmap = loader.get(index) ?? loader.getNearest(index);
      if (bitmap && (bitmap !== lastBitmap || resized)) {
        drawFrame(ctx, bitmap, fit);
        lastBitmap = bitmap;
        if (!didPaint) {
          didPaint = true;
          setPainted(true);
        }
      }
    };
    gsap.ticker.add(render);

    return () => {
      gsap.ticker.remove(render);
      ro.disconnect();
      loader.dispose();
      setPainted(false);
    };
  }, [animated, near, mode, fit, source.basePath, source.pattern, source.frameCount, source.startIndex]);

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      <picture>
        {sequence.mobilePoster && <source media="(max-width: 899px)" srcSet={sequence.mobilePoster} />}
        <img
          src={sequence.poster}
          alt=""
          aria-hidden="true"
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,
            visibility: painted ? "hidden" : "visible",
          }}
        />
      </picture>
      {sequence.still && (
        <img className="scene-still" src={sequence.still} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      )}
      {animated && near && (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={ariaLabel}
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
            width: "100%",
            height: "100%",
            opacity: painted ? 1 : 0,
          }}
        />
      )}
    </div>
  );
});
