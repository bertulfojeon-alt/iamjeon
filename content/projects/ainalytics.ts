import type { ProjectInput } from "../schema";

const SRC = "F:\\Work\\AI Analytcis";

export default {
  slug: "ainalytics",
  title: "Ainalytics — AI chief of staff",
  tier: "commission",
  chapter: "voice",
  logline:
    "A voice-first business advisor that answers from the company's own data, presents each metric on screen and never invents a number.",
  industry: "Business intelligence for small and mid-size companies",
  year: 2026,
  status: "live",
  role: "Engineer — metric engine, voice presenter, exports",
  stack: [
    "Next.js",
    "TypeScript",
    "AI SDK",
    "Realtime speech-to-speech AI",
    "Supabase",
    "Recharts",
    "Headless Chromium",
    "Resend",
    "Vercel Cron",
  ],
  screen: { poster: "/media/projects/ainalytics/screen.webp", loop: "/media/projects/ainalytics/loop.mp4" },
  showcase: "ainalytics-presenter",
  features: [
    "Answers business questions by chat or voice from the company's own connected data",
    "Voice presenter that shows each chart as it speaks and highlights the number it names",
    "Deterministic metric engine that asks which metric you meant instead of guessing",
    "Explain-why driver analysis that won't blame a segment when a move is spread out",
    "Connects spreadsheets, shared Google Sheets and read-only Postgres",
    "Proposed metric catalogue the owner confirms before it is used",
    "Chart chosen by the insight: waterfall, composition, weekday heatmap or trend",
    "Weekday-aware anomaly alerts with a narrated cause",
    "Morning briefing email with a clear warning when the data is stale",
    "PDF and image exports, share links with previews and saved recipients",
    "Proposals, NDAs and agreements priced from a catalogue, with version-bound approval",
    "Operator console: tenants, users, read-only view-as and client error triage",
  ],
  beats: [
    {
      kind: "context",
      heading: "Data everywhere, analyst nowhere",
      body: [
        "Owners of small and mid-size businesses keep their numbers in spreadsheets, point-of-sale exports and databases, and decide on instinct because there is no analyst to ask.",
        "Ainalytics connects to that data — uploaded spreadsheets, shared Google Sheets, read-only Postgres — and proposes a catalogue of metrics for the owner to confirm. From then on it answers questions about them in plain language or by voice, watches for anomalies, and emails a briefing every morning at 6 a.m.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "The model never computes a number",
      body: [
        "An advisor that is confidently wrong is worse than none, so the language model only reads intent. Numbers come from a deterministic metric engine. An unknown or ambiguous metric returns a structured error that forces “I don't have that” or a clarifying question. Driver analysis explains what moved a metric, and refuses to name a driver when the change is spread thin.",
        "Even the verdict — on track, watch, off target — and the bottom-line sentence are computed in code. A production bug in which one metric silently returned another's value was caught and pinned by a behaviour smoke test.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "It presents, it doesn't chat",
      body: [
        "In voice mode the assistant speaks one metric at a time while the matching chart lands on screen and the value pulses as it is named. The model calls a showChart tool at the moment it starts talking about a metric, instead of the interface guessing from the transcript. Its short-lived session token locks the whole configuration, after testing showed that locking only the model silently dropped the tools.",
        "Mid-call, “email me this” produces a PDF. Exports render in headless Chromium and are deduplicated by content hash, which cut render time from about 19–25 s to 7–12 s, and to 1.1–1.5 s on repeat.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "22",
      label: "page routes",
      source: `find web/app -name page.tsx, ${SRC} (work-b.md §1F)`,
    },
    {
      value: "28",
      label: "database tables",
      source: `unique create table statements across 19 Supabase migrations, ${SRC} (work-b.md §1F)`,
    },
    {
      value: "21 / 23",
      label: "chat tools / voice function declarations",
      source: `tool({ in lib/ai/tools.ts (4) + lib/ai/document-tools.ts (17); voiceFunctionDeclarations (5) + document declarations (18), ${SRC} (work-b.md §1F)`,
    },
    {
      value: "6",
      label: "insight-picked chart types",
      source: `waterfall, composition, heatmap, groups, trend and flat in lib/report/visual.ts, ${SRC} (work-b.md §1F)`,
    },
    {
      value: "77",
      label: "test and live-verification scripts",
      source: `ls of web/scripts (about 29 unit-style, about 40 live verify/smoke), ${SRC} (work-b.md §1F)`,
    },
  ],
  links: [],
  order: 11,
} satisfies ProjectInput;
