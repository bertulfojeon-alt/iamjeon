# Status and handoff — read this first

Last updated 2026-10-07. The owner is Loreto "Jeon" Saquilabon Jr. (repo `bertulfojeon-alt/iamjeon`).

## Where things stand

- **Live:** https://iamjeon.vercel.app serves `main`, pushed 2026-10-07 on the owner's explicit
  "push to main". The last code change is `d6e97d9` (phones: full-page desk; headline font as fixed files). `main` and `night-shift`
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
8. **Devices:** iOS page hold, safe areas, no zoom on input, a compact welcome for landscape phones,
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

The owner has asked about the AI assistant. It is **not started**. It follows the assistant spec, Parts 3–4.

- **Phase 2, the guided tour:** a greeting after the film, a branching script (`content/tour.ts`) with a
  pre-voiced TTS voice and subtitles, answer buttons, and a contact handoff. The tour drives the screen
  through the stage reducer, so add tour commands there rather than a second path.
  The spec's stage names (`greeting | tour | scene | case | explore | contact`) predate the current
  dashboard: map them onto `grid / show / panel` plus whatever the tour needs.
- **Phase 3, the live conversation:** the Gemini Live API from the browser, with these pieces:
  - an ephemeral-token route `app/api/shift/token`;
  - function calls into the same stage commands;
  - a knowledge pack of public fields only, under about 6K tokens, scanned by the leak check;
  - a 5-minute cap, a Vercel WAF rate limit, and an eval script.
- **Waiting on the owner before Phase 2 or 3 can start:**
  1. the assistant's name ("Shift" is a placeholder);
  2. the voice, picked from a short audition Claude prepares in Phase 2;
  3. Gemini billing enabled, plus the daily budget cap amount. Phase 3 must not go live on the free tier:
     free-tier data may be used for training, and visitors' voices are personal data.
  4. a reviewed `content/resume.md`, the text of the public résumé, for the knowledge pack.
- **Also open:** the owner should check the live site on a real iPhone and Mac. The automated Safari runs
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
