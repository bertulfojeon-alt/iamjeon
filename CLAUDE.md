# Night Shift — iamjeon portfolio

Cinematic portfolio for Loreto "Jeon" Saquilabon Jr. One night, one unbroken camera move: sea at
midnight → rooftops → the lit window → a wall of monitors (the work index) → dawn (contact).
Design record: `docs/specs/2026-10-05-night-shift-design.md`. Old static site: tag `v1-static`.

## Stack
Next.js 16 App Router · React 19 (`<ViewTransition>` match cuts) · TypeScript · Tailwind v4 (tokens in
`app/globals.css`) · GSAP + ScrollTrigger · Lenis · zod. No three.js/WebGL — footage is canvas image
sequences (`features/cinematic-engine`, ported from Project Genesis).

## Commands
- `npm run dev` / `npm run build` (build runs the leak check) / `npm start`
- `npm test` (Vitest: content rules, homography, modes) · `npm run test:e2e` (Playwright, system Edge; build first)
- `npm run frames` — convert Google Flow clips in `F:\ME\flow` (C1–C4, L1–L2) into footage
- `npm run gen:placeholders [c1 c2 c3 c4 screens]` — procedural stand-in footage / screen posters

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
- After replacing the room plate (C3's last frame), re-mark the six monitor corners in `content/room.json`.

## Verify before claiming done
`npm test && npm run build && npm run test:e2e` — all green, leak check "clean".
