import type { ProjectInput } from "../schema";

const SRC = "F:\\TGAutoTrader";

export default {
  slug: "tg-auto-trader",
  title: "TG Auto Trader",
  tier: "flagship",
  chapter: "trading",
  logline:
    "A Telegram-to-MT5 trading desk where each trader's own PC is the server: charts, Pine Script, copy trading, journal.",
  industry: "Retail trading software",
  year: 2026,
  status: "built",
  role: "Solo — design, engineering, desktop agent and web dashboard",
  stack: [
    "Next.js 14",
    "TypeScript",
    "Canvas 2D",
    "Python",
    "MetaTrader 5",
    "Telethon",
    "SQLite",
    "WebSockets",
    "Cloudflare Tunnel",
    "Firebase",
    "Electron",
    "PayPal",
  ],
  screen: { poster: "/media/projects/tg-auto-trader/screen.webp" },
  coldOpen: {
    type: "image",
    src: "/media/projects/tg-auto-trader/slide-02.png",
    alt: "Chart Trading screen: a gold chart with the indicator library open and a buy/sell order ticket on the right",
    width: 1460,
    height: 891,
    caption: "Chart Trading — custom canvas engine, indicator library and order ticket. Demo account.",
  },
  pitch: {
    track: "trading",
    problem: "Traders copy signals from Telegram into MetaTrader by hand, and by the time the order is in, the price has moved.",
    outcome: "Signals become orders on MetaTrader in moments, sized to the trader's risk, with charts, copy trading and a journal in one desk.",
  },
  spotlights: [
    { feature: "Custom canvas chart with indicators, drawing tools and a buy/sell order ticket", x: 8, y: 47, label: "Chart with an order ticket" },
    { feature: "Auto-execution on MT5: single or dual entry, partial close, breakeven, trailing stop", x: 88, y: 40, label: "Places the signal on MetaTrader" },
    { feature: "Risk-based lot sizing with daily-loss, max-position and session filters", x: 91, y: 22, label: "Lot size from your risk" },
  ],
  features: [
    "Telegram listener (Telethon user client) with a signal parser that knows symbol aliases",
    "Auto-execution on MT5: single or dual entry, partial close, breakeven, trailing stop",
    "Risk-based lot sizing with daily-loss, max-position and session filters",
    "Custom canvas chart with indicators, drawing tools and a buy/sell order ticket",
    "Pine Script tokenizer, parser and interpreter written from scratch",
    "Each trader's PC is the server: local SQLite, reached remotely through a Cloudflare tunnel",
    "Master/follower copy trading between a trader's own accounts, with Inspection Mode",
    "Copy-trading marketplace: rankings, achievements, reviews, manager group chat",
    "PayPal subscriptions for traders and scheduled payouts to strategy managers",
    "Journal, notebook templates, playbooks, goals and trade replay",
    "Reports: drawdown curve, R-multiples, day × hour matrix, close reasons",
    "Admin health console with a root-cause engine, test runner and Telegram alerts",
    "Transparent overlay that names the account on each MT5 terminal window",
    "Electron installer that bundles the Python agent and the dashboard",
  ],
  beats: [
    {
      kind: "context",
      heading: "Signals arrive faster than hands",
      body: [
        "Retail traders who follow Telegram signal channels copy each call into MetaTrader 5 by hand. The message lands, they read it, open the terminal, type the lots and the levels, and by then the price has moved.",
        "Around that habit sit three more paid tools: a journal, an analytics service and a copy-trading subscription. Each wants its own account, its own fee and its own copy of the trade history.",
        "The brief was one product that listens to the channel, places the order, records it and explains the result afterwards — without a server bill that grows with every new user.",
      ].join("\n\n"),
    },
    {
      kind: "rising",
      heading: "Rebuilding the trading screen",
      body: [
        "The dashboard needed a chart traders would accept as a working screen. It is a custom canvas engine with no chart library in the dependencies: nine timeframes, Heikin-Ashi, 61 built-in indicators and about 60 drawing tools, from Fibonacci and Gann sets to harmonic patterns and long/short position tools.",
        "Traders also arrive with scripts written for TradingView. So the dashboard carries its own Pine Script engine — tokenizer, parser, syntax tree and a bar-by-bar interpreter, about 2,700 lines of TypeScript — that draws plots, shapes, fills and inputs on the same canvas.",
        "Trade Replay reuses the engine to step back through a closed trade, with drawings, emotions, tags and notes saved against it.",
      ].join("\n\n"),
      media: [
        {
          type: "image",
          src: "/media/projects/tg-auto-trader/slide-03.png",
          alt: "Trade Replay: candlestick playback with a trade note panel for emotions, tags, rating and lessons",
          width: 1690,
          height: 898,
          caption: "Trade Replay with the journal note open. Demo data.",
        },
      ],
    },
    {
      kind: "decision",
      heading: "The trader's PC is the server",
      body: [
        "Execution has to happen next to MetaTrader 5, which runs on the trader's own Windows machine. Hosting a trading backend per user would have turned every signup into a new monthly cost.",
        "So the Python desktop agent is the server. It listens to Telegram as a user client rather than a bot, parses the signal, sizes the position from the stop distance and places the order. Operational data stays in a local SQLite database with a retry queue for failed operations.",
        "The dashboard talks to the agent over a WebSocket, and a Cloudflare Quick Tunnel makes it reachable from a phone anywhere. Firestore keeps only billing, the tunnel address and public manager profiles.",
      ].join("\n\n"),
      media: [
        {
          type: "image",
          src: "/media/projects/tg-auto-trader/slide-05.png",
          alt: "Trade execution settings: single entry, dual entry and partial close modes with per-entry lot size and take-profit level",
          width: 919,
          height: 841,
          caption: "Execution settings: dual entry splits one signal into a market and a limit order.",
        },
      ],
    },
    {
      kind: "resolution",
      heading: "Zero servers per user",
      body: [
        "Each install carries its own server, database and tunnel, so the per-user infrastructure cost is zero. On the shared side, every Firestore listener was replaced with one-time reads, which took persistent connections per dashboard session from two or three down to none.",
        "Around that core sit dual entry, partial close, breakeven and trailing stops, daily-loss and max-position breakers, master/follower copy trading, a copy-trading marketplace with rankings and 27 achievements, PayPal billing and manager payouts, and an admin console that groups errors by root cause and pings Telegram when tests fail.",
        "It runs against demo MT5 accounts. Every figure in these screenshots is demo data.",
      ].join("\n\n"),
      media: [
        {
          type: "image",
          src: "/media/projects/tg-auto-trader/slide-06.png",
          alt: "Reports view with filters, report tabs and a close-reason pie chart beside a table of counts and win rates",
          width: 1222,
          height: 753,
          caption: "Reports — close-reason breakdown. Demo account data.",
        },
      ],
    },
  ],
  metrics: [
    {
      value: "61",
      label: "built-in chart indicators",
      source: `26 overlay + 35 sub-panel members of the indicator unions in web-dashboard/components/trade/types.ts, ${SRC} (own-trading.md §3F)`,
    },
    {
      value: "~60",
      label: "drawing tools",
      source: `approximate count of the DrawingTool union in web-dashboard/components/trade/types.ts, ${SRC} (own-trading.md §3F)`,
    },
    {
      value: "~2,700",
      label: "lines in the Pine Script engine",
      source: `wc -l across 7 files in web-dashboard/lib/pinescript, ${SRC} (own-trading.md §3F)`,
    },
    {
      value: "33",
      label: "dashboard pages",
      source: `find of page.tsx files in web-dashboard (21 under /dashboard), ${SRC} (own-trading.md §3F)`,
    },
    {
      value: "~16,800",
      label: "lines of Python in the desktop agent",
      source: `wc -l of desktop-app/main.py plus 19 service modules, ${SRC} (own-trading.md §3F)`,
    },
  ],
  links: [],
  order: 1,
} satisfies ProjectInput;
