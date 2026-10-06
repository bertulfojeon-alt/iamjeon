import type { ProjectInput } from "../schema";

const SRC = "F:\\claude-orchestrator";

export default {
  slug: "claude-orchestrator",
  title: "claude-orchestrator",
  tier: "archive",
  chapter: "archive",
  logline:
    "A Claude Code plugin that briefs each session from the live repo, stops silent model downgrades and measures what each skill costs.",
  industry: "Developer tools",
  year: 2026,
  status: "built",
  role: "Solo — plugin, hooks and engine",
  stack: ["Node.js", "Claude Code hooks", "Claude Code agents and skills"],
  screen: { poster: "/media/projects/claude-orchestrator/screen.webp", loop: "/media/projects/claude-orchestrator/loop.mp4" },
  showcase: "orchestrator-session",
  features: [
    "Session-start brief from the live repo: branch, changes, recent commits",
    "About 60 tokens of working standards re-injected every turn",
    "Eval harness that returns keep, experimental or cut verdicts per skill",
    "Role agents inherit the session's model instead of silently downgrading it",
    "Writes a tailored CLAUDE.md when a repo has none",
    "Zero-dependency engine: retrieval, context routing, consolidation",
    "Fail-open hooks with timeouts, so the plugin never blocks a session",
    "Credits bundled work: Madina Gbotoe's UI/UX agent (CC BY 4.0) and the ui-ux-pro-max skill",
  ],
  beats: [
    {
      kind: "decision",
      heading: "The honest pivot",
      body: [
        "The first versions defaulted to a swarm of role agents. Measured, the swarm was slow, expensive and error-prone, so version 1.0 inverted it: one equipped session, with the full pipeline opt-in, and unmeasured claims removed from the README.",
        "Along the way it found that agent files pinned to a smaller model were silently overriding a larger session model; all 14 agents now inherit the session's model. The eval harness measured one skill at 3,264 tokens per load against 510 for another, which is how the plugin decides what earns its place.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "14 / 15 / 2",
      label: "agents / skills / commands",
      source: `ls of the agents, skills and commands folders, ${SRC} (own-tools.md §4F)`,
    },
    {
      value: "32",
      label: "engine test cases",
      source: `grep of top-level test( calls in engine/test.js (changelog reports 33), ${SRC} (own-tools.md §4F)`,
    },
    {
      value: "0",
      label: "runtime dependencies",
      source: `engine README and no package.json in the engine, ${SRC} (own-tools.md §4F)`,
    },
  ],
  links: [],
  order: 4,
} satisfies ProjectInput;
