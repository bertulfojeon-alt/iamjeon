import type { ProjectInput } from "../schema";

export default {
  slug: "resolute-ai-site",
  title: "Resolute AI — corporate site",
  tier: "archive",
  chapter: "archive",
  logline:
    "A cinematic marketing site for an AI software company: a video hero and scroll-driven animation on Next.js.",
  industry: "Corporate marketing",
  year: 2026,
  status: "live",
  role: "Front-end developer",
  stack: ["Next.js 16", "React 19", "TypeScript", "Framer Motion", "Playwright", "Vercel"],
  screen: { poster: "/media/screens/resolute-ai-site.webp" },
  coldOpen: {
    type: "image",
    src: "/media/projects/resolute/cover.png",
    alt: "Resolute AI homepage with a headline about building software at speed and an illustrated AI engine graphic",
    width: 1440,
    height: 900,
  },
  features: [
    "Cinematic video hero and scroll-driven sections",
    "Responsive layout checked at five breakpoints with a Playwright harness",
  ],
  beats: [],
  metrics: [],
  links: [{ label: "resoluteaiph.vercel.app", href: "https://resoluteaiph.vercel.app", kind: "live" }],
  order: 6,
} satisfies ProjectInput;
