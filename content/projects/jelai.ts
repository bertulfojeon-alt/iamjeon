import type { ProjectInput } from "../schema";

const SRC = "F:\\JelAI";

export default {
  slug: "jelai",
  title: "JelAI",
  tier: "archive",
  chapter: "archive",
  logline:
    "An AI voice tutor in progress, built around one rule: a math engine, not the model, decides whether an answer is right.",
  industry: "Education",
  year: 2026,
  status: "in-development",
  role: "Solo: design and engineering",
  stack: ["Expo", "React Native", "TypeScript", "math.js"],
  screen: { poster: "/media/projects/jelai/screen.webp", loop: "/media/projects/jelai/loop.mp4" },
  showcase: "tutor-math-check",
  features: [
    "Correctness core that checks spoken math with math.js, never the model",
    "Handles Unicode minus and times signs and filler words from transcripts",
    "Names the specific mistake from pre-generated patterns",
    "Returns “unparseable” instead of guessing",
    "Exact matching for multiple-choice and short answers",
    "Static prototype of the live session screen",
    "Design tokens with a test that fails on any hard-coded colour",
  ],
  beats: [],
  metrics: [
    {
      value: "11",
      label: "unit tests on the correctness core",
      source: `grep of it( in src/brain/checkStudentWork.test.ts, ${SRC} (own-saas.md §3F)`,
    },
  ],
  links: [],
  order: 8,
} satisfies ProjectInput;
