/**
 * Records a coded showcase (app/showcase/[id]) into a desk loop + poster.
 *
 *   node scripts/capture/showcase.mjs <showcase-id> <project-slug> <loopSeconds> <stillAt>
 *   (expects `next start -p 3742` running on a fresh build)
 *
 * Showcases fade almost to black in their last 0.7 s, so the darkest frame of
 * the recording marks a loop boundary. Exactly one loop is cut from there —
 * seamless, because the animation is periodic — and the poster is taken at
 * `stillAt` (the finished frame).
 */

import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const [id, slug, loopArg, stillArg] = process.argv.slice(2);
const LOOP = Number(loopArg);
const STILL = Number(stillArg);
if (!id || !slug || !LOOP) throw new Error("usage: showcase.mjs <id> <slug> <loop> <stillAt>");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const raw = path.join(root, "media-src", "capture", slug);
const out = path.join(root, "public", "media", "projects", slug);
await rm(raw, { recursive: true, force: true });
await mkdir(raw, { recursive: true });
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: raw, size: { width: 1280, height: 800 } } });
const page = await ctx.newPage();
await page.goto(`http://localhost:3742/showcase/${id}`, { waitUntil: "networkidle" });
await page.waitForTimeout((LOOP * 2 + 2) * 1000);
await ctx.close();
await browser.close();

const video = path.join(raw, (await readdir(raw)).find((f) => f.endsWith(".webm")));
const meanAt = async (t) => {
  const buf = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", t.toFixed(2), "-i", video, "-frames:v", "1", "-vf", "scale=64:40", "-f", "image2pipe", "-vcodec", "png", "-"]);
  const { data } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  return data.reduce((a, b) => a + b, 0) / data.length;
};
// Darkest frame between the first and second loop ends ≈ the wrap point.
let best = [0, Infinity];
for (let t = LOOP * 0.8; t <= LOOP * 2; t += 0.05) {
  const m = await meanAt(t);
  if (m < best[1]) best = [t, m];
}
const start = best[0] + 0.05;
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
ff(["-ss", start.toFixed(2), "-t", String(LOOP), "-i", video, "-an", "-vf", "scale=960:600,fps=24,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-movflags", "+faststart", path.join(out, "loop.mp4")]);
ff(["-ss", String(STILL), "-i", path.join(out, "loop.mp4"), "-frames:v", "1", "-vf", "scale=1280:800", "-c:v", "libwebp", "-quality", "82", path.join(out, "screen.webp")]);
console.log(`${slug}: loop cut at ${start.toFixed(2)} s, poster at ${STILL} s`);
