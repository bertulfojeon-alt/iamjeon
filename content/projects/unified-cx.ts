import type { ProjectInput } from "../schema";

const SRC = "F:\\Work\\Unified Telco";

export default {
  slug: "unified-cx",
  title: "Unified CX — AI voice front desk",
  tier: "commission",
  chapter: "voice",
  logline:
    "One hotline for many providers: an AI front desk finds the right company and hands the call to its own agent, in three languages.",
  industry: "Contact-centre AI for internet and cable providers",
  year: 2026,
  status: "live",
  role: "Engineer — voice runtime, phone layer, operator console",
  stack: [
    "Next.js",
    "TypeScript",
    "Supabase",
    "Gemini Live",
    "Node.js",
    "SIP / RTP",
    "Twilio Media Streams",
    "Vercel Cron",
    "Tailwind CSS",
    "Vitest",
  ],
  screen: { poster: "/media/projects/unified-cx/screen.webp", loop: "/media/projects/unified-cx/loop.mp4" },
  showcase: "voice-router",
  pitch: {
    track: "calls",
    problem: "Callers ring one hotline for many different providers and wait on hold while staff work out who they need.",
    outcome: "An AI front desk finds the right company, verifies the caller and hands the call to that company's agent, in Tagalog, Bisaya or English.",
  },
  features: [
    "Universal front desk that hands the caller to a company's own agent on the same call",
    "Tagalog, Bisaya and English, including code-switching mid-sentence",
    "Caller verification, billing, outages, tickets and callbacks through account tools",
    "Grounding ledger that walks back any claim no tool supported",
    "Real phone calls: a Twilio prototype, then a SIP-trunk worker in production",
    "Live calls board with listen-in audio and caller-mood badges",
    "Second-model QA scorecard that checks spoken figures against the tool audit",
    "CSAT surveys, follow-up texts, repeat-call detection and SLA tracking",
    "Knowledge base from CSV, Google Sheets or PDF, plus a queue of unanswered questions",
    "Area outages synced from a shared sheet and checked before anything else",
    "Desks for collections, reconnections and service tickets, scoped by city",
    "Agent workspace with tabbed settings and versioned publishing",
  ],
  beats: [
    {
      kind: "context",
      heading: "No more “press 1”",
      body: [
        "Regional internet and cable providers in the Philippines run keyword phone menus or overloaded hotlines, and their callers switch between Tagalog, Bisaya and English mid-sentence. An agent that quotes a wrong balance or a wrong outage is worse than no agent at all.",
        "Unified CX puts one number in front of many providers. A front-desk agent works out which company the caller needs and, on the same call, hands them to that company's own agent — which verifies the caller, reads the real account, files tickets and arranges callbacks.",
      ].join("\n\n"),
    },
    {
      kind: "rising",
      heading: "An agent that can't make up a bill",
      body: [
        "Speech-to-speech output can't be filtered before it is spoken, so grounding has to be a mechanism rather than a line in the prompt. A grounding ledger tracks which kinds of fact — money, outages, arrival times, references, plans — each successful tool call has granted on this leg of the call, and injects a correction when the agent claims something no tool supported.",
        "The prompt itself is split into parts — brain, hands, eyes, ears, mouth, memory, conscience — each with snapshot tests and per-tenant fingerprints, so a change in one can't silently move another. The build fails if the composed prompt grows past 35,000 characters.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "The phone layer",
      body: [
        "Browser calls were the start; real callers dial numbers. The first bridge was a lean Node service on Twilio Media Streams: μ-law audio transcoded to the model's PCM and back in 20 ms frames, side effects run only after the carrier confirms the line was played, and the agent swapped on a department hand-off without dropping the call.",
        "Production moved to a SIP-trunk worker on a VPS with its own RTP stack, an 8-to-16 kHz upsampler, a 20 ms pacer, dead-air and first-turn watchdogs and synthesised hold audio during agent swaps. Each of those behaviours is pinned by a test.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "Mission control for 8 companies",
      body: [
        "Operators run it from a dark console: live calls with listen-in and caller-mood badges, a second-model QA scorecard that checks every spoken figure against what the tools actually returned, CSAT and SLA tracking, callbacks, collections, and a nine-tab agent workspace with versioned publishing.",
        "It is live for 8 tenant companies. The agents carry 35 tool declarations, eight scheduled jobs keep outages, knowledge and QA current, and the codebase holds 117 test files with about 935 cases.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "8",
      label: "tenant companies live",
      source: `"8 live tenants" in the project CLAUDE.md, ${SRC} (work-b.md §2F, §2G)`,
    },
    {
      value: "35",
      label: "agent tool declarations",
      source: `unique name: entries in lib/agent/hands/*, lib/customer360/tools.ts and lookup_knowledge, ${SRC} (work-b.md §2F)`,
    },
    {
      value: "121",
      label: "database migrations",
      source: `ls of supabase/migrations (0001 to 0121), ${SRC} (work-b.md §2F)`,
    },
    {
      value: "117",
      label: "test files, ~935 cases",
      source: `find tests -name '*.test.ts' and a regex count of it(/test( calls, ${SRC} (work-b.md §2F)`,
    },
    {
      value: "1,969",
      label: "lines in the SIP phone worker",
      source: `wc -l of worker/sip-gemini-bridge.js, ${SRC} (work-b.md §2F)`,
    },
  ],
  links: [],
  order: 10,
} satisfies ProjectInput;
