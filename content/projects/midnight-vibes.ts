import type { ProjectInput } from "../schema";

export default {
  slug: "midnight-vibes",
  title: "Midnight Vibes Live",
  tier: "archive",
  chapter: "archive",
  logline: "A concert event landing page with an animated hero, a live countdown and tiered ticket selection.",
  industry: "Events and ticketing",
  year: 2025,
  status: "live",
  role: "Front-end developer",
  stack: ["TypeScript", "Vite", "React", "shadcn/ui", "Tailwind CSS"],
  screen: { poster: "/media/screens/midnight-vibes.webp" },
  coldOpen: {
    type: "image",
    src: "/media/projects/midnightvibes/cover.png",
    alt: "Midnight Vibes Live landing page with event details, ticket buttons and a performer on stage",
    width: 1366,
    height: 860,
  },
  features: [
    "Animated hero with the event date, venue and a buy-tickets call to action",
    "Live countdown in days, hours, minutes and seconds",
    "Ticket tiers from general admission to VIP and meet-and-greet packages",
    "Embedded tour trailer, music player and photo gallery",
    "Venue guide: transport, parking, accessibility and entry rules",
    "FAQ, latest-updates feed, newsletter sign-up and contact form",
    "Terms and privacy policy pages",
  ],
  beats: [],
  metrics: [],
  links: [
    { label: "midnightvibeslive.vercel.app", href: "https://midnightvibeslive.vercel.app", kind: "live" },
  ],
  order: 7,
} satisfies ProjectInput;
