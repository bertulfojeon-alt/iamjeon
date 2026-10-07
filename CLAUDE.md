# Night Shift — iamjeon portfolio

Cinematic portfolio for Loreto "Jeon" Saquilabon Jr. Welcome loop (Jeon on a seawall bench at night, copy
aimed at business owners) → every scroll down from the welcome plays one 7 s film → the monitor wakes up
as a **light project dashboard** that opens on All work: a Browse sidebar (project groups by business problem
from `content/tracks.ts`, services and skills from `content/services.ts`, a get-in-touch card) and a grid of
project cards with category chips and search. A card opens the project in full in the pane (video, screens,
features with spotlights, numbers, stack, story behind a button); About / Contact are panels. Opening a project
pushes /work/<slug> (shareable; direct visits get the full page); "All projects" and Back return to the grid. At the desk, scrolling never returns to the hero — the ↑ button does.
Design records: `docs/specs/2026-10-05-night-shift-design.md`, `docs/specs/2026-10-06-shift-assistant-design.md`,
`docs/specs/2026-10-07-jun-voice-twin-design.md` (Jun, the voice assistant; replaces the 10-06 tour).
Old static site: tag `v1-static`.
**Current status, what is built, what to build next and the open owner decisions: `docs/STATUS.md` (read it first).**

## Stack
Next.js 16 App Router · React 19 (`<ViewTransition>` match cuts) · TypeScript · Tailwind v4 (tokens in
`app/globals.css`) · Lenis (smooth scroll) · zod. No three.js/WebGL — the film is a plain `<video>`; the desktop is
DOM projected onto the monitor with a homography (`lib/homography.ts`, `content/theatre.json`).

## Commands
- `npm run dev` / `npm run build` (build runs the leak check) / `npm start`
- `npm test` (Vitest: content rules, homography, modes) · `npm run test:e2e` (Playwright; build first): Edge desktop +
  phone, WebKit iPhone 15 + MacBook (`e2e/devices.spec.ts` sweeps phones, iPads, laptops and desktops). WebKit comes
  from `npx playwright install webkit`; if its downloader times out, curl the zip it names into
  `%LOCALAPPDATA%\ms-playwright\webkit-<rev>` with an empty `INSTALLATION_COMPLETE` file.
- `npm run theatre` — encode `media-src/flow/{welcome,film}.mp4` (gitignored sources) into
  `public/media/theatre/` and print the monitor corners for `content/theatre.json`
- `npm run jun-media` — encode Jun's badge clip (`media-src/jun/wave-source.mp4`, gitignored) into
  `public/media/jun/` · `npm run jun:audition` / `npm run jun:eval` — voice samples and the live eval (need
  `GEMINI_API_KEY` in `.env.local`; never open or print that file)
- `npm run capture [slug]` — record public sites; `scripts/capture/live-session.mjs` records dashboards
  from an Edge window the owner logged into (debug port 9333, profile in `F:\ME\portfolio-private`)

## Hard constraints
- **Public repo.** Classified projects (PROJECT PAYDAY / FACEGATE / BALANCE SHEET) must never carry a real
  product name, client, domain, logo or sample-company name. The real mapping lives only in
  `F:\ME\portfolio-private` (outside the repo). The denylist is SHA-256 hashes only
  (`scripts/leak-denylist.json`); never add plain words to the repo.
- Every metric needs a `source` (zod-enforced). Never show an unverified number.
- Third parties' personal data (customers, callers, students, employees, accounts, balances) is blurred in captures.
- Modes are decided before paint by `features/cinematic-engine/mode-script.ts` (keep in sync with `lib/mode.ts`);
  per-mode layout lives in CSS keyed off `html[data-mode]`. "still" must stay fully readable with no motion.
- Look: dark for the two videos and the site around them; everything on the monitor and the case view is
  light (`.screen-light` re-scopes the tokens; accent `#a04a08` on paper `#f5f1ea`). Big Shoulders /
  Hanken Grotesk; no mono labels, no 01/02/03, no count-up stats, no fade-up on every section.
  The sodium warm-up (`WarmTitle`) is for chapter titles only.
- What the monitor shows is owned by `features/stage/stage.ts` (pure reducer); Jun (the voice assistant)
  dispatches the same commands.
- Jun (voice assistant): its instruction is built on the server and sent to the browser, so
  `lib/jun/instruction.test.ts` runs the denylists over it; `/work` pages never embed the full project list
  (classified pages must not carry other projects' names). Every Jun tool call goes through `features/jun/tools.ts`.
- Every case study needs a `pitch` (track, problem, outcome; no digits); calls/trading/admin projects need
  2–3 `spotlights` positioned on `screen.poster`.
- Content: one file per project in `content/projects/`; registry and ordering in `content/index.ts`.
- Services (`content/services.ts`) each name the projects that prove them; no figures in service copy.
- After replacing the film, re-run `npm run theatre` and update the monitor corners in `content/theatre.json`.
- Classified captures: masking rules and addresses live in `F:\ME\portfolio-private\capture.json`; every
  classified image is reviewed by the owner before it is committed.

## Verify before claiming done
`npm test && npm run build && npm run test:e2e` — all green, leak check "clean".
