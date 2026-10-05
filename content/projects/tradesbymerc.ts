import type { ProjectInput } from "../schema";

const SRC = "F:\\merc-smc-pro-work\\trader-platform";

export default {
  slug: "tradesbymerc",
  title: "TradesByMerc",
  tier: "flagship",
  chapter: "trading",
  logline:
    "A funded-trader academy: courses with gold certificates, live rooms, a journal, peso payments and a home-built email engine.",
  industry: "Trading education",
  year: 2026,
  status: "live",
  role: "Full-stack developer — platform, payments, email engine, licensing",
  client: "TradesByMerc",
  stack: [
    "Next.js",
    "TypeScript",
    "Supabase",
    "Supabase Realtime",
    "pg_cron",
    "Stripe",
    "GCash",
    "Brevo",
    "TipTap",
    "@react-pdf/renderer",
    "Cloudinary",
    "Framer Motion",
  ],
  screen: { poster: "/media/projects/tradesbymerc/screen.webp", loop: "/media/projects/tradesbymerc/loop.mp4" },
  coldOpen: {
    type: "image",
    src: "/media/projects/tradesbymerc/cover.png",
    alt: "TradesByMerc landing page with a gold trophy hero and the academy's public track-record counters",
    width: 1366,
    height: 860,
    caption: "The public landing page at tradesbymerc.com.",
  },
  features: [
    "Courses, modules and lessons with a rich-text editor, notes and reviews",
    "Quiz builder with image questions and multiple correct answers, scored on the server",
    "Gold PDF certificates with font-metric text fitting and a public verification page",
    "Community with funded-account submissions and a leaderboard podium",
    "Live sessions with realtime chat and role-restricted access",
    "Mentorship booking with per-role monthly limits",
    "Trading journal with streaks, goals, an economic calendar and a growth simulator",
    "VIP memberships on Stripe and GCash, with peso prices set on the server",
    "Email engine: segments, campaigns, sequences, lifecycle letters, reply inbox",
    "Funnel attribution across GA4, Meta Pixel and the platform's own events",
    "MT5 indicator store with signed licence keys and protected downloads",
    "18-section admin with scheduled-job health",
  ],
  beats: [
    {
      kind: "context",
      heading: "One platform for the whole path",
      body: [
        "TradesByMerc is a mentorship academy for traders working toward funded prop-firm accounts, public under its own name at tradesbymerc.com.",
        "The platform has to carry a student the whole way: a visitor lands, signs up, takes free lessons, buys a course or a VIP membership, books mentorship, keeps a trading journal, earns a certificate and posts a funded account to the community.",
        "It also has to sell. Every lesson, webinar and checkout is a step in a funnel the coach needs to see, and every student who goes quiet is someone the platform should follow up with.",
      ].join("\n\n"),
    },
    {
      kind: "rising",
      heading: "Courses, proof and a live room",
      body: [
        "The LMS runs courses, modules and lessons with a rich-text editor and video embeds, lesson notes and course reviews. The quiz builder supports image questions and single or multiple correct answers; attempts are scored on the server, and the answer key is locked out of the client API.",
        "Passing produces a gold certificate: a PDF rendered on the server over approved plate artwork, with font-metric text fitting so a long name never breaks the layout, and a public page that verifies it.",
        "Around the courses sit a community with funded-account submissions and a podium, live sessions with realtime chat, mentorship booking with monthly limits per role, and a journal with streaks and a growth simulator.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "Build the email engine inside the platform",
      body: [
        "The academy sends on Brevo's free tier, 300 emails a day, so the marketing engine lives inside the platform and is built around that limit. A queue with a throttle and a daily cap keeps every send under it.",
        "On top sit segments, templates, campaigns, automated sequences and a ten-letter launch sequence. Lifecycle letters cover welcome, onboarding on days 2, 5 and 9, re-engagement split between never-started and stalled students, webinar invites and recaps, checkout recovery and a weekly progress digest. Replies come back through IMAP sync into a replies manager.",
        "Twelve scheduled jobs drive it from pg_cron, and each one records its own outcome so the admin dashboard shows which jobs ran.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "Payments, attribution and a licensed indicator",
      body: [
        "Payments run on two rails: Stripe checkout with a signature-verified webhook, and GCash QR payments with proof upload and admin verification. Peso prices come from the server, never from the client.",
        "Funnel events fire three ways — GA4, Meta Pixel and the platform's own table — with first-touch UTMs, so the admin funnel follows views to signups to webinar to payment by clip and campaign.",
        "The newest piece is an indicator store: members receive MT5 indicator keys signed with SHA-256, with an activation ceiling and protected downloads.",
        "The current build has 55 pages, 52 API routes, 66 migrations and an 18-section admin.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "55",
      label: "pages",
      source: `count of page.tsx files in ${SRC}, master worktree, 2026-09-28 (client-trading.md §5E/F)`,
    },
    {
      value: "52",
      label: "API routes",
      source: `count of route.ts files in ${SRC} (client-trading.md §5E/F)`,
    },
    {
      value: "66",
      label: "database migrations",
      source: `counted files in supabase/migrations of ${SRC} (client-trading.md §5E/F)`,
    },
    {
      value: "12",
      label: "scheduled jobs",
      source: `cron routes under app/api/cron in ${SRC}, driven by pg_cron (client-trading.md §5C, §5E/F)`,
    },
    {
      value: "2",
      label: "payment rails — Stripe and GCash",
      source: `api/webhooks/stripe and api/payments/gcash in ${SRC} (client-trading.md §5C)`,
    },
  ],
  links: [{ label: "tradesbymerc.com", href: "https://tradesbymerc.com", kind: "live" }],
  order: 2,
} satisfies ProjectInput;
