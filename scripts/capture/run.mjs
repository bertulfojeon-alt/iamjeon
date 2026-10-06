/**
 * Screen capture for the monitor wall and case studies.
 *
 *   node scripts/capture/run.mjs                 # every recipe
 *   node scripts/capture/run.mjs 247aisupports   # one project
 *
 * For each recipe it opens the page in system Edge (page area only — no browser
 * chrome, so no address bar ever appears), applies masks and text replacements,
 * then writes:
 *   public/media/projects/<slug>/screen.webp   1280×800 poster for the monitor
 *   public/media/projects/<slug>/loop.mp4      silent 8 s loop (if the recipe has motion)
 *   public/media/projects/<slug>/shot-<name>.webp  extra stills for the case study
 * Raw recordings stay in media-src/ (gitignored). Every image is reviewed before
 * it is committed; the leak check scans the text in the build.
 */

import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { recipes } from "./recipes.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const only = new Set(process.argv.slice(2));
const VIEWPORT = { width: 1440, height: 900 };

/** Injected before every capture: blur selectors, swap words, hide cookie banners. */
async function prepare(page, recipe) {
  await page.evaluate(
    ({ blur, hide, replace }) => {
      const style = document.createElement("style");
      style.dataset.capture = "1";
      style.textContent = [
        ...blur.map((s) => `${s}{filter:blur(9px)!important}`),
        ...hide.map((s) => `${s}{visibility:hidden!important}`),
        "*{caret-color:transparent!important}",
      ].join("\n");
      document.head.appendChild(style);
      if (replace.length) {
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const rules = replace.map(([from, to]) => [new RegExp(from, "gi"), to]);
        for (let n = walk.nextNode(); n; n = walk.nextNode()) {
          let t = n.nodeValue;
          for (const [re, to] of rules) t = t.replace(re, to);
          if (t !== n.nodeValue) n.nodeValue = t;
        }
        for (const el of document.querySelectorAll("[placeholder],[title],[alt]")) {
          for (const attr of ["placeholder", "title", "alt"]) {
            const v = el.getAttribute(attr);
            if (!v) continue;
            let t = v;
            for (const [re, to] of rules) t = t.replace(re, to);
            if (t !== v) el.setAttribute(attr, t);
          }
        }
      }
    },
    { blur: recipe.blur ?? [], hide: recipe.hide ?? [], replace: recipe.replace ?? [] },
  );
}

async function capture(recipe) {
  const outDir = path.join(root, "public", "media", "projects", recipe.slug);
  const rawDir = path.join(root, "media-src", "capture", recipe.slug);
  await mkdir(outDir, { recursive: true });
  await rm(rawDir, { recursive: true, force: true });
  await mkdir(rawDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "msedge",
    // A synthetic camera, so camera-based screens (liveness checks) render without a real face.
    args: recipe.camera || recipe.microphone ? ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] : [],
  });
  const context = await browser.newContext({
    viewport: recipe.viewport ?? VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: recipe.colorScheme ?? "dark",
    permissions: [...(recipe.camera ? ["camera"] : []), ...(recipe.microphone ? ["microphone"] : [])],
    recordVideo: recipe.loop ? { dir: rawDir, size: recipe.viewport ?? VIEWPORT } : undefined,
  });
  const page = await context.newPage();
  const t0 = Date.now();
  try {
    await page.goto(recipe.url, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => page.waitForTimeout(3000));
    if (recipe.setup) await recipe.setup(page);
    await page.waitForTimeout(recipe.settle ?? 1500);
    await prepare(page, recipe);

    // Poster for the monitor (16:10).
    const posterBuf = await page.screenshot({ type: "png" });
    await sharp(posterBuf).resize(1280, 800, { fit: "cover", position: "top" }).webp({ quality: 78 }).toFile(path.join(outDir, "screen.webp"));

    for (const shot of recipe.shots ?? []) {
      await shot.go(page);
      await page.waitForTimeout(shot.settle ?? 1200);
      await prepare(page, recipe);
      const buf = await page.screenshot({ type: "png", fullPage: false });
      await sharp(buf).webp({ quality: 80 }).toFile(path.join(outDir, `shot-${shot.name}.webp`));
    }

    if (recipe.loop) {
      const loopStart = (Date.now() - t0) / 1000;
      await recipe.loop(page, () => prepare(page, recipe));
      const loopEnd = (Date.now() - t0) / 1000;
      await context.close();
      const raw = (await readdir(rawDir)).find((f) => f.endsWith(".webm"));
      if (raw) {
        // Keep only the scripted motion, 960×600, silent, small.
        execFileSync("ffmpeg", [
          "-hide_banner", "-loglevel", "error", "-y",
          "-ss", loopStart.toFixed(2), "-to", loopEnd.toFixed(2), "-i", path.join(rawDir, raw),
          "-an", "-vf", "scale=960:600:force_original_aspect_ratio=increase,crop=960:600,fps=24,format=yuv420p",
          "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-movflags", "+faststart",
          path.join(outDir, "loop.mp4"),
        ]);
      }
    } else {
      await context.close();
    }
    console.log(`✓ ${recipe.slug}`);
  } catch (err) {
    console.error(`✗ ${recipe.slug}: ${err.message.split("\n")[0]}`);
    await context.close().catch(() => {});
  } finally {
    await browser.close();
  }
}

for (const recipe of recipes) {
  if (only.size && !only.has(recipe.slug)) continue;
  if (!recipe.url) {
    console.log(`– ${recipe.slug}: no address (private config missing?) — skipped`);
    continue;
  }
  await capture(recipe);
}
