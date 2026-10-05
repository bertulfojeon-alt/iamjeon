import type { ProjectInput } from "../schema";

const SRC = "F:\\merc-smc-pro-work\\mt5";

export default {
  slug: "merc-smc-pro",
  title: "Merc SMC Pro",
  tier: "commission",
  chapter: "trading",
  logline:
    "A smart-money indicator for MT5 that draws structure, scored order blocks and liquidity, licensed offline to one account.",
  industry: "Trading tools",
  year: 2026,
  status: "live",
  role: "MQL5 developer — detection engine, renderer, licensing, tests",
  client: "TradesByMerc",
  stack: ["MQL5", "MetaTrader 5", "SHA-256", "PowerShell", "Python", "TypeScript"],
  screen: { poster: "/media/projects/merc-smc-pro/screen.webp" },
  coldOpen: {
    type: "image",
    src: "/media/projects/merc-smc-pro/chart-gold-m15.webp",
    alt: "Gold, 15-minute chart with Merc SMC Pro: market structure labels, order blocks, session ranges and a three-timeframe bias panel",
    width: 1350,
    height: 460,
    caption: "GOLD M15 with every feature enabled — structure, order blocks, sessions, premium/discount and the bias panel.",
  },
  features: [
    "Major and minor market structure with BOS/CHoCH and swing labels",
    "Order blocks scored 0–100 on displacement, gap and volume",
    "Percentile-adaptive fair value gaps that shrink as they fill",
    "Offline licence bound to one MT5 account, one product and an expiry date",
    "Liquidity pools and sweeps, with strong and weak highs and lows",
    "Premium, discount and equilibrium zones plus previous day, week and month levels",
    "Asia, London and New York session ranges in broker server time",
    "Multi-timeframe bias panel with trend, last event and zone",
    "Alert presets with optional push to the MT5 mobile app",
    "Translucent zones painted on one canvas that repaints only when something changes",
    "Optional trend-coloured candles",
  ],
  beats: [
    {
      kind: "context",
      heading: "A method that has to fit on a chart",
      body: [
        "Academy members needed the coach's smart-money method drawn on their own MT5 charts, on any symbol and timeframe, and the tool could not be shareable.",
        "Two constraints set the design. MQL5 indicators can't make web requests, so the licence had to work offline. And a discretionary method had to become rules that code can apply the same way every time: what counts as a swing, a break, or an order block worth showing.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "Measure everything in ATR",
      body: [
        "Fixed pip thresholds break across instruments, so every threshold is measured in ATR. Swings must clear an ATR excursion to count. Order blocks are the last opposing candle before a move of at least 1.5 ATR within 10 bars, scored 0–100 on displacement, gap and volume. Fair value gaps use a rolling percentile per instrument — the top 30% of recent gaps — with an ATR fallback until 20 have been seen.",
        "MT5 rectangles are opaque, so zones are alpha-painted onto one chart-sized bitmap that repaints only when something changes. An idle chart costs nothing.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "Licensed, tested, inside budget",
      body: [
        "Each key is signed with SHA-256 over a compiled per-product secret and bound to one MT5 account, one product and an expiry date. It is pasted once, and a bad paste can't displace a good key. The indicator never connects out and never trades. The academy site issues the keys.",
        "Testing is unusual for MQL5: 9 engine suites on hand-built fixtures, 13 invariants checked on real charts and 16 licence cases. Across 10 documented runs on up to 100,000 bars it drew 264–324 objects in 500–1,032 ms, inside a 450-object, three-second budget. The build compiles with 0 errors and 0 warnings.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "71",
      label: "settings in 12 groups",
      source: `83 input lines minus 12 input group lines in the indicator source, ${SRC}\\merc-smc-pro (client-trading.md §4F)`,
    },
    {
      value: "9",
      label: "engine test suites",
      source: `tests/expected/*.json used by tests/EngineTest.mq5, ${SRC}\\merc-smc-pro (client-trading.md §4F)`,
    },
    {
      value: "13",
      label: "invariants checked on real charts",
      source: `tests/invariants.py and README, ${SRC}\\merc-smc-pro (client-trading.md §4F)`,
    },
    {
      value: "16",
      label: "licence test cases",
      source: `tests/LicenseTest.mq5 as documented in README, ${SRC}\\merc-smc-pro (client-trading.md §4F)`,
    },
    {
      value: "0 / 0",
      label: "build errors / warnings",
      source: `build.log from build.ps1 MetaEditor compile, ${SRC}\\merc-smc-pro (client-trading.md §4F)`,
    },
  ],
  links: [],
  order: 11,
} satisfies ProjectInput;
