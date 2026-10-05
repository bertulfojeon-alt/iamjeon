import type { ProjectInput } from "../schema";

const WEB = "F:\\SMC COURSE\\SMC WEB";
const EA = "F:\\SMC COURSE\\EA";

export default {
  slug: "smc-classroom-to-algorithm",
  title: "SMC: Classroom to Algorithm",
  tier: "flagship",
  chapter: "trading",
  logline:
    "A free bilingual trading course whose charts are checked by code, and a research lab that tested whether its rules can trade.",
  industry: "Trading education and quant research",
  year: 2026,
  status: "live",
  role: "Solo — course platform, chart engine, research lab (course content by its instructor)",
  stack: [
    "Next.js",
    "TypeScript",
    "Supabase",
    "SVG",
    "Fly.io",
    "WebSockets",
    "Whisper",
    "MQL5",
    "MetaTrader 5",
    "Node.js",
  ],
  screen: { poster: "/media/projects/smc-classroom-to-algorithm/screen.webp", loop: "/media/projects/smc-classroom-to-algorithm/loop.mp4" },
  coldOpen: {
    type: "image",
    src: "/media/projects/smc-course/cover.png",
    alt: "SMC Course landing page with a fair value gap lesson preview, an English/Tagalog toggle and course stats",
    width: 1366,
    height: 860,
    caption: "The live course at freesmartmoneycourse.online.",
  },
  features: [
    "Bilingual course: every lesson block, caption and quiz item in English and Tagalog",
    "Guided charts that reveal candles and annotations step by step",
    "Validator that checks every teaching chart against its own candle data",
    "Mastery-loop quizzes: missed questions come back until none are wrong",
    "Gated final exam and a printable completion certificate",
    "Risk and position calculator with several take-profit targets",
    "Private trading journal that links each trade to the lesson it used",
    "Bilingual glossary with a page per term, and private notes with autosave",
    "Realtime community chat over a dedicated WebSocket relay, with slow-mode and bans",
    "Admin analytics: lesson completion, quiz attempts and a searchable learner table",
    "Research lab: strategy EAs in MQL5 with an on-chart panel showing each trade gate",
    "Independent JavaScript verifier that re-derives every detection from raw prices",
    "Pre-registered backtests: criteria fixed first, each idea accepted or rejected once",
  ],
  beats: [
    {
      kind: "context",
      heading: "A course that started as video",
      body: [
        "The course belongs to its instructor: recorded Smart Money Concepts lessons in Taglish, aimed at Filipino beginners who mostly learn on their phones. My part was turning that material into a platform anyone could learn from for free, and later testing whether its rules could be traded by a machine.",
        "The source was raw video, and the transcripts for Parts 1 to 4 turned out to be corrupted copies of a single lesson. They were re-transcribed from the videos with Whisper large-v3 and checked title against content before a lesson was written.",
        "The result is 23 lessons in 5 modules, with every block, caption and quiz item in English and Tagalog.",
      ].join("\n\n"),
    },
    {
      kind: "rising",
      heading: "Charts that cannot teach a wrong pattern",
      body: [
        "Lessons teach with guided charts: candles appear step by step, then the order block, the fair value gap, the entry and the stop, each with a bilingual caption.",
        "A chart that shows the wrong pattern miseducates everyone who reads it, so the charts are checked by code. A validator recomputes swing pivots, highs and lows, three-candle gaps, order-block bodies, liquidity touches and structure breaks from the candle data, and fails when an annotation claims something the candles don't show. According to the project's accuracy audit, it caught four wrong charts that human review had missed.",
        "Each lesson file also opens with a checklist that maps every transcript point to where it is taught. The build fails on any gap.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "Free to learn, free to run",
      body: [
        "A free course has to stay free to run. Lessons are static pages on the CDN. Reads go through memory and local caches before they touch the database, and writes go through server actions only. Row-level security covers all 10 tables, admin analytics run as security-invoker functions, and rate limits apply per IP and per user.",
        "The community is a realtime chat. Messages are written to Postgres, then fanned out by a small WebSocket relay on Fly.io with a replay buffer and presence, with Supabase Realtime as the fallback. The admin area is analytics and moderation: lesson completion, quiz attempts, bans.",
        "Quizzes run a mastery loop. A lesson passes at 100%.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "Then the algorithm",
      body: [
        "The instructor wanted the method traded automatically. The research lab was built to find out whether that was wise.",
        "It has nine strategy EAs in MQL5, a build where warnings fail, 221 green test fixtures, and an independent JavaScript verifier that re-derives every detection from raw prices with no shared code — 100% agreement over about 6,700 checks. Acceptance criteria were written before each run, tested once on out-of-sample years and never re-rolled.",
        "The answer was mostly no. In backtest only, the mechanical SMC rules lost 11.6R over 271 trades, so that family was closed. A scalper with a 70.8% win rate still drained its account. One candidate cleared the bar and waits for forward testing. None of this is live trading.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "23",
      label: "bilingual lessons",
      source: `lesson files in src/content/lessons (excluding index.ts) and module slugs in src/content/course.ts, ${WEB} (own-trading.md §1F)`,
    },
    {
      value: "330",
      label: "quiz and exam questions",
      source: `grep of mcq/truefalse items: 230 across lesson files + 100 in src/content/final-exam.ts, ${WEB} (own-trading.md §1F)`,
    },
    {
      value: "9",
      label: "strategy EAs tested",
      source: `Experts/*.mq5 strategy files, ${EA} (own-trading.md §2F)`,
    },
    {
      value: "~6,700",
      label: "independent detector checks, 100% agreement",
      source: `documented in docs/BACKLOG.md "Detector correctness" — verifydump.js vs MQL5 across 3 windows and 2 instruments, ${EA} (own-trading.md §2E.1) [documented]`,
    },
    {
      value: "221",
      label: "green test fixtures",
      source: `latest fixture count documented in docs/BACKLOG.md, ${EA} (own-trading.md §2E.3) [documented]`,
    },
    {
      value: "−11.6R",
      label: "BACKTEST ONLY — mechanical SMC rules, 271 trades, closed",
      source: `pooled result of the SMC mechanical family in CLAUDE.md "Verdicts" and docs/BACKLOG.md; backtest, not live, ${EA} (own-trading.md §2F)`,
    },
  ],
  links: [
    { label: "freesmartmoneycourse.online", href: "https://freesmartmoneycourse.online", kind: "live" },
  ],
  order: 3,
} satisfies ProjectInput;
