# Night Shift — portfolio redesign (design record)

Status: approved in conversation 2026-10-05; build started the same day on branch `night-shift`.
The previous static site is preserved at tag `v1-static`.

## Idea
One night, one unbroken camera move. A developer in Lapu-Lapu City builds systems for clients
worldwide while the city sleeps. The site opens at midnight over the sea and ends at dawn, where the
visitor gets in touch. Cinema comes from camera, light, editing and sound — not film props.

## Running order (home, `/`)
1. **Sea** — scroll-scrubbed footage low over the Mactan channel; name rises over the city. Poster = LCP.
2. **Approach** — glide over rooftops toward the one lit window; three static proof points.
3. **Room** — through the window; footage ends on a wall of blank monitors and holds.
4. **Monitor wall (work index)** — live screens are placed onto the monitors (screen replacement,
   perspective transform from four marked corners). Chapters: Trading, Voice AI, SaaS & Operations,
   Classified. Clicking a screen match-cuts (React `<ViewTransition>`) into `/work/[slug]`.
5. **Archive** — readable list of smaller projects.
6. **Behind the desk** — about, story, skills.
7. **Dawn** — pull back out of the window as the sky turns to dawn; contact.

## Case study (`/work/[slug]`)
Cold open (best screen) → context → rising action (real UI close-ups, architecture assembling) →
key decision → resolution (numbers, each with a recorded source) → credits (role, stack, links) →
"Next screen".

## Tiers
- Flagship (full arc): TG Auto Trader, 247Aisupports, TradesByMerc, EZVibe (pre-release), SMC.
- Commissions (named client work): The Alpha Room, Unified CX, Ainalytics, AI Restaurant OS,
  SMM System, Automated video editor, Merc SMC Pro.
- Classified (anonymous, redacted, "Request a private screening"): PROJECT PAYDAY,
  PROJECT FACEGATE, PROJECT BALANCE SHEET. No link, launch date, product name, logo, domain or
  sample-company name may point at them. The real-name mapping lives outside this public repo.
- Archive: Karaoke, JeonScraper, Resolute AI site, Midnight Vibes, claude-orchestrator,
  UnsayBalita (fictional re-renders only), JelAI and UGC Spark (labelled "In development"),
  Project Genesis (the engine this site runs on).
- Excluded: Kairo; any third-party code presented as own work.

## Honesty rules
- Every number shown must carry a `source` (what was counted, where). The build rejects numbers
  without one.
- Third parties' personal data (customers, callers, students, employees, account numbers, balances)
  is blurred in every capture.
- Product UI keeps its true colours; the grade applies only to footage and site chrome.

## Look
- Palette from the scene: night `#05070c`, room `#0b1018`, screen light `#dfe8f2`, dim `#8693a6`,
  single accent sodium amber `#ff9a3c`; dawn `#f4b48a → #ffd9a8` appears only in the final scene.
- Type: Big Shoulders Display (titles), Hanken Grotesk (body), JetBrains Mono only for real code.
  No mono labels, no 01/02/03 numbering, no count-up stats, no fade-up on every section.
- Signature gesture: chapter titles "warm up" like a sodium streetlight (≈1 s), titles only.
- Match cuts 0.6 s desktop / 0.3 s mobile. Native cursor. Fine grain + screen-edge halation.
- Sound off by default; opt-in toggle; per-scene ambience (waves, rain, keys, dawn birds).

## Accessibility & modes
- Modes chosen automatically: **full** (desktop), **lite** (touch/low-power: vertical cuts, stacked
  screens, simple expand), **still** (reduced motion / Save-Data: posters + crossfades, no Lenis).
- Always-visible "Pause motion" (WCAG 2.2.2) and chapter menu. All text in semantic HTML,
  keyboard reachable, visible focus.

## Build
- Next.js 16 App Router, React 19, TypeScript, Tailwind v4, GSAP 3.13+, Lenis. No three.js.
- Scroll footage: ported Project Genesis engine (canvas image sequences) with fixes: lazy per-scene
  loading, desktop/mobile frame sets, reduced-motion static layout, poster shown until first paint,
  scene chaining. `scripts/video-to-frames` converts Flow clips.
- Content: one typed file per project in `content/projects/`, validated with zod.
- Leak check after every build: hashed denylist scan of build output + OCR of images and sampled
  video frames; any hit fails the build.
- Tests: Vitest (content rules, leak check, homography, mode selection), Playwright e2e, Lighthouse
  budgets (LCP ≤ 2.5 s mobile, CLS ≤ 0.05, ≤ 200 KB gz JS excluding media).
- Deploy: Vercel preview for review before replacing production.

## Assets (Google Flow, Veo 3.1, 16:9 1080p 8 s)
Keyframes K1 sea midnight, K2 rooftops + one lit window, K3 window outside, K4 room with six blank
monitors, K6 window at dawn, K7 sea at sunrise. Chained clips C1 K1→K2, C2 K2→K3, C3 K3→K4,
C4 K6→K7. Loops L1 sea, L2 room rain. Placeholders are used until the real clips arrive.
