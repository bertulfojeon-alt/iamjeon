# Night Shift — iamjeon portfolio

Cinematic portfolio for Loreto "Jeon" Saquilabon Jr. Welcome loop (Jeon on a seawall bench at night)
→ first scroll plays one 7 s film (sea → rooftops → window → he sits at his desk → push-in to the
monitor) → the monitor becomes a live desktop of the work → projects open in modals.
Design record: `docs/specs/2026-10-05-night-shift-design.md`. Old static site: tag `v1-static`.

## Stack
Next.js 16 App Router · React 19 (`<ViewTransition>` match cuts) · TypeScript · Tailwind v4 (tokens in
`app/globals.css`) · Lenis (smooth scroll) · zod. No three.js/WebGL — the film is a plain `<video>`; the desktop is
DOM projected onto the monitor with a homography (`lib/homography.ts`, `content/theatre.json`).

## Commands
- `npm run dev` / `npm run build` (build runs the leak check) / `npm start`
- `npm test` (Vitest: content rules, homography, modes) · `npm run test:e2e` (Playwright, system Edge; build first)
- `npm run theatre` — encode `media-src/flow/{welcome,film}.mp4` (gitignored sources) into
  `public/media/theatre/` and print the monitor corners for `content/theatre.json`
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
- Look: palette from the scene (sodium amber `#ff9a3c` is the only accent; dawn colours only in the contact scene);
  Big Shoulders / Hanken Grotesk; no mono labels, no 01/02/03, no count-up stats, no fade-up on every section.
  The sodium warm-up (`WarmTitle`) is for chapter titles only.
- Content: one file per project in `content/projects/`; registry and ordering in `content/index.ts`.
- After replacing the film, re-run `npm run theatre` and update the monitor corners in `content/theatre.json`.
- Classified captures: masking rules and addresses live in `F:\ME\portfolio-private\capture.json`; every
  classified image is reviewed by the owner before it is committed.

## Verify before claiming done
`npm test && npm run build && npm run test:e2e` — all green, leak check "clean".
