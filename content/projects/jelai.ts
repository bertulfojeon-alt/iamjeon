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
  role: "Solo — design and engineering",
  stack: ["Expo", "React Native", "TypeScript", "math.js"],
  screen: { poster: "/media/screens/jelai.webp" },
  features: [
    "Built: a correctness core that checks spoken math with math.js",
    "Built: handles Unicode minus and times signs and filler words from transcripts",
    "Built: names the specific mistake from pre-generated patterns",
    "Built: returns “unparseable” instead of guessing",
    "Designed, not yet built: the realtime voice tutor, homework capture and hint ladder",
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
