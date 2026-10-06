import type { ProjectInput } from "../schema";

const SRC = "F:\Karaoke";

export default {
  slug: "karaoke",
  title: "Karaoke",
  tier: "archive",
  chapter: "archive",
  logline:
    "A zero-setup browser karaoke machine: a hand-built vocal chain with no added latency, pitch scoring, and phones as remotes.",
  industry: "Home entertainment",
  year: 2026,
  status: "local",
  role: "Solo: audio engineering, client and server",
  stack: ["Vanilla JS", "Web Audio API", "YouTube IFrame API", "Node.js http", "Server-Sent Events"],
  screen: { poster: "/media/projects/karaoke/screen.webp", loop: "/media/projects/karaoke/loop.mp4" },
  features: [
    "Opens ready to sing: mic, routing and songs set up on the first click",
    "Hand-built vocal chain with no added latency and automatic mic profiles",
    "Live pitch ribbon and videoke-style scoring with a timed score reveal",
    "Phones join a room by QR code and queue songs for the host to approve",
    "Key change, piano, acoustic and duet versions found by search",
    "Battle mode for two singers",
    "Blocked videos skipped automatically, trying other takes of the song first",
    "Voice presets and a mixer with reverb, echo and three-band tone",
  ],
  beats: [
    {
      kind: "decision",
      heading: "Latency read from the source",
      body: [
        "Chromium's built-in compressor adds a 6 ms look-ahead, and the vocal chain had three of them. Every dynamics stage was rebuilt as a side-chain follower driving gain at audio rate, which took the chain's added latency from 26.7 ms to zero.",
        "Search cost dropped from 101 YouTube quota units to 1, and cache hits cost nothing. Phones join through a QR code drawn by a hand-written encoder (Reed-Solomon over GF(256), versions 1 to 5), and the shared queue updates over Server-Sent Events. It runs on a local network only.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "26.7 → 0 ms",
      label: "added vocal-chain latency",
      source: `measurement table in CLAUDE.md ("v5 is about latency") and the buildVoiceGraph constants in public/app.js, ${SRC} (own-tools.md §2E, §2F)`,
    },
    {
      value: "101 → 1",
      label: "YouTube quota units per search",
      source: `annotate() in server.js and CLAUDE.md; 0 units on cache hits, ${SRC} (own-tools.md §2F)`,
    },
    {
      value: "0",
      label: "npm dependencies",
      source: `package.json has no dependencies, ${SRC} (own-tools.md §2F)`,
    },
  ],
  links: [],
  order: 1,
} satisfies ProjectInput;
