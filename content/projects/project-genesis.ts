import type { ProjectInput } from "../schema";

const SRC = "F:\Codename Project Genesis";

export default {
  slug: "project-genesis",
  title: "Project Genesis",
  tier: "archive",
  chapter: "archive",
  logline:
    "The cinematic engine this site runs on: canvas image sequences scrubbed by scroll, with text overlays locked to the same timeline.",
  industry: "Web animation engine",
  year: 2026,
  status: "built",
  role: "Solo — engine design and implementation",
  stack: ["Next.js 16", "GSAP ScrollTrigger", "Lenis", "Motion", "Canvas 2D", "sharp"],
  screen: { poster: "/media/projects/project-genesis/screen.webp", loop: "/media/projects/project-genesis/loop.mp4" },
  features: [
    "Scroll-scrubbed image sequences on one canvas, with text overlays on the same timeline",
    "Scenes authored as data: frame pattern, scroll length, overlays",
    "One GSAP ticker drives Lenis and ScrollTrigger together",
    "Frames drawn imperatively, with no React render per frame",
    "Windowed ImageBitmap cache that flips direction when scroll reverses",
    "Nearest-frame fallback, so fast scrubbing never shows a blank frame",
    "Smaller budgets on low-power devices and a static reduced-motion mode",
    "Overlays are real, crawlable text; the canvas carries an accessible label",
  ],
  beats: [],
  metrics: [
    {
      value: "0",
      label: "React renders per scroll frame",
      source: `architecture: setProgress writes a ref and drawing happens in the ticker (SequenceCanvas.tsx), ${SRC} (own-tools.md §3C, §3F)`,
    },
    {
      value: "24 + 8",
      label: "frames held ahead + behind",
      source: `window constants in lib/utils/device.ts (12 + 4 on low-power devices), ${SRC} (own-tools.md §3F)`,
    },
    {
      value: "1,305",
      label: "lines across 21 files",
      source: `wc -l of engine and app source, ${SRC} (own-tools.md §3F)`,
    },
  ],
  links: [],
  order: 3,
} satisfies ProjectInput;
