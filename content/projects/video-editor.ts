import type { ProjectInput } from "../schema";

const SRC = "client-trading.md §3";

export default {
  slug: "video-editor",
  title: "Automated Short-Form Editor",
  tier: "commission",
  chapter: "saas",
  logline:
    "A local editor that turns a raw recording into a captioned, sound-designed 9:16 short, mastered to −14 LUFS.",
  industry: "Media tools",
  year: 2026,
  status: "local",
  role: "Developer — analysis, timeline engine, render and audio",
  client: "A trading coach",
  stack: [
    "Remotion 4",
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "faster-whisper",
    "OpenCV",
    "FFmpeg",
    "Gemini",
  ],
  screen: { poster: "/media/projects/video-editor/screen.webp", loop: "/media/projects/video-editor/loop.mp4" },
  coldOpen: {
    type: "video",
    src: "/media/projects/video-editor/loop.mp4",
    poster: "/media/projects/video-editor/screen.webp",
    alt: "A finished vertical short from the editor: chart breakdown with word-pop Taglish captions and a hook title",
    width: 960,
    height: 600,
    caption: "Raw recording in, finished 9:16 edit out — captions, punch-ins and sound design are automatic.",
  },
  features: [
    "Word-timed Taglish transcription and glossary-corrected word-pop captions",
    "Emphasis detection that drives face-tracked punch-ins",
    "Payoff-first story cut with dead air removed",
    "16 transition types that never repeat back to back",
    "141-sound catalogue and a mood-matched, ducked music bed",
    "Compliance crops that hide P&L widgets",
    "One command from raw clip to final render and QC contact sheet",
  ],
  beats: [
    {
      kind: "context",
      heading: "Recorded, never edited",
      body: [
        "A trading coach recorded clips but had no editor. The finished videos had to look produced, and they had to hide live P&L widgets, which finance ads don't allow — at near-zero cost, on a Windows PC.",
        "One command now takes a raw phone or screen recording to a finished 1080×1920 short with captions, music and sound design, plus a contact sheet of every cut for quality control. The editor can also run on its own when the content system hands it new footage.",
      ].join("\n\n"),
    },
    {
      kind: "rising",
      heading: "Listening for emphasis",
      body: [
        "The analysis stage is Python: faster-whisper for word timings, OpenCV for the face, scene changes and the cursor on chart recordings, and a scanner that finds P&L regions to crop. Vocal emphasis is measured from 50 ms loudness and brightness, smoothed to word scale, and places face-tracked punch-ins; manual punch-ins always win.",
        "The timeline engine restructures each clip payoff-first, removes dead air and keeps nothing static for more than six seconds. A transition engine picks from 16 types and never repeats a move back to back — except where meaning wins: a flash for a win, a dip for weight.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "Mastered like broadcast",
      body: [
        "Remotion renders the cut with word-pop captions checked against a trading glossary, a music bed chosen by mood from a loudness-measured catalogue and ducked under speech, and reaction sounds drawn from a 141-sound library. The mix is mastered to −14 LUFS integrated and −1.5 dBTP.",
        "When the content system sees new footage, a worker downloads it, authors the edit, renders and returns it for review. After two failures the job is parked for a human.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "16",
      label: "transition types",
      source: `TransitionSpec kinds in BoundaryFx.tsx — 14 rotating + flash/dip; the README's "15" is stale (${SRC}F)`,
    },
    {
      value: "141",
      label: "catalogued sound effects in 16 categories",
      source: `sum of entries in sfx-manifest.json (${SRC}F)`,
    },
    {
      value: "−14 LUFS",
      label: "integrated loudness, −1.5 dBTP",
      source: `loudnorm=I=-14:TP=-1.5:LRA=11 in scripts/make.mjs line 46 (${SRC}F)`,
    },
    {
      value: "1080×1920",
      label: "output at 30 fps",
      source: `output constants in src/brand.ts (${SRC}F)`,
    },
  ],
  links: [],
  order: 12,
} satisfies ProjectInput;
