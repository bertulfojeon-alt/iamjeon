# Status and handoff — read this first

Last updated 2026-10-07. The owner is Loreto "Jeon" Saquilabon Jr. (repo `bertulfojeon-alt/iamjeon`).

## Where things stand

- **Live:** https://iamjeon.vercel.app serves `main`, pushed 2026-10-07 on the owner's explicit
  "push to main". The last code change is `2fa72cc` (iOS video fixes, below). `main` and `night-shift`
  point at the same commit.
- **Work branch:** `night-shift` gets a Vercel preview on every push. Production changes only when `main`
  moves, and only on the owner's explicit say-so.
- **Push** (the default credential helper is not logged in to this account):
  `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' -c credential.username=bertulfojeon-alt push origin <branch>`
  Then poll `gh api repos/bertulfojeon-alt/iamjeon/commits/<sha>/status` until the state is `success`.
- **Gates** (all green at `6019f2f`): `npm test` 109 passed · `npm run build` with leak check "clean" ·
  `npx playwright test` 193 passed, 55 skipped by design, across Edge desktop, Edge phone, WebKit
  iPhone 15 and WebKit MacBook.

## What is built (Phase 1 of the assistant spec, plus everything asked for since)

Design records: `docs/specs/2026-10-05-night-shift-design.md` (the site) and
`docs/specs/2026-10-06-shift-assistant-design.md` (the assistant; Phase 1 = presentation).

1. **Welcome:** a bench-at-night loop, copy aimed at business owners, a location card with the visitor's
   time, a rotating line and two buttons. "See what I'd build for you" plays the film; "Get in touch"
   goes straight to Contact.
2. **Film:** a 7 s shot plays on every scroll down from the welcome. Skip or Esc ends it; a film stalled
   for 8 s gives way to the desk.
3. **Desk:** the light monitor (`components/screen/`), projected with a homography. It becomes a full
   panel on tall or narrow screens, and whenever the projection would make text too small.
   - **All work** (`WorkGrid.tsx`): a Browse sidebar with project groups by business problem
     (`content/tracks.ts`), services (`content/services.ts`; each one names the projects that prove it)
     and skills, plus a get-in-touch card. The grid has status badges, summaries, tools and search.
     Category chips appear only on phones (the owner asked to remove them on desktop).
   - **Project pane** (`ProjectPane.tsx`): the problem and outcome, "Visit live site", then the proof:
     - a landing-page scroll recording first when the project has one (`screen.landing`);
     - the coded demo under "Inside the product";
     - then Screens, Features with spotlights, Numbers, Built with, and the story behind a button.
   - About and Contact are panels. Contact: bertulfojeon@gmail.com, WhatsApp +63 968 4333 479,
     Viber +63474660563, the owner's photo and the résumé PDF.
   - The stage reducer (`features/stage/stage.ts`) has the commands `grid`, `show(slug)`,
     `panel(about|contact)` and `back`. Opening a project pushes `/work/<slug>`; Back returns to the grid.
4. **Case pages:** a direct visit to `/work/<slug>` gives the full case study (all 21 projects).
5. **Defaults:** sound is on but waits for the first click or key press; motion plays on every visit.
   "Pause motion" lasts for the current visit only. Reduced motion and data saver get still mode.
6. **Copy rules:** no em dashes or AI filler in visible text, and no figures in pitches or service copy.
   Every metric has a `source`. Marketing must be honest, never exaggerated.
7. **Phones:** the desk is a full page under the top bar (not a floating panel); the welcome copy hides
   once left, so it never peeks in behind the top bar when a phone's toolbar shrinks the viewport.
   Headlines use two fixed-weight Big Shoulders files (`app/fonts/`), because WebKit on Windows (the
   Playwright Safari engine) draws the variable font hairline-thin.
8. **iOS video rules** (learned on the owner's iPhone, iOS 16):
   - never hide a video that is waiting to start, because iOS refuses to start a hidden one;
   - starting media and turning sound on happen only inside a tap or key press (a swipe is not a tap),
     so a tap starts a welcome loop that Low Power Mode refused, and approves the film;
   - `e2e/night.spec.ts` imitates these rules in Chromium (`iosMediaRules`).
   iOS Reduce Motion gives still mode on purpose (a still hero, and no film).
   **Verified on a real iPhone (iOS 16, Safari and Brave) on 2026-10-07:** the owner's phone had Reduce
   Motion on, which was why the hero looked static and the film was skipped. With it off, the welcome
   loop and the film play. If a visitor reports "no video on iPhone", check Reduce Motion and Low
   Power Mode first.
9. **Devices:** iOS page hold, safe areas, no zoom on input, a compact welcome for landscape phones,
   a slow-network film skip, and media cached for a day. First paint on a throttled 4G phone
   (4× CPU) is about 1.5 to 1.8 s; first load is about 374 KB, and the videos come after it.

### Content

- **21 projects** in `content/projects/`: calls 2, trading 5, admin 3 (all classified), more work 4, side 7.
- **Landing scroll recordings:** TradesByMerc, The Alpha Room and SMC Classroom (their loop is the
  landing page); 247aisupports, EZVibe, Unified CX, TG Auto Trader and JeonScraper (`screen.landing`).
  The recipes are in `scripts/capture/recipes.mjs`.
  - Unified CX runs locally: `npx next dev -p 3011` in `F:\Work\Unified Telco`.
  - TG Auto Trader runs locally: `npm run dev` in `F:\TGAutoTrader\web-dashboard` (port 3001).
  - Karaoke runs on localhost:5173.
- **No landing page:** Ainalytics, SMM System and Merc SMC Pro have none.
- **Classified:** PAYDAY, BALANCE SHEET and FACEGATE never get landing pages; their taglines are searchable.
- **Project Genesis** was removed at the owner's request.

## What to build next

**Jun, Jeon's AI twin: built on `night-shift`, not on the live site.** Design:
`docs/specs/2026-10-07-jun-voice-twin-design.md` (it replaces the pre-voiced tour of the 2026-10-06 spec).
Plan and record: `docs/superpowers/plans/2026-10-07-jun-voice-twin.md`.

**What it is:**
- Voice only (Gemini Live, no chat). It knows the whole portfolio and offers a full-screen presentation of
  the work, driven by function calls.
- A floating badge, bottom right: mini Jeon in a glowing ring with a "Talk to me" pill. He waves 4 s after
  the desk appears, then once a minute. Only at the desk and on `/work/<slug>`. The ↑ button is
  bottom centre on every layout.

**Owner decisions:**
- **name:** Jun;
- **persona:** first person as Jeon's AI twin, always says it is an AI;
- **voice:** calm male; `Charon` until the owner picks from the audition;
- **tier:** free for development, with `gemini-3.8-live` first and the native-audio model as fallback;
- **résumé:** as is (`content/resume.md`).

**How it is built:**
- `app/api/jun/token`: a single-use Live token that locks the model, voice, instruction and tools. It
  checks the origin and has a kill switch (`JUN_KILL=1`).
- `lib/jun/instruction.ts`: the persona, the rules and the project index. A unit test runs the leak check's
  denylists over it, because the build check skips server code.
- `features/jun/`: the tool bridge (`tools.ts`, every call checked), the presentation reducer, the live
  session (mic worklet, quota fallback, 5-minute cap), and `Jun.tsx`.
- `components/jun/`: the badge, the call card and the presentation stage.
- `/work` pages do not embed the project list: a classified case page may not carry other projects'
  names. Jun fetches `/api/jun/items` when the card opens.
- The badge clip: `npm run jun-media` encodes `media-src/jun/wave-source.mp4` (the owner's green-screen
  clip) into a stacked-alpha H.264 file, joined on a canvas.

**Tests:**
- unit: config, route, instruction, tools, reducer, session, audio, stacked alpha;
- `e2e/jun.spec.ts`: placement, geometry at five widths, wave, still mode, mic refusals, and a mock Live
  call through the whole presentation, quota fallback and busy.

**Waiting on the owner:**
1. `GEMINI_API_KEY`:
   - in `.env.local` (then run `npm run jun:audition` and `npm run jun:eval`);
   - in Vercel (Production and Preview).

   Without it the call card says it could not connect.
2. The voice pick from `media-src/jun/audition/`, which becomes `JUN_VOICE`.
3. A Vercel WAF rule: `/api/jun/token`, 5 requests per 10 minutes per IP, answered with 429.
4. Read the eval transcript (`test-results/jun-eval.md`) before Jun goes further.
5. Billing, before Jun moves to `main`. On the free tier Google may use what visitors say to train its
   models; the call card says so.

**Not verified yet:**
- a real call against Google (no key yet);
- `gemini-3.8-live` accepting the locked setup;
- Safari and iPhone audio. Playwright's Windows WebKit has no Web Audio; there the card says the
  browser cannot hold a call.

- **Also open:** a check on a real Mac (the iPhone was checked on 2026-10-07). The automated Safari runs
  use WebKit on Windows, which cannot reproduce touch momentum, Low Power Mode or iOS toolbar resizing,
  and in iPhone emulation the film starts but does not advance.

## Hard rules (also in CLAUDE.md)

- **Public repo:** classified projects never carry a real product name, client, domain, logo or sample
  company. Never give a clue that would lead someone to the classified products' live sites.
  - The real mapping, masking rules and capture addresses live only in `F:\ME\portfolio-private`.
  - The denylist holds SHA-256 hashes only.
- Every classified image is reviewed by the owner before it is committed.
- Third parties' personal data is blurred in captures. Never capture the super-admin console of
  247aisupports.
- Never open or print `.env*`, `Logins.txt`, `VPS.txt`, MT5 or admin login files, or service-account
  JSON. Never commit secrets.
- Claude does not type or submit passwords. The owner logs in, then Claude captures.
- Leave `F:\EZVibe\src-tauri\Cargo.toml` untouched.
- Confirm before outward actions (pushing `main`, replacing production, publishing).

## How to resume

- Read `CLAUDE.md` (commands, constraints, look rules), then this file, then the spec for whatever comes next.
- **WebKit for the Safari tests:** `npx playwright install webkit`. If its downloader times out, curl the
  zip it names into `%LOCALAPPDATA%\ms-playwright\webkit-<rev>` and add an empty `INSTALLATION_COMPLETE`.
- **Captures:**
  - public sites: `node scripts/capture/run.mjs <recipe>`;
  - project showcases: `scripts/capture/showcase.mjs`;
  - logged-in dashboards: done in the owner's Chrome through the Claude-in-Chrome extension, with masks
    from the private config.
