import type { ProjectInput } from "../schema";

const SRC = "client-trading.md §2";

export default {
  slug: "smm-system",
  title: "SMM System — content operations",
  tier: "commission",
  chapter: "saas",
  logline:
    "A social media operating system for a trading coach: trend radar, guarded AI scripts, approvals, publishing and a revenue-weighted score.",
  industry: "Marketing technology",
  year: 2026,
  status: "built",
  role: "Full-stack developer — pipeline, workflow, publishing",
  client: "A trading coach",
  stack: [
    "Next.js",
    "TypeScript",
    "Supabase",
    "pg_cron",
    "Gemini",
    "Meta Graph API",
    "YouTube Data API",
    "shadcn/ui",
    "Vitest",
  ],
  screen: { poster: "/media/screens/smm-system.webp" },
  features: [
    "Trend radar pulling from four sources, deduplicated by content hash",
    "Free deterministic pre-filter before any AI scoring",
    "Observed facts shown apart from AI interpretation, with risk badges and overrides",
    "Approved trends become a brief, a versioned script and a video edit plan",
    "Independent AI critic whose serious findings block publishing",
    "Accuracy rules in every prompt, backed by a linter that also catches Taglish phrasing",
    "Server-enforced production workflow with role-gated steps and an audit trail",
    "Creator studio view: assigned shoots, marked done and uploaded for automatic editing",
    "Publishing to Instagram Reels, Facebook Reels and YouTube Shorts from one queue",
    "Content Score that weights purchases and sign-ups above likes",
    "AI layer with model fallback, a response cache and a daily request guard",
    "Weekly retro and funnel rollups that feed the next week's plan",
  ],
  beats: [
    {
      kind: "context",
      heading: "A content team on free tiers",
      body: [
        "A finance-education coach needed a weekly content machine running on free tiers, and every post had to stay compliant: no return promises, no broker names, education only, under local securities rules that carry criminal liability.",
        "The system covers the loop from trend to post. It finds what is trending, decides what is safe, writes the script, sends the shoot to the coach, edits the footage, publishes it, measures it and feeds the result into next week's plan.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "Deterministic first, AI second",
      body: [
        "Trends from four sources pass a pre-filter that spends nothing on AI: blocked, disaster and sensitive term lists plus region checks. Only the survivors are scored by the model, in batches, against a schema. A validator rejects invented IDs and metrics, and decision guards can only make a call safer, never riskier.",
        "The interface keeps “observed from source” apart from “AI interpretation (not verified)”. Scripts are versioned and never overwritten. Fifteen accuracy rules and a regex linter that understands Taglish phrasing back them up, and an independent AI critic can block a post from publishing.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "From brief to Reels",
      body: [
        "Approved briefs move through a server-enforced workflow — draft, assigned, shot, uploaded, editing, QA, approved, scheduled, posted — with every transition recorded. When the coach uploads footage, the automated editor picks it up and returns a cut for QA.",
        "Publishing goes to Instagram Reels, Facebook Reels and YouTube Shorts from a queue processed every five minutes; TikTok is manual by design. A Content Score weights purchases and webinar sign-ups far above likes, normalised to each platform's 30-day median.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "4",
      label: "trend sources",
      source: `source adapters in lib/social/trends.ts (${SRC}F)`,
    },
    {
      value: "15",
      label: "accuracy rules, backed by 8 regex red flags",
      source: `rules and patterns in forex-rules.ts (${SRC}F)`,
    },
    {
      value: "21",
      label: "database tables",
      source: `unique create table statements across 6 migrations (${SRC}F)`,
    },
    {
      value: "12 / ~103",
      label: "test files / cases",
      source: `grep of Vitest files and it/test calls (${SRC}E.7, §2F)`,
    },
  ],
  links: [],
  order: 11,
} satisfies ProjectInput;
