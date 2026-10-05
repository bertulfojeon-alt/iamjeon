/**
 * Capture from dashboards the owner has logged into in a real Edge window.
 *
 *   1. Edge is started with --remote-debugging-port=9333 and a profile kept in
 *      F:\ME\portfolio-private (outside this repo); the owner logs in by hand.
 *   2. node scripts/capture/live-session.mjs [slug…]
 *
 * This attaches to the open tabs — it never sees or stores a password — sets a
 * 1440×900 viewport, applies masks, and writes the usual outputs to
 * public/media/projects/<slug>/. Addresses and name swaps for classified
 * projects come from the private config (PRIVATE in recipes.mjs).
 */

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PRIVATE } from "./recipes.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const only = new Set(process.argv.slice(2));

/**
 * Session recipes. `tab` picks the open tab by a substring of its host;
 * `blurBlocks` blurs the card around any matching text (personal data);
 * `hideBrand` hides logo images and single-letter monograms in the top-left.
 */
const SESSION = [
  {
    slug: "project-payday",
    tab: PRIVATE["project-payday"]?.tab,
    replace: PRIVATE["project-payday"]?.replace ?? [],
    // Employee names in the "Today" panel, and any signed-in email.
    blurBlocks: ["no clock-in yet", "and \\d+ more", "[a-z0-9._-]+@[a-z0-9.-]+"],
    hideBrand: true,
    start: null,
    shots: [],
  },
  {
    slug: "project-balance-sheet",
    tab: PRIVATE["project-balance-sheet"]?.tab,
    replace: PRIVATE["project-balance-sheet"]?.replace ?? [],
    // The signed-in user's email sits in the sidebar footer.
    blurBlocks: ["[a-z0-9._-]+@[a-z0-9.-]+"],
    hideBrand: true,
    start: "/dashboard",
    // No scan-inbox shot: it holds real uploaded receipts.
    shots: ["/reports/profit-loss", "/banking"],
  },
];

async function mask(page, r) {
  await page.evaluate(
    ({ replace, blurBlocks, hideBrand }) => {
      const rules = replace.map(([f, t]) => [new RegExp(f, "gi"), t]);
      const walk = () => document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      // 1. Name swaps in text and in attributes / document title.
      for (let w = walk(), n = w.nextNode(); n; n = w.nextNode()) {
        let t = n.nodeValue;
        for (const [re, to] of rules) t = t.replace(re, to);
        if (t !== n.nodeValue) n.nodeValue = t;
      }
      for (const el of document.querySelectorAll("[alt],[title],[placeholder],[aria-label]"))
        for (const a of ["alt", "title", "placeholder", "aria-label"]) {
          const v = el.getAttribute(a);
          if (!v) continue;
          let t = v;
          for (const [re, to] of rules) t = t.replace(re, to);
          if (t !== v) el.setAttribute(a, t);
        }
      // 2. Blur the whole card around personal data.
      const res = blurBlocks.map((s) => new RegExp(s, "i"));
      for (let w = walk(), n = w.nextNode(); n; n = w.nextNode()) {
        if (!res.some((re) => re.test(n.nodeValue))) continue;
        let el = n.parentElement;
        while (el && el.parentElement && el.getBoundingClientRect().height < 160) el = el.parentElement;
        if (el) el.style.filter = "blur(10px)";
      }
      // 3. Brand marks: any small square tile (logo, monogram, tenant avatar) in the
      //    top-left corner, plus edition badges next to the product name.
      if (hideBrand) {
        for (const el of document.querySelectorAll("img, svg, div, span, a")) {
          const r = el.getBoundingClientRect();
          if (r.top > 90 || r.left > 300 || r.width < 8 || r.width > 60) continue;
          if (Math.abs(r.width - r.height) <= 6) el.style.visibility = "hidden";
        }
        for (let w = walk(), n = w.nextNode(); n; n = w.nextNode())
          if (/edition/i.test(n.nodeValue) && n.parentElement.getBoundingClientRect().top < 90)
            n.parentElement.style.visibility = "hidden";
      }
    },
    { replace: r.replace, blurBlocks: r.blurBlocks, hideBrand: r.hideBrand },
  );
}

const browser = await chromium.connectOverCDP("http://localhost:9333");
const pages = browser.contexts().flatMap((c) => c.pages());
for (const r of SESSION) {
  if (only.size && !only.has(r.slug)) continue;
  const page = r.tab && pages.find((p) => p.url().includes(r.tab));
  if (!page) {
    console.log(`– ${r.slug}: no logged-in tab found — skipped`);
    continue;
  }
  const outDir = path.join(root, "public", "media", "projects", r.slug);
  await mkdir(outDir, { recursive: true });
  await page.bringToFront();
  await page.setViewportSize({ width: 1440, height: 900 });
  const start = page.url();
  if (r.start) await page.goto(new URL(r.start, start).href, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(1500);
  await mask(page, r);
  await sharp(await page.screenshot()).resize(1280, 800, { fit: "cover", position: "top" }).webp({ quality: 80 }).toFile(path.join(outDir, "screen.webp"));
  for (const route of r.shots) {
    await page.goto(new URL(route, start).href, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(1500);
    await mask(page, r);
    const name = route.split("/").filter(Boolean).join("-");
    await sharp(await page.screenshot()).webp({ quality: 80 }).toFile(path.join(outDir, `shot-${name}.webp`));
  }
  // Leave the tab where the owner had it, without the masks.
  await page.goto(start, { waitUntil: "networkidle" }).catch(() => {});
  console.log(`✓ ${r.slug}`);
}
await browser.close(); // disconnects; the Edge window stays open
