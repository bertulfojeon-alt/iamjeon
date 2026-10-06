import type { ProjectInput } from "../schema";

export default {
  slug: "resolute-ai-site",
  title: "Resolute AI: corporate site",
  tier: "archive",
  chapter: "archive",
  logline:
    "A cinematic marketing site for an AI software company: a video hero and scroll-driven animation on Next.js.",
  industry: "Corporate marketing",
  year: 2026,
  status: "live",
  role: "Front-end developer",
  stack: ["Next.js 16", "React 19", "TypeScript", "Framer Motion", "Playwright", "Vercel"],
  screen: { poster: "/media/projects/resolute-ai-site/screen.webp", loop: "/media/projects/resolute-ai-site/loop.mp4" },
  coldOpen: {
    type: "image",
    src: "/media/projects/resolute/cover.png",
    alt: "Resolute AI homepage with a headline about building software at speed and an illustrated AI engine graphic",
    width: 1440,
    height: 900,
  },
  features: [
    "Cinematic video hero and scroll-driven sections",
    "WebGL 3D centrepiece behind the page, moved scene by scene by GSAP ScrollTrigger",
    "Floating live-voice agent that answers visitors and captures leads",
    "Product catalogue with a detail page and share image for each system",
    "Staff dashboard for leads, team invitations and voice-agent personas and knowledge",
    "Contact form with rate limiting and email delivery",
    "Static fallback for reduced motion and lighter scenes on mobile",
    "Responsive layout checked at five breakpoints with a Playwright harness",
  ],
  beats: [],
  metrics: [],
  links: [{ label: "resoluteaiph.vercel.app", href: "https://resoluteaiph.vercel.app", kind: "live" }],
  order: 6,
} satisfies ProjectInput;
