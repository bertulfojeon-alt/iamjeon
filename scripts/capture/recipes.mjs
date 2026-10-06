/**
 * Capture recipes, one per project. Public sites need no login.
 *
 * Classified projects read their address and masking rules from a PRIVATE config
 * outside this public repo (CAPTURE_PRIVATE, default F:\ME\portfolio-private\capture.json),
 * because those rules necessarily contain the names being hidden.
 *
 * Fields: slug, url, setup(page), settle, blur[], hide[], replace[[from, to]],
 * shots[{ name, go(page) }], loop(page, reprepare) — scripted ~8 s of motion.
 */

import { existsSync, readFileSync } from "node:fs";

const PRIVATE_PATH = process.env.CAPTURE_PRIVATE ?? "F:/ME/portfolio-private/capture.json";
/** { [slug]: { url, replace: [[from, to]], blur: [] } } — never committed. */
export const PRIVATE = existsSync(PRIVATE_PATH) ? JSON.parse(readFileSync(PRIVATE_PATH, "utf8")) : {};

const COOKIE_BANNERS = ["[class*='cookie' i]", "[id*='cookie' i]", "[class*='consent' i]"];

/** Smooth scroll of `px` over `ms`, as a visitor would. */
async function glide(page, px, ms) {
  const steps = Math.max(1, Math.round(ms / 40));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps);
    await page.waitForTimeout(40);
  }
}

/** A public marketing page: hero still, then a slow scroll as the loop. */
function publicSite(slug, url, extra = {}) {
  return {
    slug,
    url,
    hide: COOKIE_BANNERS,
    loop: async (page) => {
      await page.waitForTimeout(800);
      await glide(page, 1400, 6200);
      await page.waitForTimeout(800);
    },
    ...extra,
  };
}

export const recipes = [
  publicSite("247aisupports", "https://247aisupports.com/"),
  publicSite("tradesbymerc", "https://tradesbymerc.com/", {
    // Dismiss the Telegram sign-up popup that opens on arrival.
    setup: async (page) => {
      await page.waitForTimeout(2500);
      await page.getByRole("button", { name: "Maybe later" }).click({ timeout: 4000 }).catch(() => {});
    },
  }),
  publicSite("smc-classroom-to-algorithm", "https://freesmartmoneycourse.online/"),
  // The live hero still carries placeholder counters with nothing behind them — keep them out.
  publicSite("jeonscraper", "https://jeonscraper.vercel.app/", {
    // So does the "Trusted by …" badge: tag it so the hide list can reach it by text.
    setup: async (page) => {
      await page.evaluate(() => {
        const match = (el) => /^Trusted by \d/.test(el.textContent?.trim() ?? "");
        for (const el of document.querySelectorAll("body *")) {
          if (match(el) && ![...el.children].some(match)) el.setAttribute("data-capture-hide", "");
        }
      });
    },
    hide: [...COOKIE_BANNERS, ".hero-stats", "[data-capture-hide]"],
  }),
  publicSite("resolute-ai-site", "https://resoluteaiph.vercel.app/", { settle: 3500 }),
  // The event date has passed, so its countdown reads negative — keep it out.
  // ── Landing pages of products whose main screen is their app (kept in their own folders) ──
  publicSite("the-alpha-room-landing", "https://www.alphavault.trade/", {
    settle: 3500,
    // Its cookie notice has no cookie/consent class: tag it by text for the hide list.
    setup: async (page) => {
      await page.evaluate(() => {
        for (const el of document.querySelectorAll("body *")) {
          const t = el.textContent?.trim() ?? "";
          if (/^Essential cookies only/.test(t) && el.getBoundingClientRect().bottom >= innerHeight - 4) el.setAttribute("data-capture-hide", "");
        }
      });
    },
    hide: [...COOKIE_BANNERS, "[data-capture-hide]"],
  }),
  publicSite("ezvibe-landing", "https://ezvibe.vercel.app/", { settle: 2500 }),
  publicSite("unified-cx-landing", "https://aibpo-eight.vercel.app/", { settle: 3500 }),
  // ── Local apps (start it first: Karaoke `npm start`) ──
  publicSite("karaoke", "http://localhost:5173/", {
    settle: 4000,
    microphone: true,
    // Start the first song so the stage shows the player, not an empty screen.
    setup: async (page) => {
      await page.getByRole("button", { name: /Sing this/i }).first().click({ timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(5000);
    },
  }),
  // ── Classified: address + name swaps come from the private config ──
  {
    slug: "project-balance-sheet",
    url: PRIVATE["project-balance-sheet"]?.url && new URL("/dashboard", PRIVATE["project-balance-sheet"].url).href,
    colorScheme: "light",
    replace: PRIVATE["project-balance-sheet"]?.replace ?? [],
    // The brand mark and sidebar logo give the product away; keep them out.
    hide: [...COOKIE_BANNERS, "header img", "aside img", "[class*='logo' i]", "svg[class*='logo' i]"],
    settle: 2500,
    shots: [
      { name: "profit-loss", go: (p) => p.goto(new URL("/reports/profit-loss", p.url()).href, { waitUntil: "networkidle" }) },
      { name: "banking", go: (p) => p.goto(new URL("/banking", p.url()).href, { waitUntil: "networkidle" }) },
      { name: "receipt-scan", go: (p) => p.goto(new URL("/expenses/scan", p.url()).href, { waitUntil: "networkidle" }) },
    ],
  },
  {
    slug: "project-facegate",
    url: PRIVATE["project-facegate"]?.url,
    camera: true,
    colorScheme: "light",
    replace: PRIVATE["project-facegate"]?.replace ?? [],
    settle: 2500,
    loop: async (page, reprepare) => {
      await page.getByRole("button", { name: /run a challenge/i }).click({ timeout: 4000 }).catch(() => {});
      await reprepare();
      await page.waitForTimeout(7000);
    },
  },
  publicSite("midnight-vibes", "https://midnightvibeslive.vercel.app/", { hide: [...COOKIE_BANNERS, "section .absolute.top-8.right-8"] }),
];
