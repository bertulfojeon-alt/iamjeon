"use client";

/**
 * A chapter title that warms up like a sodium streetlight the first time it
 * comes into view. The site's one signature gesture — used for chapter titles
 * only. In "still" mode it is simply lit.
 */

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { useCinematic } from "@/hooks/useCinematic";

interface WarmTitleProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Re-run the warm-up when this value changes (e.g. switching chapters). */
  relightKey?: string;
}

export function WarmTitle({ as: Tag = "h2", children, className = "", relightKey }: WarmTitleProps) {
  const ref = useRef<HTMLElement>(null);
  const { mode, ready } = useCinematic();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-lit");
    if (!ready || mode === "still") {
      el.classList.add("is-lit");
      return;
    }
    // Restart the animation on relight.
    void el.offsetWidth;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-lit");
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, ready, relightKey]);

  return (
    <Tag ref={ref} className={`display warm ${className}`}>
      {children}
    </Tag>
  );
}
