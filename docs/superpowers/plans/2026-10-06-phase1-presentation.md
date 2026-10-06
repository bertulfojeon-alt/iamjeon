# Phase 1 — The Presentation: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark card-grid desk and the blog-style case modal with a light, business-first presentation on the monitor, and turn the welcome into a film-style opening aimed at business owners. No AI in this phase.

**Architecture:** A pure stage reducer (`features/stage/stage.ts`) owns what the monitor shows (explore menu, a project scene, or About/Side projects/Contact); the light screen components render it, and Phase 2's assistant will dispatch the same commands. Projects gain a `pitch` (business track, problem, outcome) and `spotlights` (feature markers on the screen image). The case study keeps its `/work/[slug]` routes but becomes a full-viewport light "takeover" told as scenes. Light colours come from re-scoping the existing CSS tokens under `.screen-light`, so existing components that use the tokens turn light without rewrites.

**Tech Stack:** Next.js 16 App Router, React 19 (`<ViewTransition>`), TypeScript, Tailwind v4 tokens in `app/globals.css`, CSS modules, Lenis, zod, Vitest, Playwright (system Edge).

**Spec:** `docs/specs/2026-10-06-shift-assistant-design.md` (Parts 1–2 and Part 4 "Content additions"; Phase 1 of "Build order").

## Global Constraints

- Gates before any "done": `npm test && npm run build && npm run test:e2e`, and the build's leak check prints "clean".
- Public repo: classified projects (PROJECT PAYDAY / FACEGATE / BALANCE SHEET) never carry a real product name, client, domain, logo or sample-company name; new copy is scanned by the existing hashed denylist tests.
- Every number shown must come from `metrics` (which carry a `source`); `pitch` text contains **no digits**.
- Dark stays for the two videos and the site around them (welcome, film, HUD). Everything shown **on** the monitor, and the case view, is light.
- Light palette (must meet WCAG AA on the light background): paper `#f5f1ea`, ink `#16181d`, dim `#575d67`, accent `#a04a08`.
- Type: Big Shoulders (display) / Hanken Grotesk (body). No mono labels, no zero-padded numbering (01/02/03), no count-up stats, no fade-up on every section.
- Copy must avoid: elevate, seamless, unleash, revolutionize, cutting-edge, game-changer, supercharge (existing test).
- Still mode (`html[data-mode="still"]`: reduced motion, data saver, Pause motion) stays fully readable with no motion.
- Tracks, in this order: `calls` "Calls & messages", `trading` "Trading", `admin` "Admin & back-office", `other` "More work".
- Welcome copy: headline "While your office sleeps, your systems keep working."; rotating line "…answering your calls." / "…placing your trades." / "…running your payroll."; credit "A night shift by Loreto “Jeon” Saquilabon Jr. · Full-stack developer & AI automation engineer"; buttons "See what I'd build for you" (plays the film) and "Get in touch".
- Do not touch `F:\EZVibe`. Do not push to `main` or replace production.

## Review Focus

1. **The monitor at common window sizes** — at 1280×720, 1440×900 and 1920×1080 the explore menu and a scene fit the monitor with no inner scrollbar (the critique's main complaint). Pinned in Task 5.
2. **Keyboard-only visitors** — Tab reaches the explore list, Enter opens a scene, and "How does it work?" is reachable and opens the case. Pinned in Task 5.
3. **Browser Back from an open case** returns to the desk with the same scene still showing, not to the welcome. Pinned in Task 7.
4. **"Get in touch" / HUD "Contact" pressed on the welcome, before the film** lands on the desk with the Contact view, without playing the film. Pinned in Task 6.
5. **Visitor time zone edge cases** — same zone as Manila (no second clock), an invalid or missing zone (no crash, no second clock). Pinned in Task 9.

---

## File map

| File | Responsibility |
|---|---|
| `content/tracks.ts` (new) | `TRACKS`, `Track`, `TRACK_TITLES`, `TRACK_LINES` — tiny, safe to import in client components |
| `content/schema.ts` | adds `pitch` and `spotlights` |
| `content/index.ts` | re-exports tracks; `projectsInTrack()` |
| `content/projects/*.ts` | pitch copy (14 files) and spotlights (10 files) |
| `features/stage/stage.ts` (new) | stage view/command types and the pure reducer |
| `components/screen/Screen.tsx` + `.module.css` (new) | the light monitor UI: bar, view switch |
| `components/screen/ExploreMenu.tsx` + `.module.css` (new) | chapter menu: groups list + large preview |
| `components/screen/ProjectScene.tsx` + `.module.css` (new) | one project: problem → result, window with spotlights |
| `components/screen/Spotlights.tsx` + `.module.css` (new) | amber markers with labels over a screen image |
| `components/screen/ContactView.tsx` + `.module.css` (new) | contact on the light screen |
| `components/theatre/Theatre.tsx` | uses `Screen`; `ns:open` / `ns:play` handling; renders `Welcome` |
| `components/theatre/Welcome.tsx` + `.module.css` (new) | the film-style opening copy |
| `components/theatre/RotatingLine.tsx` (new) | typed rotating line |
| `lib/clock.ts` + `lib/clock.test.ts` (new) | "here / where you are" clock line |
| `components/ui/Modal.tsx` / `.module.css` | adds `size="takeover"` |
| `components/case/CaseStudy.tsx` / `.module.css` | case told as scenes |
| `components/case/FeatureScenes.tsx` + `.module.css` (new) | sticky screen + features with spotlights |
| `components/hud/Hud.tsx` / `.module.css` | dark backdrop on light pages |
| `app/page.tsx` | builds `ScreenItem[]` |
| `app/work/[slug]/page.tsx` | light page |
| `app/globals.css` | `.screen-light` token scope |
| deleted | `components/theatre/Desktop.tsx`, `Desktop.module.css`, `Panels.tsx`, `Panels.module.css` |

---

### Task 1: Tracks and the new content fields

**Files:**
- Create: `content/tracks.ts`
- Modify: `content/schema.ts`, `content/index.ts`
- Test: `content/content.test.ts`

**Interfaces:**
- Produces: `TRACKS: readonly ["calls","trading","admin","other"]`, `type Track`, `TRACK_TITLES: Record<Track,string>`, `TRACK_LINES: Record<Track,string>` (from `content/tracks.ts`); `Project["pitch"]: { track: Track; problem: string; outcome: string } | undefined`; `Project["spotlights"]: { feature: string; x: number; y: number; label: string }[]`; `projectsInTrack(track: Track): Project[]` (from `content/index.ts`).

- [ ] **Step 1: Write the failing tests** — append to `content/content.test.ts`:

```ts
import { projectSchema } from "./schema";
import { projectsInTrack } from "./index";
import { TRACKS } from "./tracks";

describe("pitch and spotlights", () => {
  const base = projects.find((p) => p.slug === "tg-auto-trader")!;

  it("accepts a pitch and spotlights that name a real feature", () => {
    const ok = projectSchema.safeParse({
      ...base,
      pitch: { track: "trading", problem: "Traders copy signals by hand and miss the price.", outcome: "Signals become orders in moments, sized to risk." },
      spotlights: [{ feature: base.features[0], x: 40, y: 30, label: "Signal parser" }],
    });
    expect(ok.success).toBe(true);
  });

  it("rejects a spotlight for a feature the project does not list", () => {
    const bad = projectSchema.safeParse({ ...base, spotlights: [{ feature: "Not a feature at all", x: 10, y: 10, label: "Nope" }] });
    expect(bad.success).toBe(false);
  });

  it("rejects more than three spotlights and coordinates outside 0–100", () => {
    const four = Array.from({ length: 4 }, (_, i) => ({ feature: base.features[i], x: 10, y: 10, label: "Spot" }));
    expect(projectSchema.safeParse({ ...base, spotlights: four }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, spotlights: [{ feature: base.features[0], x: 120, y: 10, label: "Spot" }] }).success).toBe(false);
  });

  it("groups case studies by track in the declared order", () => {
    expect(TRACKS).toEqual(["calls", "trading", "admin", "other"]);
    for (const t of TRACKS) for (const p of projectsInTrack(t)) expect(p.pitch?.track).toBe(t);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run content/content.test.ts`
Expected: FAIL — `Cannot find module './tracks'` / `projectsInTrack` is not exported.

- [ ] **Step 3: Create `content/tracks.ts`**

```ts
/**
 * Business tracks — how the work is grouped for clients (by the problem it solves,
 * not by technology). Kept free of project data so client components can import it.
 */

export const TRACKS = ["calls", "trading", "admin", "other"] as const;
export type Track = (typeof TRACKS)[number];

export const TRACK_TITLES: Record<Track, string> = {
  calls: "Calls & messages",
  trading: "Trading",
  admin: "Admin & back-office",
  other: "More work",
};

/** One line under each group in the explore menu. */
export const TRACK_LINES: Record<Track, string> = {
  calls: "Every call, chat and email answered, day and night.",
  trading: "Desks, academies and tools for traders and their coaches.",
  admin: "Payroll, attendance and books. Client work under NDA.",
  other: "Products and tools built along the way.",
};
```

- [ ] **Step 4: Extend `content/schema.ts`** — add the import at the top, the two field schemas next to `metric`, the fields in the object, and the refinement:

```ts
import { TRACKS } from "./tracks";
```

```ts
const pitch = z.object({
  track: z.enum(TRACKS),
  /** The problem in the client's own words. No digits: numbers live in `metrics`. */
  problem: z.string().min(20).max(170),
  /** What changed, in plain language. No digits. */
  outcome: z.string().min(20).max(170),
});

const spotlight = z.object({
  /** Must equal one of the project's `features`. */
  feature: z.string(),
  /** Marker position as a percentage of the screen image (`screen.poster`). */
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  label: z.string().min(3).max(42),
});
```

In the `z.object({...})` after `features`:

```ts
    pitch: pitch.optional(),
    spotlights: z.array(spotlight).max(3).default([]),
```

Inside `superRefine`, after the existing checks:

```ts
    for (const s of p.spotlights) {
      if (!p.features.includes(s.feature)) {
        ctx.addIssue({ code: "custom", message: `${p.slug}: spotlight "${s.label}" names a feature the project does not list` });
      }
    }
```

- [ ] **Step 5: Extend `content/index.ts`** — add after the imports and after `caseStudyProjects`:

```ts
import type { Track } from "./tracks";
export { TRACKS, TRACK_TITLES, TRACK_LINES, type Track } from "./tracks";
```

```ts
/** Case studies in a business track, in wall order. */
export function projectsInTrack(track: Track): Project[] {
  return caseStudyProjects().filter((p) => p.pitch?.track === track);
}
```

- [ ] **Step 6: Run to verify they pass**

Run: `npx vitest run content/content.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add content/tracks.ts content/schema.ts content/index.ts content/content.test.ts
git commit -m "Content: business tracks, pitch and spotlights fields"
```

---

### Task 2: Pitch copy for every case study

**Files:**
- Modify: the 14 case-study files in `content/projects/` (listed below)
- Test: `content/content.test.ts`

**Interfaces:**
- Consumes: `pitch` field (Task 1), `caseStudyProjects()`.
- Produces: every case study has `pitch`; track membership used by Tasks 5–6.

- [ ] **Step 1: Write the failing test** — append inside `describe("pitch and spotlights", …)`:

```ts
  it("gives every case study a pitch with no digits, in the agreed tracks", () => {
    const tracks: Record<string, string> = {
      "247aisupports": "calls", "unified-cx": "calls",
      "tg-auto-trader": "trading", tradesbymerc: "trading", "the-alpha-room": "trading",
      "smc-classroom-to-algorithm": "trading", "merc-smc-pro": "trading",
      "project-payday": "admin", "project-facegate": "admin", "project-balance-sheet": "admin",
      ainalytics: "other", ezvibe: "other", "smm-system": "other", "video-editor": "other",
    };
    for (const p of caseStudyProjects()) {
      expect(p.pitch, p.slug).toBeDefined();
      expect(p.pitch!.track, p.slug).toBe(tracks[p.slug]);
      expect(/\d/.test(p.pitch!.problem + p.pitch!.outcome), `${p.slug} pitch has a digit`).toBe(false);
    }
  });
```

and add `caseStudyProjects` to the import from `./index`.

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run content/content.test.ts -t "pitch with no digits"`
Expected: FAIL — `tg-auto-trader: expected undefined to be defined`.

- [ ] **Step 3: Add the pitches** — in each file insert the `pitch` property directly above `features:`:

`content/projects/247aisupports.ts`
```ts
  pitch: {
    track: "calls",
    problem: "Calls, chats and emails come in after hours and on weekends, and every unanswered one is a customer who goes somewhere else.",
    outcome: "An AI receptionist answers every call, chat and email from the business's own documents, and hands over to staff when a person is needed.",
  },
```
`content/projects/unified-cx.ts`
```ts
  pitch: {
    track: "calls",
    problem: "Callers ring one hotline for many different providers and wait on hold while staff work out who they need.",
    outcome: "An AI front desk finds the right company, verifies the caller and hands the call to that company's agent, in Tagalog, Bisaya or English.",
  },
```
`content/projects/tg-auto-trader.ts`
```ts
  pitch: {
    track: "trading",
    problem: "Traders copy signals from Telegram into MetaTrader by hand, and by the time the order is in, the price has moved.",
    outcome: "Signals become orders on MetaTrader in moments, sized to the trader's risk, with charts, copy trading and a journal in one desk.",
  },
```
`content/projects/tradesbymerc.ts`
```ts
  pitch: {
    track: "trading",
    problem: "A trading mentor's courses, live rooms, payments and emails are spread across paid tools that don't talk to each other.",
    outcome: "One academy runs it all: courses with certificates, live sessions, memberships paid by card or GCash, and the mentor's own email engine.",
  },
```
`content/projects/the-alpha-room.ts`
```ts
  pitch: {
    track: "trading",
    problem: "A trading coach can't see how each student is really trading until the student sends screenshots, usually too late.",
    outcome: "Students' accounts sync on their own into a journal and charting desk, and the coach sees who needs attention first.",
  },
```
`content/projects/smc-classroom-to-algorithm.ts`
```ts
  pitch: {
    track: "trading",
    problem: "Trading lessons teach patterns from hand-drawn examples, and nobody checks whether the examples or the rules hold up.",
    outcome: "A free course in English and Tagalog whose every chart is checked by code, and a lab that tested the rules before anyone traded them.",
  },
```
`content/projects/merc-smc-pro.ts`
```ts
  pitch: {
    track: "trading",
    problem: "Smart-money traders mark structure, order blocks and liquidity by hand on every chart, and paid tools get shared for free.",
    outcome: "A MetaTrader indicator draws and scores it all live, and its licence is locked offline to one account and one expiry date.",
  },
```
`content/projects/project-payday.ts`
```ts
  pitch: {
    track: "admin",
    problem: "Payroll week means chasing timesheets, checking who really showed up, and recomputing deductions and premiums by hand.",
    outcome: "Clock-ins are checked by location and face, and payroll computes government deductions and premiums, then locks once approved.",
  },
```
`content/projects/project-facegate.ts`
```ts
  pitch: {
    track: "admin",
    problem: "Attendance kiosks can be fooled by a photo held up to the camera, so someone can clock in for a friend.",
    outcome: "A liveness check asks for a blink or a head turn and logs every trial, so photos are caught and pass rates are measured.",
  },
```
`content/projects/project-balance-sheet.ts`
```ts
  pitch: {
    track: "admin",
    problem: "Small businesses keep receipts in a drawer and rebuild their VAT and tax filings from scratch every quarter.",
    outcome: "Cloud books on a double-entry engine: receipts are scanned with VAT rules applied, and reports and BIR deadlines come from the journal.",
  },
```
`content/projects/ainalytics.ts`
```ts
  pitch: {
    track: "other",
    problem: "Owners want to know why sales moved, but the answer is buried in spreadsheets nobody has time to read.",
    outcome: "Ask out loud and an AI advisor answers from the company's own data, showing each chart as it speaks, and never invents a number.",
  },
```
`content/projects/ezvibe.ts`
```ts
  pitch: {
    track: "other",
    problem: "Running several AI coding agents at once means one of them eventually pushes code with the wrong account.",
    outcome: "A Windows terminal where every tab carries its own identity, so each agent works, signs and deploys as the right account.",
  },
```
`content/projects/smm-system.ts`
```ts
  pitch: {
    track: "other",
    problem: "A small team has to post every day, and AI-written scripts keep getting facts wrong in public.",
    outcome: "Trends become scripts, an AI critic blocks inaccurate ones, and approved videos publish to every platform from one queue.",
  },
```
`content/projects/video-editor.ts`
```ts
  pitch: {
    track: "other",
    problem: "Turning one raw recording into a polished vertical short takes an editor most of an afternoon.",
    outcome: "One command turns the recording into a captioned, sound-designed short, ready for TikTok, Reels and Shorts.",
  },
```

- [ ] **Step 4: Run to verify it passes** (also re-runs the denylist and slop tests over the new strings)

Run: `npx vitest run content/content.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add content/projects content/content.test.ts
git commit -m "Content: business pitch for every case study"
```

---

### Task 3: Spotlights for the ten tour projects

**Files:**
- Modify: `content/projects/{247aisupports,unified-cx,tg-auto-trader,tradesbymerc,the-alpha-room,smc-classroom-to-algorithm,merc-smc-pro,project-payday,project-facegate,project-balance-sheet}.ts`
- Test: `content/content.test.ts`

**Interfaces:**
- Consumes: `spotlights` field (Task 1).
- Produces: 2–3 spotlights on every project whose track is not `other`; positions are percentages of `screen.poster`.

- [ ] **Step 1: Write the failing test** — append inside `describe("pitch and spotlights", …)`:

```ts
  it("gives every project in the calls, trading and admin tracks two or three spotlights", () => {
    for (const p of caseStudyProjects().filter((x) => x.pitch && x.pitch.track !== "other")) {
      expect(p.spotlights.length, p.slug).toBeGreaterThanOrEqual(2);
      expect(p.spotlights.length, p.slug).toBeLessThanOrEqual(3);
    }
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run content/content.test.ts -t "two or three spotlights"`
Expected: FAIL — `247aisupports: expected 0 to be greater than or equal to 2`.

- [ ] **Step 3: Render each poster with a 10 % grid and read positions**

Run (Git Bash):
```bash
S="$TEMP/spot-grids"; mkdir -p "$S"
for s in 247aisupports unified-cx tg-auto-trader tradesbymerc the-alpha-room smc-classroom-to-algorithm merc-smc-pro project-payday project-facegate project-balance-sheet; do
  ffmpeg -loglevel error -y -i "public/media/projects/$s/screen.webp" -vf "drawgrid=w=iw/10:h=ih/10:t=2:c=red@0.7" "$S/$s.png"
done; ls "$S"
```
Open each PNG with the Read tool. For each project pick the features below (exact strings — copy them from the file's `features` array), find where that part of the UI appears on the image, and record its centre as `x` = column × 10 + offset, `y` = row × 10 + offset (percent, 0–100). If a listed feature is not visible on the image, use the alternate; if neither is visible, place the marker on the panel nearest in meaning (e.g. a chart for a reporting feature).

| Project | Feature (index in `features`) → label | Alternate |
|---|---|---|
| 247aisupports | f0 → "Answers calls in the browser"; f4 → "Queue that never drops a call"; f2 → "Answers from your documents" | f8 → "Staff can take over" |
| unified-cx | f0 → "Routes callers to the right company"; f1 → "Tagalog, Bisaya and English"; f5 → "Live calls board" | f2 → "Verifies the caller" |
| tg-auto-trader | f3 → "Chart with an order ticket"; f1 → "Places the signal on MetaTrader"; f2 → "Lot size from your risk" | f10 → "Reports" |
| tradesbymerc | f0 → "Courses and lessons"; f3 → "Memberships by card or GCash"; f5 → "Community leaderboard" | f1 → "Gold certificates" |
| the-alpha-room | f2 → "Equity and trade stats"; f4 → "Journal"; f6 → "Leaderboards" | f3 → "Coach console" |
| smc-classroom-to-algorithm | f1 → "Step-by-step chart lessons"; f0 → "English and Tagalog"; f3 → "Quizzes that loop" | f4 → "Final exam and certificate" |
| merc-smc-pro | f1 → "Order blocks scored live"; f0 → "Market structure"; f4 → "Liquidity sweeps" | f2 → "Fair value gaps" |
| project-payday | f0 → "Clock-in checked by place and face"; f2 → "Payroll locks once approved"; f1 → "Government deductions" | f7 → "Employee portal" |
| project-facegate | f0 → "Blink or turn challenge"; f5 → "Every trial logged" | f1 → "Face alignment" |
| project-balance-sheet | f1 → "Receipts scanned with VAT rules"; f3 → "Reports from the journal"; f4 → "VAT and BIR calendar" | f2 → "Bank feed reconciliation" |

- [ ] **Step 4: Write the spotlights** — in each file insert directly below `pitch`, using `features[i]` by reference so the strings cannot drift. Example for `tg-auto-trader.ts` (structure identical for all ten; `x`/`y` are the values read in Step 3):

```ts
// at the top of the file, above the default export object:
const features = [
  /* move the existing features array literal here, unchanged */
];
```
```ts
  features,
  spotlights: [
    { feature: features[3], x: 62, y: 48, label: "Chart with an order ticket" },
    { feature: features[1], x: 88, y: 40, label: "Places the signal on MetaTrader" },
    { feature: features[2], x: 88, y: 63, label: "Lot size from your risk" },
  ],
```
(The `x`/`y` shown are the format, replace each with the measured value. Hoisting `features` into a `const` keeps the existing array verbatim while letting `spotlights` reference it.)

- [ ] **Step 5: Check the markers visually** — render one project's markers to confirm the reading convention:

```bash
ffmpeg -loglevel error -y -i public/media/projects/tg-auto-trader/screen.webp -vf "drawbox=x=iw*0.62-8:y=ih*0.48-8:w=16:h=16:c=orange:t=fill" "$TEMP/spot-grids/check.png"
```
Open `check.png`; the orange square must sit on the chart. Fix any project whose marker misses its panel.

- [ ] **Step 6: Run to verify it passes**

Run: `npx vitest run content/content.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add content/projects content/content.test.ts
git commit -m "Content: spotlights for the calls, trading and admin projects"
```

---

### Task 4: The stage reducer

**Files:**
- Create: `features/stage/stage.ts`
- Test: `features/stage/stage.test.ts`

**Interfaces:**
- Consumes: `Track` from `content/tracks.ts`.
- Produces:
```ts
export type Panel = "about" | "side" | "contact";
export type StageView =
  | { kind: "explore"; focus: string }
  | { kind: "scene"; slug: string }
  | { kind: "panel"; panel: Panel };
export type StageCommand =
  | { type: "explore"; focus?: string }
  | { type: "focus"; slug: string }
  | { type: "show"; slug: string }
  | { type: "next" }
  | { type: "panel"; panel: Panel };
export interface StageWorld { order: string[]; trackOf: Record<string, Track> }
export function initialStage(world: StageWorld): StageView;
export function stageReducer(world: StageWorld): (state: StageView, command: StageCommand) => StageView;
```

- [ ] **Step 1: Write the failing tests** — `features/stage/stage.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { initialStage, stageReducer, type StageWorld } from "./stage";

const world: StageWorld = {
  order: ["calls-a", "calls-b", "trade-a"],
  trackOf: { "calls-a": "calls", "calls-b": "calls", "trade-a": "trading" },
};
const reduce = stageReducer(world);

describe("stage", () => {
  it("starts on explore, focused on the first project", () => {
    expect(initialStage(world)).toEqual({ kind: "explore", focus: "calls-a" });
  });

  it("focuses and shows known projects", () => {
    const s0 = initialStage(world);
    expect(reduce(s0, { type: "focus", slug: "trade-a" })).toEqual({ kind: "explore", focus: "trade-a" });
    expect(reduce(s0, { type: "show", slug: "calls-b" })).toEqual({ kind: "scene", slug: "calls-b" });
  });

  it("ignores unknown slugs and returns the same state", () => {
    const s0 = initialStage(world);
    expect(reduce(s0, { type: "show", slug: "nope" })).toBe(s0);
    expect(reduce(s0, { type: "focus", slug: "nope" })).toBe(s0);
  });

  it("'next' moves within the scene's track and wraps", () => {
    expect(reduce({ kind: "scene", slug: "calls-a" }, { type: "next" })).toEqual({ kind: "scene", slug: "calls-b" });
    expect(reduce({ kind: "scene", slug: "calls-b" }, { type: "next" })).toEqual({ kind: "scene", slug: "calls-a" });
    const solo = { kind: "scene", slug: "trade-a" } as const;
    expect(reduce(solo, { type: "next" })).toBe(solo);
    const explore = initialStage(world);
    expect(reduce(explore, { type: "next" })).toBe(explore);
  });

  it("returning to explore keeps the scene's project in focus", () => {
    expect(reduce({ kind: "scene", slug: "trade-a" }, { type: "explore" })).toEqual({ kind: "explore", focus: "trade-a" });
    expect(reduce({ kind: "panel", panel: "about" }, { type: "explore" })).toEqual({ kind: "explore", focus: "calls-a" });
    expect(reduce({ kind: "panel", panel: "about" }, { type: "explore", focus: "calls-b" })).toEqual({ kind: "explore", focus: "calls-b" });
  });

  it("opens panels", () => {
    expect(reduce(initialStage(world), { type: "panel", panel: "contact" })).toEqual({ kind: "panel", panel: "contact" });
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run features/stage/stage.test.ts`
Expected: FAIL — `Cannot find module './stage'`.

- [ ] **Step 3: Implement `features/stage/stage.ts`**

```ts
/**
 * What the monitor shows, as a pure reducer. The explore menu, the project scenes
 * and the panels all render from this state, and every change is a command — the
 * same commands the assistant will send in Phase 2. Unknown slugs are ignored
 * (the state is returned unchanged), so a bad command can never break the screen.
 */

import type { Track } from "@/content/tracks";

export type Panel = "about" | "side" | "contact";

export type StageView =
  | { kind: "explore"; focus: string }
  | { kind: "scene"; slug: string }
  | { kind: "panel"; panel: Panel };

export type StageCommand =
  | { type: "explore"; focus?: string }
  | { type: "focus"; slug: string }
  | { type: "show"; slug: string }
  | { type: "next" }
  | { type: "panel"; panel: Panel };

export interface StageWorld {
  /** Every case-study slug, grouped by track in screen order. */
  order: string[];
  trackOf: Record<string, Track>;
}

export function initialStage(world: StageWorld): StageView {
  return { kind: "explore", focus: world.order[0] };
}

export function stageReducer(world: StageWorld) {
  const known = (slug: string | undefined): slug is string => !!slug && slug in world.trackOf;

  return (state: StageView, command: StageCommand): StageView => {
    switch (command.type) {
      case "focus":
        return known(command.slug) ? { kind: "explore", focus: command.slug } : state;
      case "show":
        return known(command.slug) ? { kind: "scene", slug: command.slug } : state;
      case "next": {
        if (state.kind !== "scene") return state;
        const track = world.trackOf[state.slug];
        const same = world.order.filter((s) => world.trackOf[s] === track);
        if (same.length < 2) return state;
        return { kind: "scene", slug: same[(same.indexOf(state.slug) + 1) % same.length] };
      }
      case "explore": {
        const focus = known(command.focus) ? command.focus : state.kind === "scene" ? state.slug : world.order[0];
        return { kind: "explore", focus };
      }
      case "panel":
        return { kind: "panel", panel: command.panel };
    }
  };
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run features/stage/stage.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add features/stage
git commit -m "Stage: pure reducer for what the monitor shows"
```

---

### Task 5: The light screen — explore menu and project scenes

**Files:**
- Modify: `app/globals.css`, `components/theatre/Theatre.tsx`, `components/theatre/Theatre.module.css`, `app/page.tsx`
- Create: `components/screen/Screen.tsx`, `Screen.module.css`, `ExploreMenu.tsx`, `ExploreMenu.module.css`, `ProjectScene.tsx`, `ProjectScene.module.css`, `Spotlights.tsx`, `Spotlights.module.css`
- Delete: `components/theatre/Desktop.tsx`, `components/theatre/Desktop.module.css`
- Test: `e2e/night.spec.ts`

**Interfaces:**
- Consumes: `stageReducer`, `initialStage`, `StageWorld`, `Panel` (Task 4); `TRACKS`, `TRACK_TITLES`, `TRACK_LINES` (Task 1); `pitch`, `spotlights` (Tasks 2–3); `screenTransitionName` (`lib/transition.ts`); `useCinematic()` → `{ mode, ready }`.
- Produces:
```ts
// components/screen/Screen.tsx
export type Spot = { feature: string; x: number; y: number; label: string };
export interface ScreenItem { slug: string; title: string; track: Track; problem: string; outcome: string; poster: string; loop?: string; classified: boolean; spotlights: Spot[] }
export interface ScreenProps { items: ScreenItem[]; about: ReactNode; side: ReactNode; ready?: boolean }
export function Screen(props: ScreenProps): JSX.Element
// components/screen/Spotlights.tsx
export function Spotlights(props: { spots: Spot[]; active: number | "all" | null }): JSX.Element
// Theatre now takes ScreenProps: <Theatre items about side />
```
In this task `about`/`side` are accepted but the bar's About / Side projects / Contact still dispatch `ns:open` to the existing `Panels` modals (moved onto the screen in Task 6).

- [ ] **Step 1: Write the failing e2e tests** — in `e2e/night.spec.ts` add a top-level helper below `topOfPage`:

```ts
/** The desk without the film: the HUD's "Work" skips it. */
async function toDesk(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Work", exact: true }).click();
  await expect(phase(page)).toHaveAttribute("data-phase", "desk");
}

/** WCAG contrast of an element's text against the first opaque background behind it. */
function contrast(locator: ReturnType<Page["locator"]>) {
  return locator.evaluate((el) => {
    const rgb = (c: string) => c.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const lum = (c: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    let bgEl: Element | null = el;
    let bg = "rgba(0, 0, 0, 0)";
    while (bgEl && (bg = getComputedStyle(bgEl).backgroundColor).endsWith(", 0)")) bgEl = bgEl.parentElement;
    const a = lum(rgb(getComputedStyle(el).color));
    const b = lum(rgb(bg));
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}
```

Replace the test `"every case study is reachable from its tabs"` with:

```ts
  test("the work is grouped by business problem and every case study opens as a scene", async ({ page }) => {
    await toDesk(page);
    const menu = page.locator("#desk").getByRole("navigation", { name: "Work by business problem" });
    for (const group of ["Calls & messages", "Trading", "Admin & back-office", "More work"]) {
      await expect(menu.getByRole("heading", { name: group })).toBeVisible();
    }
    const buttons = menu.getByRole("button");
    expect(await buttons.count()).toBe(14);
    await buttons.filter({ hasText: "TG Auto Trader" }).click();
    const scene = page.locator("#desk").getByRole("article", { name: "TG Auto Trader" });
    await expect(scene).toBeVisible();
    await expect(scene.getByRole("link", { name: "How does it work?" })).toHaveAttribute("href", "/work/tg-auto-trader");
    await scene.getByRole("button", { name: "Another example" }).click();
    await expect(page.locator("#desk").getByRole("article")).not.toHaveAccessibleName("TG Auto Trader");
    await page.locator("#desk").getByRole("button", { name: "All work" }).first().click();
    await expect(menu).toBeVisible();
  });

  test("the screen is light and readable", async ({ page }) => {
    await toDesk(page);
    const heading = page.locator("#desk").getByRole("heading", { name: "Trading" });
    expect(await contrast(heading)).toBeGreaterThanOrEqual(4.5);
    const bg = await page.locator("#desk [data-screen]").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(245, 241, 234)");
  });

  test("the menu and a scene fit the monitor without scrolling", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "the phone layout is a scrolling panel");
    for (const size of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
      await page.setViewportSize(size);
      await toDesk(page);
      const view = page.locator("#desk [data-screen-view]");
      expect(await view.evaluate((el) => el.scrollHeight <= el.clientHeight + 1), `menu at ${size.width}`).toBe(true);
      await page.locator("#desk").getByRole("button", { name: /^247Aisupports/ }).click();
      expect(await view.evaluate((el) => el.scrollHeight <= el.clientHeight + 1), `scene at ${size.width}`).toBe(true);
    }
  });

  test("keyboard: Tab reaches the menu, Enter opens a scene and its case", async ({ page }) => {
    await toDesk(page);
    const first = page.locator("#desk").getByRole("navigation", { name: "Work by business problem" }).getByRole("button").first();
    for (let i = 0; i < 40 && !(await first.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    await page.keyboard.press("Enter");
    const how = page.locator("#desk").getByRole("link", { name: "How does it work?" });
    await expect(how).toBeVisible();
    await how.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work\//);
  });
```

Replace the test `"a project opens in a modal with its own address, and closes back to the desk"` body's first three lines (it still uses `#desk a[href=…]`) with:

```ts
    await toDesk(page);
    await page.locator("#desk").getByRole("button", { name: /^TG Auto Trader/ }).click();
    await page.locator("#desk").getByRole("link", { name: "How does it work?" }).click();
```

and replace `"About, Side projects and Contact open from the dock"`'s locator line `page.locator("#desk").getByRole("button", { name: button })` with `page.locator("#desk").getByRole("button", { name: button }).first()` and its first two lines with `await toDesk(page);`.

- [ ] **Step 2: Run to verify they fail**

Run: `npm run build && npx playwright test -g "grouped by business problem|light and readable|fit the monitor|keyboard: Tab"`
Expected: FAIL — navigation "Work by business problem" not found.

- [ ] **Step 3: Light token scope** — append to `app/globals.css` (after the `.wrap` rule):

```css
/* ───────────────────────── The light screen ─────────────────────────
   A bright display in a dark room. Re-scoping the tokens turns any component
   that uses them light inside this scope (screen views, the case takeover). */
.screen-light {
  --night: #f5f1ea; /* paper */
  --room: #efe9df;
  --room-2: #e6dfd3;
  --line: rgba(22, 24, 29, 0.12);
  --screen: #16181d; /* ink */
  --dim: #575d67;
  --faint: #8a8f98;
  --sodium: #a04a08; /* deeper amber: AA on paper */
  --sodium-low: #f3dcc4;
  color-scheme: light;
  background: var(--night);
  color: var(--screen);
}
```

- [ ] **Step 4: Spotlights** — `components/screen/Spotlights.tsx`:

```tsx
/**
 * Amber markers over a screen image, each with a short label. Positions are
 * percentages of the image, so they hold at any size. Decorative: the same labels
 * are always listed as text next to the image.
 */

import type { Spot } from "./Screen";
import styles from "./Spotlights.module.css";

export function Spotlights({ spots, active }: { spots: Spot[]; active: number | "all" | null }) {
  return (
    <div className={styles.layer} aria-hidden="true">
      {spots.map((s, i) => (
        <span
          key={s.feature}
          className={styles.spot}
          data-on={active === "all" || active === i}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          <span className={styles.label}>{s.label}</span>
        </span>
      ))}
    </div>
  );
}
```

`components/screen/Spotlights.module.css`:

```css
.layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.spot {
  position: absolute;
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  border-radius: 50%;
  background: #ff9a3c;
  box-shadow: 0 0 0 4px rgba(255, 154, 60, 0.35);
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 0.35s var(--ease-camera),
    transform 0.35s var(--ease-camera);
}
.spot[data-on="true"] {
  opacity: 1;
  transform: none;
  animation: ping 1.8s ease-out infinite;
}
@keyframes ping {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 154, 60, 0.55);
  }
  100% {
    box-shadow: 0 0 0 18px rgba(255, 154, 60, 0);
  }
}
.label {
  position: absolute;
  left: 26px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: #16181d;
  background: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}
.spot[data-on="false"] .label {
  display: none;
}
:global(html[data-mode="still"]) .spot {
  animation: none;
  transition: none;
}
```

- [ ] **Step 5: ExploreMenu** — `components/screen/ExploreMenu.tsx`:

```tsx
"use client";

/**
 * The work as a film's chapter menu: business problems down the left, each with
 * its projects; the hovered or focused project plays large on the right. Fits the
 * monitor without scrolling. Click (or Enter) opens the project's scene.
 */

import { useState } from "react";
import { TRACKS, TRACK_LINES, TRACK_TITLES } from "@/content/tracks";
import type { ScreenItem } from "./Screen";
import styles from "./ExploreMenu.module.css";

interface Props {
  items: ScreenItem[];
  focus: string;
  ready: boolean;
  onFocus: (slug: string) => void;
  onOpen: (slug: string) => void;
}

export function ExploreMenu({ items, focus, ready, onFocus, onOpen }: Props) {
  const [playing, setPlaying] = useState(false);
  const current = items.find((i) => i.slug === focus) ?? items[0];

  return (
    <div className={styles.menu} data-screen-view>
      <nav className={styles.list} aria-label="Work by business problem">
        {TRACKS.map((track) => {
          const group = items.filter((i) => i.track === track);
          if (!group.length) return null;
          return (
            <section key={track} className={styles.group}>
              <h2 className={styles.groupTitle}>{TRACK_TITLES[track]}</h2>
              <p className={styles.groupLine}>{TRACK_LINES[track]}</p>
              <ul>
                {group.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      className={styles.item}
                      aria-current={item.slug === current.slug ? "true" : undefined}
                      onMouseEnter={() => onFocus(item.slug)}
                      onFocus={() => onFocus(item.slug)}
                      onClick={() => onOpen(item.slug)}
                    >
                      {item.title}
                      {item.classified && <span className={styles.chip}>Under NDA</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </nav>

      <section className={styles.preview} aria-label="Preview" aria-live="polite">
        <button
          type="button"
          className={styles.frame}
          onClick={() => onOpen(current.slug)}
          onMouseEnter={() => setPlaying(true)}
          onMouseLeave={() => setPlaying(false)}
          aria-label={`Open ${current.title}`}
        >
          {playing && current.loop && !current.classified ? (
            <video key={current.slug} src={current.loop} poster={current.poster} muted loop playsInline autoPlay aria-hidden="true" />
          ) : ready ? (
            <img key={current.slug} src={current.poster} alt="" decoding="async" />
          ) : null}
          {current.classified && <span className={styles.privacy} aria-hidden="true" />}
        </button>
        <h3 className={styles.title}>{current.title}</h3>
        <p className={styles.problem}>{current.problem}</p>
        <p className={styles.outcome}>{current.outcome}</p>
      </section>
    </div>
  );
}
```

`components/screen/ExploreMenu.module.css`:

```css
.menu {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(250px, 30%) 1fr;
  gap: 28px;
  padding: 22px 28px 24px;
  overflow: hidden;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}
.group ul {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
}
.groupTitle {
  margin: 0;
  font-family: var(--font-display);
  font-variation-settings: "opsz" 72;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 19px;
  letter-spacing: 0.01em;
}
.groupLine {
  margin: 1px 0 0;
  font-size: 12.5px;
  color: var(--dim);
}
.item {
  font: inherit;
  font-size: 15px;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 8px;
  margin-left: -8px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--screen);
  cursor: pointer;
}
.item:hover,
.item[aria-current="true"] {
  background: rgba(160, 74, 8, 0.09);
  color: var(--sodium);
}
.chip {
  font-size: 11px;
  font-weight: 600;
  color: var(--dim);
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 0 7px;
}
.preview {
  display: grid;
  grid-template-rows: 1fr auto auto auto;
  gap: 8px;
  min-height: 0;
}
.frame {
  position: relative;
  min-height: 0;
  padding: 0;
  border: 8px solid #16181d;
  border-radius: 10px;
  overflow: hidden;
  background: #0b0e13;
  cursor: pointer;
  box-shadow: 0 18px 50px rgba(22, 24, 29, 0.22);
}
.frame img,
.frame video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}
.privacy {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.35) 0 3px, rgba(0, 0, 0, 0.12) 3px 5px);
}
.title {
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-variation-settings: "opsz" 72;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 30px;
  line-height: 1;
}
.problem,
.outcome {
  margin: 0;
  font-size: 15px;
  line-height: 1.45;
  max-width: 70ch;
}
.problem {
  color: var(--dim);
}
@container screen (max-width: 899px) {
  .menu {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    overflow-y: auto;
  }
  .preview {
    order: -1;
    grid-template-rows: auto auto auto auto;
  }
  .frame {
    aspect-ratio: 16 / 10;
  }
}
```

- [ ] **Step 6: ProjectScene** — `components/screen/ProjectScene.tsx`:

```tsx
"use client";

/**
 * One project on the monitor: the client's problem as the headline, what changed
 * under it, and the product in a framed window whose spotlights light one at a
 * time (all at once in still mode). "How does it work?" opens the full case.
 */

import Link from "next/link";
import { useEffect, useState, ViewTransition } from "react";
import { screenTransitionName } from "@/lib/transition";
import type { ScreenItem } from "./Screen";
import { Spotlights } from "./Spotlights";
import styles from "./ProjectScene.module.css";

interface Props {
  item: ScreenItem;
  trackTitle: string;
  still: boolean;
  hasNext: boolean;
  onNext: () => void;
  onExplore: () => void;
}

export function ProjectScene({ item, trackTitle, still, hasNext, onNext, onExplore }: Props) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const count = item.spotlights.length;

  useEffect(() => {
    setActive(0);
    setHeld(false);
  }, [item.slug]);

  useEffect(() => {
    if (still || held || count < 2) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % count), 2600);
    return () => window.clearInterval(id);
  }, [still, held, count]);

  return (
    <article className={styles.scene} aria-label={item.title} data-screen-view>
      <div className={styles.copy}>
        <p className={styles.kicker}>
          {trackTitle} · {item.title}
        </p>
        <h2 className={styles.problem}>{item.problem}</h2>
        <p className={styles.outcome}>{item.outcome}</p>
        {item.classified && <p className={styles.nda}>Client work under NDA — names withheld.</p>}
        {count > 0 && (
          <ul className={styles.spots} aria-label="What to look at">
            {item.spotlights.map((s, i) => (
              <li key={s.feature}>
                <button
                  type="button"
                  aria-pressed={still || active === i}
                  onClick={() => {
                    setActive(i);
                    setHeld(true);
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.actions}>
          <Link href={`/work/${item.slug}`} scroll={false} className={styles.primary}>
            How does it work?
          </Link>
          {hasNext && (
            <button type="button" className={styles.ghost} onClick={onNext}>
              Another example
            </button>
          )}
          <button type="button" className={styles.ghost} onClick={onExplore}>
            All work
          </button>
        </div>
      </div>

      <figure className={styles.window}>
        <ViewTransition name={screenTransitionName(item.slug)} share="screen-morph" default="none">
          <div className={styles.frame}>
            <img src={item.poster} alt={`${item.title} — interface`} decoding="async" />
            <Spotlights spots={item.spotlights} active={still ? "all" : count ? active : null} />
            {item.classified && <span className={styles.privacy} aria-hidden="true" />}
          </div>
        </ViewTransition>
      </figure>
    </article>
  );
}
```

`components/screen/ProjectScene.module.css`:

```css
.scene {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(300px, 38%) 1fr;
  gap: 32px;
  align-items: center;
  padding: 24px 32px;
  overflow: hidden;
  animation: scene-in 0.5s var(--ease-camera);
}
@keyframes scene-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
.copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kicker {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--sodium);
}
.problem {
  margin: 0;
  font-size: 27px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.outcome {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: var(--dim);
}
.nda {
  margin: 0;
  font-size: 13px;
  color: var(--dim);
  border-left: 3px solid var(--sodium);
  padding-left: 10px;
}
.spots {
  list-style: none;
  margin: 2px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.spots button {
  font: inherit;
  font-size: 13px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--screen);
  border-radius: 99px;
  padding: 4px 11px;
  cursor: pointer;
}
.spots button[aria-pressed="true"] {
  border-color: var(--sodium);
  color: var(--sodium);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}
.primary,
.ghost {
  font: inherit;
  font-weight: 600;
  font-size: 15px;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 99px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.primary {
  background: var(--sodium);
  color: #fff;
  border: 1px solid var(--sodium);
}
.ghost {
  background: transparent;
  color: var(--screen);
  border: 1px solid var(--line);
}
.ghost:hover {
  border-color: var(--screen);
}
.window {
  margin: 0;
  min-width: 0;
}
.frame {
  position: relative;
  border: 10px solid #16181d;
  border-radius: 12px;
  overflow: visible;
  background: #0b0e13;
  box-shadow: 0 24px 70px rgba(22, 24, 29, 0.28);
}
.frame img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: cover;
  object-position: top center;
  border-radius: 2px;
}
.privacy {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.35) 0 3px, rgba(0, 0, 0, 0.12) 3px 5px);
  pointer-events: none;
}
:global(html[data-mode="still"]) .scene {
  animation: none;
}
@container screen (max-width: 899px) {
  .scene {
    grid-template-columns: 1fr;
    overflow-y: auto;
    align-items: start;
  }
  .window {
    order: -1;
  }
  .problem {
    font-size: 22px;
  }
}
```

- [ ] **Step 7: Screen** — `components/screen/Screen.tsx`:

```tsx
"use client";

/**
 * The monitor's screen — light, like a bright display in a dark room. It shows
 * the work grouped by business problem, one project as a scene, or a panel. What
 * it shows is owned by the stage reducer, so the assistant (Phase 2) can drive the
 * same commands the buttons use.
 */

import { useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { initialStage, stageReducer, type Panel, type StageWorld } from "@/features/stage/stage";
import { TRACK_TITLES, type Track } from "@/content/tracks";
import { useCinematic } from "@/hooks/useCinematic";
import { ExploreMenu } from "./ExploreMenu";
import { ProjectScene } from "./ProjectScene";
import styles from "./Screen.module.css";

export type Spot = { feature: string; x: number; y: number; label: string };

export interface ScreenItem {
  slug: string;
  title: string;
  track: Track;
  problem: string;
  outcome: string;
  poster: string;
  loop?: string;
  classified: boolean;
  spotlights: Spot[];
}

export interface ScreenProps {
  items: ScreenItem[];
  about: ReactNode;
  side: ReactNode;
  /** Load preview images (false until the visitor heads for the desk). */
  ready?: boolean;
}

function useLocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });
    const tick = () => setTime(fmt.format(new Date()).replace(/\u202f/g, " "));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

const openPanel = (panel: Panel) => window.dispatchEvent(new CustomEvent("ns:open", { detail: panel }));

export function Screen({ items, ready = true }: ScreenProps) {
  const { mode, ready: modeReady } = useCinematic();
  const still = modeReady && mode === "still";
  const world = useMemo<StageWorld>(
    () => ({ order: items.map((i) => i.slug), trackOf: Object.fromEntries(items.map((i) => [i.slug, i.track])) }),
    [items],
  );
  const reducer = useMemo(() => stageReducer(world), [world]);
  const [view, dispatch] = useReducer(reducer, world, initialStage);
  const time = useLocalTime();
  const bySlug = useMemo(() => new Map(items.map((i) => [i.slug, i])), [items]);

  const scene = view.kind === "scene" ? bySlug.get(view.slug) : undefined;
  const trackSize = (t: Track) => items.filter((i) => i.track === t).length;

  return (
    <div className={`screen-light ${styles.screen}`} data-screen>
      <header className={styles.bar}>
        <span className={styles.owner}>Jeon&rsquo;s desk</span>
        <nav className={styles.nav} aria-label="Screen">
          <button type="button" aria-current={view.kind === "explore" ? "page" : undefined} onClick={() => dispatch({ type: "explore" })}>
            All work
          </button>
          <button type="button" onClick={() => openPanel("about")}>
            About
          </button>
          <button type="button" onClick={() => openPanel("side")}>
            Side projects
          </button>
          <button type="button" onClick={() => openPanel("contact")}>
            Contact
          </button>
          <a href="/IamjeonResume.pdf" target="_blank" rel="noopener">
            Résumé
          </a>
        </nav>
        <span className={styles.clock} suppressHydrationWarning>
          {time && `${time} · Lapu-Lapu City`}
        </span>
      </header>

      <div className={styles.view}>
        {scene ? (
          <ProjectScene
            item={scene}
            trackTitle={TRACK_TITLES[scene.track]}
            still={still}
            hasNext={trackSize(scene.track) > 1}
            onNext={() => dispatch({ type: "next" })}
            onExplore={() => dispatch({ type: "explore" })}
          />
        ) : (
          <ExploreMenu
            items={items}
            focus={view.kind === "explore" ? view.focus : items[0].slug}
            ready={ready}
            onFocus={(slug) => dispatch({ type: "focus", slug })}
            onOpen={(slug) => dispatch({ type: "show", slug })}
          />
        )}
      </div>
    </div>
  );
}
```

`components/screen/Screen.module.css`:

```css
.screen {
  container: screen / inline-size;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  font-size: 15px;
  overflow: hidden;
}
.bar {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 24px;
  border-bottom: 1px solid var(--line);
}
.owner {
  font-family: var(--font-display);
  font-variation-settings: "opsz" 72;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 18px;
  white-space: nowrap;
}
.nav {
  display: flex;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav button,
.nav a {
  font: inherit;
  font-size: 14px;
  white-space: nowrap;
  color: var(--dim);
  background: none;
  border: 0;
  border-radius: 7px;
  padding: 6px 10px;
  cursor: pointer;
}
.nav button:hover,
.nav a:hover,
.nav [aria-current="page"] {
  color: var(--screen);
  background: rgba(22, 24, 29, 0.06);
}
.clock {
  font-size: 13px;
  color: var(--dim);
  white-space: nowrap;
}
.view {
  min-height: 0;
  position: relative;
}
@container screen (max-width: 899px) {
  .clock {
    display: none;
  }
}
```

- [ ] **Step 8: Wire Theatre and the page** — in `components/theatre/Theatre.tsx` replace the `Desktop` import and type:

```ts
import { Screen, type ScreenProps } from "@/components/screen/Screen";
```
```ts
export function Theatre(props: ScreenProps) {
```
and the render `<Desktop {...props} ready={deskReady} />` with:
```tsx
          <Screen {...props} ready={deskReady} />
```
In `components/theatre/Theatre.module.css` add the light spill under `.theatre[data-phase="desk"] .desktopWrap { … }`:
```css
/* The light screen glows into the dark room. */
.theatre[data-phase="desk"] .desktopWrap {
  box-shadow: 0 0 140px 36px rgba(255, 236, 210, 0.16);
}
```
Replace `app/page.tsx` with:

```tsx
import { ViewTransition } from "react";
import { Theatre } from "@/components/theatre/Theatre";
import { Panels } from "@/components/theatre/Panels";
import type { ScreenItem } from "@/components/screen/Screen";
import { Archive } from "@/components/night/Archive";
import { BehindTheDesk } from "@/components/night/BehindTheDesk";
import { TRACKS, caseStudyProjects, projectsInChapter } from "@/content";

export default function HomePage() {
  const all = caseStudyProjects();
  const items: ScreenItem[] = TRACKS.flatMap((t) => all.filter((p) => p.pitch?.track === t)).map((p) => ({
    slug: p.slug,
    title: p.title,
    track: p.pitch!.track,
    problem: p.pitch!.problem,
    outcome: p.pitch!.outcome,
    poster: p.screen.poster,
    loop: p.screen.loop,
    classified: p.redacted,
    spotlights: p.spotlights,
  }));
  const side = projectsInChapter("archive");

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main>
        <Theatre items={items} about={<BehindTheDesk />} side={<Archive projects={side} />} />
        <Panels about={<BehindTheDesk />} side={<Archive projects={side} />} />
      </main>
    </ViewTransition>
  );
}
```
Delete the old desktop:
```bash
git rm components/theatre/Desktop.tsx components/theatre/Desktop.module.css
```

- [ ] **Step 9: Run to verify they pass**

Run: `npx tsc --noEmit && npm run build && npx playwright test`
Expected: all pass, including the four new tests; leak check "clean".

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Light screen: work grouped by business problem, project scenes with spotlights"
```

---

### Task 6: About, Side projects and Contact on the screen

**Files:**
- Create: `components/screen/ContactView.tsx`, `components/screen/ContactView.module.css`
- Modify: `components/screen/Screen.tsx`, `components/screen/Screen.module.css`, `components/theatre/Theatre.tsx`, `app/page.tsx`
- Delete: `components/theatre/Panels.tsx`, `components/theatre/Panels.module.css`
- Test: `e2e/night.spec.ts`

**Interfaces:**
- Consumes: `StageView` `{ kind: "panel"; panel }`, `ScreenProps.about/side` (Task 5).
- Produces: `ns:open` (CustomEvent<Panel>) is handled by `Screen` (shows the panel) and `Theatre` (moves to the desk without the film if not already there).

- [ ] **Step 1: Write the failing e2e tests** — replace the test `"About, Side projects and Contact open from the dock"` with:

```ts
  test("About, Side projects and Contact open on the screen and return to the work", async ({ page }) => {
    await toDesk(page);
    const desk = page.locator("#desk");
    for (const [button, region] of [
      ["About", "About Jeon"],
      ["Side projects", "Side projects"],
      ["Contact", "Contact"],
    ] as const) {
      await desk.getByRole("navigation", { name: "Screen" }).getByRole("button", { name: button }).click();
      await expect(desk.getByRole("region", { name: region })).toBeVisible();
      await desk.getByRole("button", { name: "All work" }).first().click();
      await expect(desk.getByRole("navigation", { name: "Work by business problem" })).toBeVisible();
    }
  });

  test("Contact pressed on the welcome lands on the desk without the film", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("button", { name: "Contact" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 5000 });
    await expect(page.getByRole("button", { name: "Skip" })).toHaveCount(0);
    await expect(page.locator("#desk").getByRole("region", { name: "Contact" })).toBeVisible();
    await expect(page.locator("#desk").getByRole("link", { name: /bertulfojeon@gmail\.com/ })).toHaveAttribute("href", /^mailto:/);
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run build && npx playwright test -g "open on the screen|without the film"`
Expected: FAIL — region "About Jeon" not found (the modal dialog opens instead).

- [ ] **Step 3: ContactView** — `components/screen/ContactView.tsx`:

```tsx
/** Contact on the light screen. Phase 2 adds WhatsApp and Viber with a pre-filled summary. */

import styles from "./ContactView.module.css";

const EMAIL = "bertulfojeon@gmail.com";

export function ContactView() {
  return (
    <section className={styles.contact} aria-label="Contact" data-screen-view>
      <h2 className={`display ${styles.title}`}>Let&rsquo;s build something.</h2>
      <p className={styles.lead}>
        A system that answers your calls, runs your trading desk or takes payroll off your plate — or a live walkthrough
        of anything on this screen. Freelance and full-time.
      </p>
      <div className={styles.actions}>
        <a className={styles.primary} href={`mailto:${EMAIL}?subject=Project%20enquiry`}>
          {EMAIL}
        </a>
        <a className={styles.secondary} href="tel:+639684333479">
          +63 968 4333 479
        </a>
        <a className={styles.secondary} href="/IamjeonResume.pdf" target="_blank" rel="noopener">
          Résumé (PDF)
        </a>
      </div>
      <p className={styles.where}>Lapu-Lapu City, Cebu · working with clients in any time zone</p>
    </section>
  );
}
```

`components/screen/ContactView.module.css`:

```css
.contact {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 32px 48px;
  max-width: 820px;
}
.title {
  font-size: 64px;
}
.lead {
  margin: 0;
  font-size: 18px;
  line-height: 1.5;
  max-width: 52ch;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}
.primary,
.secondary {
  display: inline-flex;
  align-items: center;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 99px;
  font-weight: 600;
}
.primary {
  background: var(--sodium);
  color: #fff;
}
.secondary {
  border: 1px solid var(--line);
}
.secondary:hover {
  border-color: var(--screen);
}
.where {
  margin: 4px 0 0;
  color: var(--dim);
  font-size: 14px;
}
```

- [ ] **Step 4: Panels inside Screen** — in `components/screen/Screen.tsx`:

Change the signature to use the panels: `export function Screen({ items, about, side, ready = true }: ScreenProps) {`.
Replace `openPanel` and its uses: delete the `openPanel` const; the three nav buttons become
```tsx
          <button type="button" aria-current={view.kind === "panel" && view.panel === "about" ? "page" : undefined} onClick={() => dispatch({ type: "panel", panel: "about" })}>
            About
          </button>
          <button type="button" aria-current={view.kind === "panel" && view.panel === "side" ? "page" : undefined} onClick={() => dispatch({ type: "panel", panel: "side" })}>
            Side projects
          </button>
          <button type="button" aria-current={view.kind === "panel" && view.panel === "contact" ? "page" : undefined} onClick={() => dispatch({ type: "panel", panel: "contact" })}>
            Contact
          </button>
```
Add the listener after `const bySlug = …`:
```tsx
  useEffect(() => {
    const onOpen = (e: Event) => dispatch({ type: "panel", panel: (e as CustomEvent<Panel>).detail });
    window.addEventListener("ns:open", onOpen);
    return () => window.removeEventListener("ns:open", onOpen);
  }, []);
```
Replace the body of `<div className={styles.view}>` with:
```tsx
        {view.kind === "panel" ? (
          view.panel === "contact" ? (
            <ContactView />
          ) : (
            <section
              className={styles.panel}
              aria-label={view.panel === "about" ? "About Jeon" : "Side projects"}
              data-screen-view
              data-lenis-prevent
            >
              {view.panel === "about" ? about : side}
            </section>
          )
        ) : scene ? (
          <ProjectScene
            item={scene}
            trackTitle={TRACK_TITLES[scene.track]}
            still={still}
            hasNext={trackSize(scene.track) > 1}
            onNext={() => dispatch({ type: "next" })}
            onExplore={() => dispatch({ type: "explore" })}
          />
        ) : (
          <ExploreMenu
            items={items}
            focus={view.kind === "explore" ? view.focus : items[0].slug}
            ready={ready}
            onFocus={(slug) => dispatch({ type: "focus", slug })}
            onOpen={(slug) => dispatch({ type: "show", slug })}
          />
        )}
```
and add `import { ContactView } from "./ContactView";`. Append to `Screen.module.css`:
```css
/* About and Side projects are long reads: they scroll inside the screen. */
.panel {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

- [ ] **Step 5: Theatre moves to the desk on `ns:open`** — in `components/theatre/Theatre.tsx`, inside the "Skip: button, Esc, or the HUD Work link" effect, add next to `onGo`:
```ts
    // About / Contact pressed before the desk: go there directly (no film).
    const onOpen = () => {
      if (phaseRef.current !== "desk") onGo();
    };
```
register `window.addEventListener("ns:open", onOpen);` and remove it in the cleanup (`window.removeEventListener("ns:open", onOpen);`).

- [ ] **Step 6: Remove the modal panels** — in `app/page.tsx` delete the `Panels` import and the `<Panels … />` line, then:
```bash
git rm components/theatre/Panels.tsx components/theatre/Panels.module.css
```

- [ ] **Step 7: Run to verify they pass**

Run: `npx tsc --noEmit && npm run build && npx playwright test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "About, Side projects and Contact open on the light screen"
```

---

### Task 7: The case takeover

**Files:**
- Modify: `components/ui/Modal.tsx`, `components/ui/Modal.module.css`, `components/case/RouteModal.tsx`, `app/work/[slug]/page.tsx`, `components/hud/Hud.tsx`, `components/hud/Hud.module.css`
- Test: `e2e/night.spec.ts`

**Interfaces:**
- Consumes: `.screen-light` (Task 5).
- Produces: `Modal` prop `size?: "case" | "panel" | "takeover"`; `RouteModal` renders `size="takeover"`.

- [ ] **Step 1: Write the failing e2e tests** — replace the body of `"a project opens in a modal with its own address, and closes back to the desk"` (rename it) with:

```ts
  test("a case opens full-screen and light, with its own address, and closes back to the scene", async ({ page }) => {
    await toDesk(page);
    await page.locator("#desk").getByRole("button", { name: /^TG Auto Trader/ }).click();
    await page.locator("#desk").getByRole("link", { name: "How does it work?" }).click();
    await expect(page).toHaveURL(/\/work\/tg-auto-trader$/);
    const dialog = page.getByRole("dialog", { name: "TG Auto Trader" });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    const vp = page.viewportSize()!;
    expect(box!.width).toBeGreaterThanOrEqual(vp.width - 1);
    expect(box!.height).toBeGreaterThanOrEqual(vp.height - 1);
    // The frame around the scrolling body carries the light paper colour.
    expect(await dialog.evaluate((el) => getComputedStyle(el.querySelector("[data-modal-body]")!.parentElement!).backgroundColor)).toBe("rgb(245, 241, 234)");
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#desk").getByRole("article", { name: "TG Auto Trader" })).toBeVisible();
  });

  test("browser Back from a case returns to the same scene", async ({ page }) => {
    await toDesk(page);
    await page.locator("#desk").getByRole("button", { name: /^247Aisupports/ }).click();
    await page.locator("#desk").getByRole("link", { name: "How does it work?" }).click();
    await expect(page.getByRole("dialog", { name: "247Aisupports" })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
    await expect(page.locator("#desk").getByRole("article", { name: "247Aisupports" })).toBeVisible();
  });
```

In `describe("case pages")` add:

```ts
  test("direct case pages are light, with a readable top bar", async ({ page }) => {
    await page.goto("/work/tg-auto-trader");
    expect(await page.locator("main").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(245, 241, 234)");
    await expect(page.getByRole("banner")).toHaveAttribute("data-surface", "light");
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run build && npx playwright test -g "full-screen and light|browser Back|readable top bar"`
Expected: FAIL — dialog narrower than the viewport; main background is dark.

- [ ] **Step 3: Modal takeover size** — in `components/ui/Modal.tsx` widen the prop and add the class:

```ts
  size?: "case" | "panel" | "takeover";
```
```tsx
    <dialog
      ref={ref}
      className={`${styles.dialog}${size === "takeover" ? " screen-light" : ""}`}
```
Append to `components/ui/Modal.module.css`:

```css
/* The case takeover: the monitor grows until it is the whole browser. */
.dialog[data-size="takeover"] {
  width: 100vw;
  height: 100dvh;
  margin: 0;
  max-width: none;
  max-height: none;
}
.dialog[data-size="takeover"] .frame {
  border-radius: 0;
  box-shadow: none;
  background: var(--night);
}
.dialog[data-size="takeover"][open] {
  animation: takeover-in 0.55s var(--ease-camera);
}
@keyframes takeover-in {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
}
.dialog[data-size="takeover"] .close {
  background: rgba(255, 255, 255, 0.85);
  color: var(--screen);
}
```

- [ ] **Step 4: RouteModal uses it** — `components/case/RouteModal.tsx`:

```tsx
    <Modal open label={label} size="takeover" onClose={() => router.push("/", { scroll: false })}>
```
and update its doc comment to: `/** A full-screen case owned by a route: closing it returns to the desk underneath. */`

- [ ] **Step 5: Light direct page and HUD surface** — in `app/work/[slug]/page.tsx`:
```tsx
      <main id="main-content" className="screen-light">
```
In `components/hud/Hud.tsx` add the attribute on the header:
```tsx
    <header className={styles.hud} data-surface={home ? "dark" : "light"}>
```
Append to `components/hud/Hud.module.css`:
```css
/* Over the light pages the HUD keeps its own dark backing so it stays readable. */
.hud[data-surface="light"] {
  background: rgba(5, 7, 12, 0.88);
  backdrop-filter: blur(8px);
}
```
In `components/case/CaseStudy.module.css` change `.page { … background: var(--room); }` to `background: var(--night);`.

- [ ] **Step 6: Run to verify they pass**

Run: `npx tsc --noEmit && npm run build && npx playwright test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Case opens as a full-screen light takeover; light case pages"
```

---

### Task 8: The case told as scenes

**Files:**
- Create: `components/case/FeatureScenes.tsx`, `components/case/FeatureScenes.module.css`
- Modify: `components/case/CaseStudy.tsx`, `components/case/CaseStudy.module.css`
- Test: `e2e/night.spec.ts`

**Interfaces:**
- Consumes: `Project["pitch"]`, `Project["spotlights"]`, `Spotlights` + `Spot` (Task 5), `TRACK_TITLES` (Task 1).
- Produces: `FeatureScenes({ poster, title, features, spotlights, classified }: { poster: string; title: string; features: string[]; spotlights: Spot[]; classified: boolean })`.

- [ ] **Step 1: Write the failing e2e tests** — in `describe("case pages")` add:

```ts
  test("a case leads with the business problem, then features, outcomes and credits", async ({ page }) => {
    await page.goto("/work/247aisupports");
    const main = page.getByRole("main");
    await expect(main.getByText("Calls, chats and emails come in after hours", { exact: false })).toBeVisible();
    const features = main.getByRole("region", { name: "What it does" });
    await expect(features.getByRole("listitem")).toHaveCount(14);
    await expect(main.getByRole("region", { name: "What changed" })).toBeVisible();
    await expect(main.getByRole("region", { name: "Credits" })).toContainText("Role");
  });

  test("scrolling the features moves the spotlight on the pinned screen", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "the pinned screen is a desktop layout");
    await page.goto("/work/tg-auto-trader");
    const features = page.getByRole("region", { name: "What it does" });
    const item = features.getByRole("listitem").filter({ hasText: "Custom canvas chart" });
    await item.scrollIntoViewIfNeeded();
    await expect(item).toHaveAttribute("data-active", "true");
    await expect(features.locator("[data-on='true']")).toHaveCount(1);
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run build && npx playwright test -g "leads with the business problem|moves the spotlight"`
Expected: FAIL — the pitch text is not on the page.

- [ ] **Step 3: FeatureScenes** — `components/case/FeatureScenes.tsx`:

```tsx
"use client";

/**
 * "What it does": the product stays pinned while the features scroll past. The
 * feature crossing the middle of the screen is active; if it has a spotlight, the
 * marker lights on the pinned screen. Still mode shows every marker and no pin.
 */

import { useEffect, useRef, useState } from "react";
import { useCinematic } from "@/hooks/useCinematic";
import { Spotlights } from "@/components/screen/Spotlights";
import type { Spot } from "@/components/screen/Screen";
import styles from "./FeatureScenes.module.css";

interface Props {
  poster: string;
  title: string;
  features: string[];
  spotlights: Spot[];
  classified: boolean;
}

export function FeatureScenes({ poster, title, features, spotlights, classified }: Props) {
  const { mode, ready } = useCinematic();
  const still = ready && mode === "still";
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [features.length]);

  const spot = spotlights.findIndex((s) => s.feature === features[active]);

  return (
    <section className={styles.scenes} aria-labelledby="features-title" data-still={still}>
      <h2 id="features-title" className={styles.title}>
        What it does
      </h2>
      <div className={styles.grid}>
        <figure className={styles.pinned}>
          <div className={styles.frame}>
            <img src={poster} alt={`${title} — interface`} loading="lazy" decoding="async" />
            <Spotlights spots={spotlights} active={still ? "all" : spot >= 0 ? spot : null} />
            {classified && <span className={styles.privacy} aria-hidden="true" />}
          </div>
        </figure>
        <ol className={styles.list}>
          {features.map((f, i) => (
            <li
              key={f}
              ref={(el) => {
                items.current[i] = el;
              }}
              data-index={i}
              data-active={!still && i === active}
            >
              {f}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

`components/case/FeatureScenes.module.css`:

```css
.scenes {
  padding: 4rem 0 2rem;
}
.title {
  font-family: var(--font-display);
  font-variation-settings: "opsz" 72;
  font-weight: 800;
  text-transform: uppercase;
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0 0 2rem;
}
.grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 3rem;
  align-items: start;
}
.pinned {
  position: sticky;
  top: 12vh;
  margin: 0;
}
.frame {
  position: relative;
  border: 10px solid #16181d;
  border-radius: 12px;
  background: #0b0e13;
  box-shadow: 0 24px 70px rgba(22, 24, 29, 0.25);
}
.frame img {
  display: block;
  width: 100%;
  height: auto;
}
.privacy {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.35) 0 3px, rgba(0, 0, 0, 0.12) 3px 5px);
  pointer-events: none;
}
.list {
  list-style: none;
  margin: 0;
  padding: 20vh 0 30vh;
  display: grid;
  gap: 18vh;
}
.list li {
  font-size: clamp(1.15rem, 1.8vw, 1.5rem);
  line-height: 1.35;
  color: var(--faint);
  transition: color 0.3s;
}
.list li[data-active="true"] {
  color: var(--screen);
}
.scenes[data-still="true"] .pinned {
  position: static;
}
.scenes[data-still="true"] .list {
  padding: 0;
  gap: 1rem;
}
.scenes[data-still="true"] .list li {
  color: var(--screen);
}
@media (max-width: 899px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .pinned {
    position: static;
  }
  .list {
    padding: 0;
    gap: 1rem;
  }
  .list li {
    color: var(--screen);
  }
}
```

- [ ] **Step 4: Restructure CaseStudy** — in `components/case/CaseStudy.tsx`:

Update the header comment to:
```tsx
/**
 * A case study told as scenes: the business problem and what changed → the product
 * → what it does (pinned screen, spotlights) → what changed in numbers → behind the
 * build → credits → next screen. Rendered as the full-screen takeover from the desk
 * and as a page for direct links.
 */
```
Add imports: `import { TRACK_TITLES } from "@/content/tracks";` and `import { FeatureScenes } from "./FeatureScenes";`.

Replace the header block (`<header className={styles.head}>…</header>`) with:
```tsx
        <header className={styles.head}>
          <p className={styles.kicker}>
            {p.pitch ? TRACK_TITLES[p.pitch.track] : CHAPTER_TITLES[p.chapter]} · {p.industry} · {p.year}
          </p>
          <h1 className={`display ${styles.title}`}>{p.title}</h1>
          {p.pitch ? (
            <div className={styles.pitch}>
              <p className={styles.problem}>{p.pitch.problem}</p>
              <p className={styles.outcome}>{p.pitch.outcome}</p>
            </div>
          ) : (
            <p className={styles.logline}>{p.logline}</p>
          )}
          <dl className={styles.meta}>
            <div>
              <dt>Status</dt>
              <dd data-status={p.status}>{STATUS_LABEL[p.status]}</dd>
            </div>
            {p.client && (
              <div>
                <dt>Client</dt>
                <dd>{p.client}</dd>
              </div>
            )}
          </dl>
        </header>
```
Inside the second `<div className="wrap">`, move the features above the beats and replace the old features section; the order becomes: `RedactionStrip` → `FeatureScenes` → metrics → beats → credits:
```tsx
        {p.redacted && <RedactionStrip codename={p.title} />}

        {p.features.length > 0 && (
          <FeatureScenes
            poster={p.screen.poster}
            title={p.title}
            features={p.features}
            spotlights={p.spotlights}
            classified={p.redacted}
          />
        )}

        {p.metrics.length > 0 && (
          <section className={styles.metrics} aria-labelledby="metrics-title">
            <h2 id="metrics-title" className={styles.sectionTitle}>
              What changed
            </h2>
            <dl>
              {p.metrics.map((m) => (
                <div key={m.label}>
                  <dd>{m.value}</dd>
                  <dt>{m.label}</dt>
                </div>
              ))}
            </dl>
          </section>
        )}

        {p.beats.length > 0 && (
          <section className={styles.story} aria-labelledby="story-title">
            <h2 id="story-title" className={styles.sectionTitle}>
              Behind the build
            </h2>
            {/* existing p.beats.map(...) block, unchanged */}
          </section>
        )}
```
(Keep the existing `p.beats.map((b, i) => (<section …>…</section>))` JSX verbatim inside the new `story` section; delete the old standalone "What it does" `<section className={styles.features}>` and "By the numbers" section.)

Replace the credits section's inner content with:
```tsx
        <section className={styles.credits} aria-labelledby="credits-title">
          <h2 id="credits-title" className={styles.sectionTitle}>
            Credits
          </h2>
          <p className={styles.role}>
            <span>Role</span> {p.role}
          </p>
          <ul className={styles.stack} aria-label="Built with">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className={styles.links}>
            {/* existing links + mailto JSX, unchanged */}
          </div>
        </section>
```

- [ ] **Step 5: Styles for the new sections** — in `components/case/CaseStudy.module.css` add (and delete the now-unused `.features` rules):

```css
.pitch {
  display: grid;
  gap: 0.8rem;
  max-width: 46ch;
}
.problem {
  margin: 0;
  font-size: clamp(1.35rem, 2.6vw, 2rem);
  line-height: 1.25;
  font-weight: 700;
}
.outcome {
  margin: 0;
  font-size: clamp(1.05rem, 1.6vw, 1.25rem);
  line-height: 1.5;
  color: var(--dim);
}
.metrics dl {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2.5rem 2rem;
  margin: 0;
}
.metrics dd {
  margin: 0;
  font-family: var(--font-display);
  font-variation-settings: "opsz" 72;
  font-weight: 800;
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  line-height: 1;
  color: var(--sodium);
}
.metrics dt {
  margin-top: 0.35rem;
  color: var(--dim);
}
.story {
  padding-top: 4rem;
}
.role {
  margin: 0 0 1.4rem;
  text-align: center;
}
.role span {
  display: block;
  font-size: 0.82rem;
  color: var(--dim);
}
.stack {
  list-style: none;
  margin: 0 auto 2rem;
  padding: 0;
  display: grid;
  justify-items: center;
  gap: 0.35rem;
  font-size: 1.05rem;
}
.credits {
  text-align: center;
}
.credits .links {
  justify-content: center;
}
```

- [ ] **Step 6: Run to verify they pass**

Run: `npx tsc --noEmit && npm run build && npx playwright test`
Expected: all pass (the existing classified test still finds the "withheld" strip and the private-screening link).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Case study told as scenes: problem first, pinned features with spotlights, outcomes, credits"
```

---

### Task 9: The welcome — a film's opening for business owners

**Files:**
- Create: `lib/clock.ts`, `lib/clock.test.ts`, `components/theatre/Welcome.tsx`, `components/theatre/Welcome.module.css`, `components/theatre/RotatingLine.tsx`
- Modify: `components/theatre/Theatre.tsx`, `components/theatre/Theatre.module.css`
- Test: `lib/clock.test.ts`, `e2e/night.spec.ts`

**Interfaces:**
- Consumes: `useCinematic()` → `{ mode, ready }`.
- Produces: `clockLine(now: Date, visitorTimeZone?: string): { here: string; there: string | null }`; `HOME_TIME_ZONE = "Asia/Manila"`; event `ns:play` (plays the film from the welcome).

- [ ] **Step 1: Write the failing unit tests** — `lib/clock.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { clockLine } from "./clock";

const at = new Date("2026-10-06T15:58:00Z"); // 11:58 PM in Manila

describe("clockLine", () => {
  it("shows Lapu-Lapu time and the visitor's time when they differ", () => {
    expect(clockLine(at, "America/New_York")).toEqual({ here: "11:58 PM", there: "11:58 AM" });
  });
  it("shows only one clock for visitors in the Philippines' time", () => {
    expect(clockLine(at, "Asia/Manila")).toEqual({ here: "11:58 PM", there: null });
    expect(clockLine(at, "Asia/Singapore")).toEqual({ here: "11:58 PM", there: null });
  });
  it("survives a missing or invalid time zone", () => {
    expect(clockLine(at)).toEqual({ here: "11:58 PM", there: null });
    expect(clockLine(at, "Not/AZone")).toEqual({ here: "11:58 PM", there: null });
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run lib/clock.test.ts`
Expected: FAIL — `Cannot find module './clock'`.

- [ ] **Step 3: Implement `lib/clock.ts`**

```ts
/**
 * The welcome's location card: Jeon's time in Lapu-Lapu City and, when it differs,
 * the visitor's own time (from their browser), so the offshore point makes itself.
 */

export const HOME_TIME_ZONE = "Asia/Manila";

const format = (now: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone })
    .format(now)
    .replace(/\u202f/g, " ");

export function clockLine(now: Date, visitorTimeZone?: string): { here: string; there: string | null } {
  const here = format(now, HOME_TIME_ZONE);
  if (!visitorTimeZone) return { here, there: null };
  try {
    const there = format(now, visitorTimeZone);
    return { here, there: there === here ? null : there };
  } catch {
    return { here, there: null };
  }
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run lib/clock.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing e2e tests** — replace `describe("welcome")`'s first test and the "See the work" test:

```ts
  test("opens on the promise, the visitor's time and the name as a credit", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("While your office sleeps, your systems keep working.");
    await expect(page.getByText(/A night shift by .*Saquilabon Jr\./)).toBeVisible();
    await expect(page.getByText(/in Lapu-Lapu City/).first()).toBeVisible();
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
  });
```
Add a new describe below `describe("welcome")`:
```ts
test.describe("welcome, visitor abroad", () => {
  test.use({ timezoneId: "America/New_York" });
  test("shows the visitor's own time next to Lapu-Lapu's", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/where you are/)).toBeVisible();
  });
});
```
Replace `"See the work goes straight to the desk"` with:
```ts
  test("'See what I'd build for you' plays the film; the HUD's Work skips it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "See what I'd build for you" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "film", { timeout: 8000 });
    await page.keyboard.press("Escape");
    await toDesk(page);
    await expect(page.getByRole("button", { name: "Skip" })).toHaveCount(0);
  });
```
In `describe("reduced motion")` add:
```ts
  test("the rotating line is a static sentence", async ({ page }) => {
    await page.goto("/");
    // .last(): the first match is the screen-reader copy of the same sentence.
    await expect(page.getByText("…answering your calls, placing your trades, running your payroll.").last()).toBeVisible();
  });
```

- [ ] **Step 6: Run to verify they fail**

Run: `npm run build && npx playwright test -g "promise|visitor's own time|plays the film; the HUD|static sentence"`
Expected: FAIL — the h1 is still the name.

- [ ] **Step 7: RotatingLine** — `components/theatre/RotatingLine.tsx`:

```tsx
"use client";

/** "…answering your calls." typed and retyped like the laptop in the shot. Static in still mode. */

import { useEffect, useState } from "react";
import styles from "./Welcome.module.css";

const PHRASES = ["answering your calls.", "placing your trades.", "running your payroll."];
const SENTENCE = "…answering your calls, placing your trades, running your payroll.";

export function RotatingLine({ still }: { still: boolean }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (still) return;
    const full = PHRASES[i];
    const done = !erasing && n === full.length;
    const t = window.setTimeout(
      () => {
        if (!erasing && n < full.length) setN(n + 1);
        else if (!erasing) setErasing(true);
        else if (n > 0) setN(n - 1);
        else {
          setErasing(false);
          setI((i + 1) % PHRASES.length);
        }
      },
      done ? 1800 : erasing ? 28 : 55,
    );
    return () => window.clearTimeout(t);
  }, [i, n, erasing, still]);

  return (
    <p className={styles.rotating}>
      <span className="sr-only">{SENTENCE}</span>
      <span aria-hidden="true">
        {still ? (
          SENTENCE
        ) : (
          <>
            …{PHRASES[i].slice(0, n)}
            <span className={styles.caret} />
          </>
        )}
      </span>
    </p>
  );
}
```

- [ ] **Step 8: Welcome** — `components/theatre/Welcome.tsx`:

```tsx
"use client";

/**
 * The welcome copy, arriving like a film's opening titles over the bench shot:
 * the location card, the promise, the rotating line, then Jeon's name as a credit.
 */

import { useEffect, useState } from "react";
import { useCinematic } from "@/hooks/useCinematic";
import { clockLine } from "@/lib/clock";
import { RotatingLine } from "./RotatingLine";
import styles from "./Welcome.module.css";

function useClock() {
  const [line, setLine] = useState<ReturnType<typeof clockLine> | null>(null);
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tick = () => setLine(clockLine(new Date(), tz));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return line;
}

export function Welcome() {
  const { mode, ready } = useCinematic();
  const clock = useClock();

  return (
    <div className={styles.copy}>
      <div className={styles.inner}>
        <p className={styles.where}>
          {clock ? (
            <>
              {clock.here} in Lapu-Lapu City
              {clock.there && <span className={styles.there}> · {clock.there} where you are</span>}
            </>
          ) : (
            " "
          )}
        </p>
        <h1 className={`display ${styles.headline}`}>While your office sleeps, your systems keep working.</h1>
        <RotatingLine still={ready && mode === "still"} />
        <p className={styles.credit}>
          A night shift by <strong>Loreto “Jeon” Saquilabon Jr.</strong> · Full-stack developer &amp; AI automation
          engineer
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => window.dispatchEvent(new Event("ns:play"))}>
            {"See what I'd build for you"}
          </button>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => window.dispatchEvent(new CustomEvent("ns:open", { detail: "contact" }))}
          >
            Get in touch
          </button>
        </div>
      </div>
      <p className={styles.cue} aria-hidden="true">
        Scroll
      </p>
    </div>
  );
}
```

`components/theatre/Welcome.module.css` — move `.copy`, `.copyInner` (renamed `.inner`), `.actions`, `.primary`, `.ghost`, `.cue`, `@keyframes cue`, the `max-width: 899px` `.copy` rule and the still-mode `.cue` rule **out of** `Theatre.module.css` into this file unchanged, then add:

```css
.where {
  margin: 0 0 1.2rem;
  font-size: 0.95rem;
  color: var(--dim);
}
.there {
  color: var(--screen);
}
.headline {
  font-size: clamp(2.6rem, 6.4vw, 6.2rem);
  max-width: 13ch;
  text-shadow: 0 2px 40px rgba(5, 7, 12, 0.8);
}
.rotating {
  margin: 1rem 0 0;
  min-height: 1.6em;
  font-size: clamp(1.2rem, 2.2vw, 1.8rem);
  font-weight: 600;
  color: var(--sodium);
}
.caret {
  display: inline-block;
  width: 0.08em;
  height: 1em;
  margin-left: 0.08em;
  vertical-align: -0.12em;
  background: currentColor;
  animation: blink 1s steps(2) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.credit {
  margin: 1.6rem 0 0;
  max-width: 46ch;
  color: var(--dim);
}
.credit strong {
  color: var(--screen);
  font-weight: 600;
}
/* Opening titles: each line arrives in turn, then holds. */
.inner > * {
  animation: title-in 0.9s var(--ease-camera) both;
}
.inner > :nth-child(2) {
  animation-delay: 0.35s;
}
.inner > :nth-child(3) {
  animation-delay: 0.9s;
}
.inner > :nth-child(4) {
  animation-delay: 1.5s;
}
.inner > :nth-child(5) {
  animation-delay: 2s;
}
@keyframes title-in {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(6px);
  }
}
:global(html[data-mode="still"]) .inner > *,
:global(html[data-mode="still"]) .caret {
  animation: none;
}
```

- [ ] **Step 9: Theatre renders Welcome and handles `ns:play`** — in `components/theatre/Theatre.tsx` replace the whole `{/* The welcome copy scrolls away over the sticky picture. */} <div className={styles.copy}>…</div>` block with `<Welcome />` (import `{ Welcome } from "./Welcome"`). In the skip effect add:
```ts
    // "See what I'd build for you": a scroll down from the welcome, which plays the film.
    const onPlay = () => {
      if (phaseRef.current !== "welcome") return;
      const vh = window.innerHeight;
      if (lenis) lenis.scrollTo(vh, { duration: 1, force: true });
      else window.scrollTo({ top: vh, behavior: "smooth" });
    };
```
register `window.addEventListener("ns:play", onPlay);` and remove it in the cleanup.

- [ ] **Step 10: Run to verify they pass**

Run: `npx tsc --noEmit && npm test && npm run build && npx playwright test`
Expected: all pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "Welcome opens like a film for business owners: promise, visitor time, name as credit"
```

---

### Task 10: Records and preview

**Files:**
- Modify: `CLAUDE.md`, `docs/specs/2026-10-05-night-shift-design.md`

- [ ] **Step 1: Update `CLAUDE.md`** — replace the opening paragraph's flow sentence and the "Look" bullet with:

```md
Cinematic portfolio for Loreto "Jeon" Saquilabon Jr. Welcome loop (Jeon on a seawall bench at night, copy
aimed at business owners) → every scroll down from the welcome plays one 7 s film → the monitor wakes up
as a **light** screen: the work grouped by business problem (`content/tracks.ts`), project scenes with
spotlights, About / Side projects / Contact → a case opens as a full-screen light takeover at /work/[slug].
Design records: `docs/specs/2026-10-05-night-shift-design.md`, `docs/specs/2026-10-06-shift-assistant-design.md`.
```
```md
- Look: dark for the two videos and the site around them; everything on the monitor and the case view is
  light (`.screen-light` re-scopes the tokens; accent `#a04a08` on paper `#f5f1ea`). Big Shoulders /
  Hanken Grotesk; no mono labels, no 01/02/03, no count-up stats, no fade-up on every section.
- What the monitor shows is owned by `features/stage/stage.ts` (pure reducer); Phase 2's assistant
  dispatches the same commands.
- Every case study needs a `pitch` (track, problem, outcome; no digits); calls/trading/admin projects need
  2–3 `spotlights` positioned on `screen.poster`.
```

- [ ] **Step 2: Note the revision in the design record** — add under the title of `docs/specs/2026-10-05-night-shift-design.md`:

```md
> **Superseded in part (2026-10-06):** the desk and the case modal were replaced by the light screen and the
> case takeover — see `2026-10-06-shift-assistant-design.md`.
```

- [ ] **Step 3: Full gates**

Run: `npm test && npm run build && npm run test:e2e`
Expected: all unit tests pass; build ends with `leak-check: clean`; all e2e tests pass. Run `npm run test:e2e` twice more; any failure gets diagnosed, not retried away.

- [ ] **Step 4: Commit and push the preview branch**

```bash
git add -A
git commit -m "Docs: record the light screen and the business-first presentation"
git -c credential.helper= -c 'credential.helper=!gh auth git-credential' -c credential.username=bertulfojeon-alt push origin night-shift
```
Wait for the Vercel status on the pushed commit to be `success` (`gh api repos/bertulfojeon-alt/iamjeon/commits/$(git rev-parse HEAD)/status --jq .statuses[0].state`), then review the preview in Chrome (desk, a scene, a case, the welcome at 1440×900 and phone width) before reporting. Production (`main`) is not touched.
