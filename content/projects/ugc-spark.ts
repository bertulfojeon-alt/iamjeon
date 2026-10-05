import type { ProjectInput } from "../schema";

const SRC = "F:\\UGC Spark";

export default {
  slug: "ugc-spark",
  title: "UGC Spark",
  tier: "archive",
  chapter: "archive",
  logline:
    "A prototype AI video studio: prompt or image to short clip, nine camera presets, and the credit cost shown before you generate.",
  industry: "Creator tools",
  year: 2026,
  status: "in-development",
  role: "Solo — design and engineering",
  stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4"],
  screen: { poster: "/media/screens/ugc-spark.webp" },
  features: [
    "Video and image studios with duration, aspect ratio and quality settings",
    "Nine camera presets, from push-in to orbit",
    "Credit ledger with an automatic, exactly-once refund on failure",
    "One provider interface; generation is simulated in this prototype",
  ],
  beats: [],
  metrics: [
    {
      value: "9",
      label: "camera presets",
      source: `presets in CameraPicker.tsx, ${SRC} (own-saas.md §4F)`,
    },
  ],
  links: [],
  order: 9,
} satisfies ProjectInput;
