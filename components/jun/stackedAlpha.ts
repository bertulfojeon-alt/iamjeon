/**
 * Plays a stacked-alpha clip (picture on top, its transparency mask below; see
 * scripts/jun-media.mjs) onto a canvas with real transparency. H.264 has no alpha
 * channel, so each frame is joined here: the mask's brightness becomes the alpha, and
 * the premultiplied picture is brought back to full colour at the soft edges.
 */

/** Joins one frame in place: `top` is the picture's RGBA, `mask` the mask's RGBA, same size. */
export function joinStacked(top: Uint8ClampedArray, mask: Uint8ClampedArray): void {
  for (let i = 0; i < top.length; i += 4) {
    const a = mask[i];
    top[i + 3] = a;
    if (a > 0 && a < 255) {
      const k = 255 / a;
      // Uint8ClampedArray clamps at 255 on its own.
      top[i] *= k;
      top[i + 1] *= k;
      top[i + 2] *= k;
    }
  }
}

/** Draws the video's current frame, joined, onto `canvas`. Returns false if the frame is not ready. */
export function drawStackedFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement, work: CanvasRenderingContext2D): boolean {
  const w = video.videoWidth;
  const h = video.videoHeight / 2;
  if (!w || !h) return false;
  if (work.canvas.width !== w || work.canvas.height !== h * 2) {
    work.canvas.width = w;
    work.canvas.height = h * 2;
  }
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  work.drawImage(video, 0, 0, w, h * 2);
  const picture = work.getImageData(0, 0, w, h);
  joinStacked(picture.data, work.getImageData(0, h, w, h).data);
  canvas.getContext("2d")!.putImageData(picture, 0, 0);
  return true;
}

/** Keeps `canvas` in step with `video` while it plays. Returns a function that stops it. */
export function attachStackedVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement): () => void {
  const work = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  let live = true;
  type FrameVideo = HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
  const v = video as FrameVideo;
  const tick = () => {
    if (!live) return;
    drawStackedFrame(video, canvas, work);
    if (!video.paused && !video.ended) {
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick);
      else requestAnimationFrame(tick);
    }
  };
  const onPlay = () => tick();
  const onSeeked = () => drawStackedFrame(video, canvas, work);
  video.addEventListener("play", onPlay);
  video.addEventListener("seeked", onSeeked);
  video.addEventListener("loadeddata", onSeeked);
  return () => {
    live = false;
    video.removeEventListener("play", onPlay);
    video.removeEventListener("seeked", onSeeked);
    video.removeEventListener("loadeddata", onSeeked);
  };
}
