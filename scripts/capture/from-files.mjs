/**
 * Screens built from existing project files rather than a live page:
 * real screenshots already in a repo, or finished renders.
 *
 *   node scripts/capture/from-files.mjs [slug…]
 *
 * Writes the same outputs as run.mjs: public/media/projects/<slug>/screen.webp,
 * optional loop.mp4 and named stills.
 */

import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const only = new Set(process.argv.slice(2));
const outDir = (slug) => path.join(root, "public", "media", "projects", slug);
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });

/** 16:10 monitor poster from an image: "cover" crops from the top, "contain" letterboxes on black. */
async function poster(src, slug, fit = "cover") {
  await sharp(src)
    .resize(1280, 800, { fit, position: fit === "contain" ? "centre" : "top", background: "#000" })
    .webp({ quality: 80 })
    .toFile(path.join(outDir(slug), "screen.webp"));
}

/** A vertical short framed for a 16:10 screen: blurred fill behind, the edit sharp in front. */
function verticalLoop(src, slug, start, seconds) {
  const out = path.join(outDir(slug), "loop.mp4");
  ff([
    "-ss", String(start), "-t", String(seconds), "-i", src, "-an",
    "-filter_complex",
    "[0:v]split[a][b];[a]scale=960:600:force_original_aspect_ratio=increase,crop=960:600,boxblur=24:2,eq=brightness=-0.18[bg];" +
      "[b]scale=-2:600[fg];[bg][fg]overlay=(W-w)/2:0,fps=24,format=yuv420p[v]",
    "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-movflags", "+faststart", out,
  ]);
  ff(["-ss", "1.5", "-i", out, "-frames:v", "1", "-vf", "scale=1280:800", "-c:v", "libwebp", "-quality", "80", path.join(outDir(slug), "screen.webp")]);
}

const jobs = {
  "tg-auto-trader": async () => {
    // slide-01 shows an operator username, so the monitor uses the chart screen.
    await poster(path.join(root, "public", "media", "projects", "tg-auto-trader", "slide-02.png"), "tg-auto-trader");
  },
  "merc-smc-pro": async () => {
    const src = "F:/merc-smc-pro-work/mt5/merc-smc-pro/screenshot-gold-m15.png";
    await poster(src, "merc-smc-pro", "contain");
    await sharp(src).webp({ quality: 85 }).toFile(path.join(outDir("merc-smc-pro"), "chart-gold-m15.webp"));
  },
  "video-editor": async () => {
    verticalLoop("F:/Merc/VA/video-pipeline/out/coach-clip-v4A.mp4", "video-editor", 3, 8);
  },
};

for (const [slug, job] of Object.entries(jobs)) {
  if (only.size && !only.has(slug)) continue;
  await mkdir(outDir(slug), { recursive: true });
  await job();
  console.log(`✓ ${slug}`);
}
