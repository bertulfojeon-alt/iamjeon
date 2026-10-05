/**
 * Canvas drawing helpers for the image-sequence player.
 *
 * Kept separate from React so drawing is a pure imperative operation that can be
 * called from the GSAP ticker with zero allocation pressure.
 */

import type { FrameFit } from "./types";

/**
 * Size the canvas backing store to its CSS box * DPR (capped). Returns true if
 * the backing store changed, so the caller knows a redraw is required.
 *
 * Capping DPR at 2 keeps fill-rate bounded on high-density displays without a
 * visible quality loss — a key "full parity, tuned cost" lever for mobile.
 */
export function resizeCanvasToDisplay(
  canvas: HTMLCanvasElement,
  maxDpr = 2,
): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return true;
  }
  return false;
}

/**
 * Draw a bitmap into the canvas with cover/contain fit, centered. Uses the
 * full backing-store resolution (the canvas is already DPR-scaled).
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  fit: FrameFit = "cover",
): void {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const iw = bitmap.width;
  const ih = bitmap.height;

  const scale =
    fit === "cover"
      ? Math.max(cw / iw, ch / ih)
      : Math.min(cw / iw, ch / ih);

  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) * 0.5;
  const dy = (ch - dh) * 0.5;

  // For "contain" we clear first (letterbox); "cover" always fully paints.
  if (fit === "contain") ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(bitmap, dx, dy, dw, dh);
}
