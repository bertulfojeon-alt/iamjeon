/**
 * Runs inline in <head> before first paint and stamps `data-mode` on <html>.
 *
 * Layout differences between modes (sticky scrub scenes vs. stacked stills) are
 * driven by CSS off this attribute, so the very first paint already has the
 * right layout — no hydration flash, no layout shift. The logic mirrors
 * `pickMode` in lib/mode.ts; keep the two in sync (mode.test.ts covers pickMode).
 */
export const MOTION_STORAGE_KEY = "ns-motion-paused";

export const modeScript = `(() => {
  try {
    var d = document.documentElement, n = navigator, mm = window.matchMedia;
    var paused = false;
    try { paused = localStorage.getItem("${MOTION_STORAGE_KEY}") === "1"; } catch (e) {}
    var reduced = mm("(prefers-reduced-motion: reduce)").matches;
    var saveData = !!(n.connection && n.connection.saveData);
    var coarse = mm("(pointer: coarse)").matches;
    var cores = n.hardwareConcurrency || 8, mem = n.deviceMemory || 8;
    var mode = (reduced || saveData || paused) ? "still"
      : (coarse || window.innerWidth < 900 || cores <= 2 || mem <= 2) ? "lite" : "full";
    d.dataset.mode = mode;
    if (paused) d.dataset.motionPaused = "true";
  } catch (e) {}
})();`;
