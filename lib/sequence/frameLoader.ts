/**
 * FrameLoader — windowed, off-main-thread image-sequence cache.
 *
 * Design goals (see plan "Windowed frame memory"):
 *  - Never preload all frames. Keep only a moving window of decoded ImageBitmaps
 *    around the playhead, biased in the scroll direction.
 *  - Decode off the main thread via createImageBitmap (keeps scrubbing at 60fps).
 *  - Cancel stale in-flight decodes when the user scrubs fast (AbortController).
 *  - Release frames outside the window via ImageBitmap.close() to bound memory.
 *  - Always be able to draw *something*: getNearest() returns the closest loaded
 *    frame so fast scrubbing never shows a blank canvas.
 *
 * This class is framework-agnostic — no React, no DOM beyond fetch/createImageBitmap
 * — so it is trivially testable and reusable.
 */

import { resolveFramePath } from "./framePath";

type Direction = 1 | -1;

export interface FrameLoaderOptions {
  basePath: string;
  pattern: string;
  frameCount: number;
  startIndex?: number;
  /** Frames kept ahead of the playhead in the scroll direction. */
  windowAhead?: number;
  /** Frames kept behind the playhead. */
  windowBehind?: number;
}

export class FrameLoader {
  private readonly basePath: string;
  private readonly pattern: string;
  private readonly startIndex: number;
  readonly frameCount: number;

  private windowAhead: number;
  private windowBehind: number;

  /** Decoded frames, keyed by absolute frame index. */
  private readonly bitmaps = new Map<number, ImageBitmap>();
  /** In-flight decodes, keyed by index, so we never double-fetch. */
  private readonly inflight = new Map<number, AbortController>();

  private current: number;
  private direction: Direction = 1;
  private idleHandle: number | null = null;

  constructor(opts: FrameLoaderOptions) {
    this.basePath = opts.basePath;
    this.pattern = opts.pattern;
    this.frameCount = opts.frameCount;
    this.startIndex = opts.startIndex ?? 0;
    this.windowAhead = opts.windowAhead ?? 24;
    this.windowBehind = opts.windowBehind ?? 8;
    this.current = this.startIndex;
  }

  /** Tune the window at runtime (e.g. from device capability detection). */
  setWindow(ahead: number, behind: number): void {
    this.windowAhead = ahead;
    this.windowBehind = behind;
  }

  private clampIndex(i: number): number {
    const min = this.startIndex;
    const max = this.startIndex + this.frameCount - 1;
    return Math.min(max, Math.max(min, i));
  }

  /**
   * Declare the active frame. Ensures the surrounding window is loading and
   * evicts anything outside it. Cheap to call every frame.
   */
  setActive(index: number): void {
    const next = this.clampIndex(Math.round(index));
    if (next !== this.current) {
      this.direction = next >= this.current ? 1 : -1;
      this.current = next;
    }
    this.ensureWindow();
    this.evictOutsideWindow();
  }

  /** Range of indices that must stay resident, biased to scroll direction. */
  private windowBounds(): { lo: number; hi: number } {
    const ahead = this.direction === 1 ? this.windowAhead : this.windowBehind;
    const behind = this.direction === 1 ? this.windowBehind : this.windowAhead;
    return {
      lo: this.clampIndex(this.current - behind),
      hi: this.clampIndex(this.current + ahead),
    };
  }

  /** Kick off decodes for any missing frame in the window (nearest first). */
  private ensureWindow(): void {
    const { lo, hi } = this.windowBounds();
    // Load outward from the playhead so the most-needed frames land first.
    const order: number[] = [];
    for (let d = 0; d <= Math.max(hi - this.current, this.current - lo); d++) {
      const fwd = this.current + d * this.direction;
      const back = this.current - d * this.direction;
      if (fwd >= lo && fwd <= hi) order.push(fwd);
      if (d !== 0 && back >= lo && back <= hi) order.push(back);
    }
    for (const i of order) this.load(i);
  }

  private load(index: number): void {
    if (this.bitmaps.has(index) || this.inflight.has(index)) return;

    const controller = new AbortController();
    this.inflight.set(index, controller);
    const url = resolveFramePath(this.basePath, this.pattern, index);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Frame ${index} HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => createImageBitmap(blob))
      .then((bitmap) => {
        this.inflight.delete(index);
        // If it fell out of the window while decoding, discard immediately.
        const { lo, hi } = this.windowBounds();
        if (index < lo || index > hi) {
          bitmap.close();
          return;
        }
        this.bitmaps.set(index, bitmap);
      })
      .catch((err) => {
        this.inflight.delete(index);
        if ((err as Error)?.name !== "AbortError") {
          // Non-fatal: getNearest() will keep the canvas painted.
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[FrameLoader] failed frame ${index}:`, err);
          }
        }
      });
  }

  /** Free bitmaps and cancel decodes that are no longer in the window. */
  private evictOutsideWindow(): void {
    const { lo, hi } = this.windowBounds();
    for (const [index, bitmap] of this.bitmaps) {
      if (index < lo || index > hi) {
        bitmap.close();
        this.bitmaps.delete(index);
      }
    }
    for (const [index, controller] of this.inflight) {
      if (index < lo || index > hi) {
        controller.abort();
        this.inflight.delete(index);
      }
    }
  }

  /** Exact decoded frame, or null if not yet resident. */
  get(index: number): ImageBitmap | null {
    return this.bitmaps.get(this.clampIndex(Math.round(index))) ?? null;
  }

  /**
   * Closest decoded frame to `index` (searching outward). Guarantees the
   * renderer always has a bitmap once anything is loaded — no blank flashes.
   */
  getNearest(index: number): ImageBitmap | null {
    const target = this.clampIndex(Math.round(index));
    const exact = this.bitmaps.get(target);
    if (exact) return exact;
    for (let d = 1; d < this.frameCount; d++) {
      const up = this.bitmaps.get(target + d);
      if (up) return up;
      const down = this.bitmaps.get(target - d);
      if (down) return down;
    }
    return null;
  }

  /**
   * Eagerly warm a small set of frames during idle time (used for the very first
   * frame so the canvas paints fast). Bounded and abortable like everything else.
   */
  preloadInitial(count = 1): void {
    if (typeof window === "undefined") return;
    const run = () => {
      for (let i = 0; i < count; i++) this.load(this.clampIndex(this.startIndex + i));
    };
    if ("requestIdleCallback" in window) {
      this.idleHandle = (window as typeof window & {
        requestIdleCallback: (cb: () => void) => number;
      }).requestIdleCallback(run);
    } else {
      run();
    }
  }

  /** Release every bitmap and cancel every decode. Call on unmount. */
  dispose(): void {
    if (this.idleHandle !== null && "cancelIdleCallback" in window) {
      (window as typeof window & {
        cancelIdleCallback: (h: number) => void;
      }).cancelIdleCallback(this.idleHandle);
    }
    for (const controller of this.inflight.values()) controller.abort();
    this.inflight.clear();
    for (const bitmap of this.bitmaps.values()) bitmap.close();
    this.bitmaps.clear();
  }
}
