import type { ProjectInput } from "../schema";

const SRC = "F:\ME\Scrapper\jeonscrapper-desktop\jeonscrapper";

export default {
  slug: "jeonscraper",
  title: "JeonScraper",
  tier: "archive",
  chapter: "archive",
  logline:
    "A desktop war room for store owners: it scrapes 9 e-commerce platforms and flags price, stock and new-product changes hourly.",
  industry: "E-commerce intelligence",
  year: 2026,
  status: "live",
  role: "Solo: desktop app and marketing site",
  stack: ["Electron", "Node.js", "SQLite", "Cheerio", "Vitest", "WebGL"],
  screen: { poster: "/media/projects/jeonscraper/screen.webp", loop: "/media/projects/jeonscraper/loop.mp4", landing: { loop: "/media/projects/jeonscraper-landing/loop.mp4", poster: "/media/projects/jeonscraper-landing/screen.webp" } },
  features: [
    "Scrapers for 9 e-commerce platforms with automatic platform detection",
    "Three fetch tiers: JSON API, HTML and JSON-LD, then a real Chromium window",
    "War Room briefing with price, category, brand and opportunity views",
    "Hourly watchlist with price, stock and new-product alerts",
    "Fuzzy product matching across stores by name, handle and similarity",
    "Multi-currency prices with live exchange rates",
    "Excel, CSV and Shopify-ready import exports",
    "Marketing site with a WebGL fluid hero adapted from PavelDoGreat/WebGL-Fluid-Simulation (MIT)",
  ],
  beats: [],
  metrics: [
    {
      value: "9",
      label: "supported platforms",
      source: `scrapers in src/lib/scrapers (Shopify, WooCommerce, BigCommerce, Wix, Squarespace, Amazon, Alibaba, CJdropshipping, generic), ${SRC} (own-trading.md §4F)`,
    },
    {
      value: "176",
      label: "unit tests in 11 suites",
      source: `count of it(/test( calls in 11 Vitest files, ${SRC} (own-trading.md §4F)`,
    },
    {
      value: "55",
      label: "IPC endpoints",
      source: `grep of ipcMain.handle in src/main.js, ${SRC} (own-trading.md §4F)`,
    },
  ],
  links: [{ label: "jeonscraper.vercel.app", href: "https://jeonscraper.vercel.app", kind: "live" }],
  order: 2,
} satisfies ProjectInput;
