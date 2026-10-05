import type { ProjectInput } from "../schema";

const SRC = "own-tools.md §5";

export default {
  slug: "unsaybalita",
  title: "UnsayBalita news-card pipeline",
  tier: "archive",
  chapter: "archive",
  logline:
    "An automated pipeline that turns a feed item into structured copy and a branded 1080×1080 news card, with a three-model fallback.",
  industry: "Content automation",
  year: 2026,
  status: "built",
  role: "Solo — workflow, rendering service, deployment",
  stack: ["n8n", "Groq", "Node.js", "Express", "Puppeteer", "Docker"],
  screen: { poster: "/media/screens/unsaybalita.webp" },
  features: [
    "Feed polled every 5 minutes, article and image fetched with fallbacks",
    "Three LLMs in an ordered fallback chain, with an alert when one fails over",
    "Strict JSON output with a three-stage repair pass and hard field limits",
    "HTML templates rendered to 1080×1080 PNGs by headless Chrome after fonts load",
    "Sample mode that runs all three models side by side for review",
    "Docker Compose with a memory cap and a health-checked one-command deploy",
    "Workflow generated from code for reproducible builds",
  ],
  beats: [],
  metrics: [
    {
      value: "3",
      label: "models in the fallback chain",
      source: `fallback node code in the production n8n workflow (${SRC}F)`,
    },
    {
      value: "14",
      label: "workflow nodes",
      source: `parsed production workflow JSON: 13 functional nodes + 1 note (${SRC}F)`,
    },
    {
      value: "1080×1080",
      label: "rendered card size",
      source: `viewport and screenshot settings in image_server.js (${SRC}F)`,
    },
  ],
  links: [],
  order: 5,
} satisfies ProjectInput;
