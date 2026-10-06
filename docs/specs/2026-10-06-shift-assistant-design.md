# Shift — the assistant, the light monitor and the new welcome (design record)

Status: Parts 1–2 approved in conversation 2026-10-06. Parts 3–4 (live conversation, architecture)
were written straight into this spec at the owner's request and are reviewed here for the first time.
Builds on `2026-10-05-night-shift-design.md` (the welcome loop and the film stay as they are).

## Why
Visitors are **business owners**, not developers. They want to know what Jeon can do for *their*
business. The current site shows a dashboard-style card grid after the film and a blog-style case
study; neither hooks a client. Success: a visitor who arrives curious sees, within about a minute,
work that solves a problem like theirs, and leaves through Email, WhatsApp or Viber with a reason to
write.

Two things carry this:
1. **Shift**, an AI assistant that appears after the film, speaks, and guides the visitor with tap
   answers or their voice. Jeon builds AI voice agents for a living, so Shift is also a live demo of
   what he sells: it has to be good, not merely present.
2. **A new presentation**: the monitor turns light, projects are shown as business problems solved
   rather than as screenshots in cards, and the welcome opens like a film aimed at clients.

Target clients, in the order Shift offers them: **support & sales calls**, **trading & finance**,
**back-office & HR**. Marketing/content work stays reachable but is not steered toward.

## Part 1 — The experience flow (approved)

1. **Welcome and film** run as today (Part 2a changes the welcome's copy only).
2. **Landing.** When the film ends, the monitor wakes up as Shift: an amber voice waveform, subtitles,
   answer buttons and a mic button.
   *"Hi, I'm Shift, Jeon's assistant. I can show you what he could build for your business, or you
   can look around on your own."* — **Show me** · **I'll explore** · 🎙
   Browsers do not treat scrolling as permission for sound, so this first line is subtitles with a
   silent waveform pulse. Voice starts with the visitor's first tap, which also unlocks the mic.
   Visitors who skip the film (Skip, Esc, "See the work") land on the same greeting.
3. **One qualifying question.** *"What's costing your business the most time right now?"*
   **Calls and messages we can't keep up with** · **Trading — tools, signals or education** ·
   **Admin — payroll, attendance, bookkeeping** · **Something else** (opens the mic, or shows all work).
4. **Proof — two or three scenes for the chosen track.** Each scene is problem → what Jeon built →
   what changed: the problem in the client's words, the project playing on the monitor while Shift
   spotlights the two or three features that solve it, then the outcome (verified numbers only).
   Buttons: **How does it work?** (opens the case view, Part 2b) · **Another example** ·
   **This is what I need** (goes to the close).
   - Calls → 247Aisupports, Unified CX, the voice router.
   - Trading → TG Auto Trader, TradesByMerc, The Alpha Room.
   - Admin → PROJECT PAYDAY, PROJECT FACEGATE, PROJECT BALANCE SHEET, presented openly as client work
     under NDA with names withheld.
   - Something else → explore mode with Shift collapsed.
   After the last scene of a track Shift offers **another track** or **the close**.
5. **The close.** *"Want to tell Jeon about it?"* Two tap questions — what kind of business, and how
   soon (this month / this quarter / just exploring) — then **Email** · **WhatsApp** · **Viber**, each
   carrying a short summary of what the visitor chose or said. Or **Keep looking**.
6. **Always available:** 🎙 (a live conversation, Part 3), **Mute** (subtitles stay, voice stops),
   **Explore myself** (Shift shrinks to an amber "Ask Shift" chip on the monitor; one tap brings it back
   where it left off).
7. **Explore mode** — the light project grid of Part 2b, with Shift one tap away.

A visitor who only taps reaches their most relevant work and the contact step in about 60–90 s.

## Part 2 — Look and feel (approved)

### 2a. The welcome: a film's opening, aimed at business owners
The name becomes a credit; the headline becomes a promise to the client. Copy is a draft for the
owner to edit.
- **Location card** (top left, small): *"11:58 PM in Lapu-Lapu City · 9:58 AM where you are."* The
  visitor's time comes from their own browser (`Intl` time zone), so it is always true. Visitors in the
  Philippines see only the first half.
- **Headline:** *"While your office sleeps, your systems keep working."*
- **Rotating amber line** under it, typed like the laptop in the shot, cycling the three target
  markets: *…answering your calls.* / *…placing your trades.* / *…running your payroll.*
- **Credit:** *"A night shift by Loreto 'Jeon' Saquilabon Jr. · Full-stack developer & AI automation
  engineer."*
- **Buttons:** **See what I'd build for you** (plays the film; Shift follows) · **Get in touch**.
- The pieces arrive one after another over 3–4 s like opening titles, then hold. Scroll cue and
  scroll-to-film behaviour unchanged. Still mode: everything visible at once, the line does not rotate
  (it shows all three as a sentence).

### 2b. Everything on the monitor is light
Dark remains for the two videos and the site around them (welcome, film, HUD). Everything shown **on**
the monitor is light.
- **A bright screen in a dark room.** Warm off-white screen, near-black text, a soft light spill onto
  the desk plate around it. Sodium amber stays the accent, in a deeper shade on light so text meets
  WCAG AA contrast. Tokens are scoped to the monitor (`.screen` scope), so the dark site is untouched.
- **Shift on light:** amber waveform, subtitles in large dark type, pill buttons, mic button.
- **Project scenes are full-screen on the monitor**, not cards: a large readable headline (the
  problem, then the result), the product as a framed app window (most products are dark UIs, so they
  read like apps on a keynote slide), and **feature spotlights** — amber markers on the screenshot with
  short labels, lighting one at a time.
- **Case view ("How does it work?")** pushes further in: the monitor grows to fill the browser (still
  light) and the case plays as full-screen scroll scenes — the business problem, each main feature as
  its own scene with the screen pinned and the relevant part spotlighted, verified outcomes as large
  titles, and the tech stack as closing credits. URLs stay `/work/[slug]` (shareable; direct visits get
  the same view as a page). The current modal-in-a-box is retired.
- **Explore mode:** a light grid of large previews grouped by **business problem** (Calls & messages,
  Trading, Admin & back-office, More work), not by technology. Each preview: one readable crop, a
  one-line problem → result, loop on hover. About, Side projects and Contact also open on the light
  screen.
- Rules from the existing design record still hold: Big Shoulders / Hanken Grotesk, no mono labels,
  no zero-padded numbering, no count-up stats, no fade-up on every section.

## Part 3 — The live conversation (new in this spec)

**Approach A (approved): a prepared tour plus a live conversation.**

### The prepared tour (button path)
- The tour is a small branching script in `content/tour.ts`: each step has the line Shift says, its
  subtitle text (the same words), the screen command(s) it triggers, and its answer buttons.
- Lines are voiced once at build time by `gemini-3.8-flash-tts` with one prebuilt voice, through
  `npm run voice`. Audio is cached by a hash of (text, voice, style), so only changed lines are
  regenerated; output is encoded to small Opus/MP3 files under `public/media/voice/`.
- Plays instantly, costs nothing per visit, and never misquotes a number (the script is written from
  content with sources and reviewed by the owner).

### The live conversation (mic path)
- Tapping 🎙 opens a spoken conversation with **`gemini-3.8-live`** over the Live API WebSocket,
  directly from the browser, authorised by a **single-use ephemeral token** from our server.
- Audio: mic → AudioWorklet → 16 kHz 16-bit PCM up; 24 kHz PCM down, played through Web Audio. The
  Live API's input and output transcriptions drive the subtitles (and a faint "You said…" line).
- **Shift controls the screen through function calls** — the same commands the tour uses:
  `show_track(track)`, `show_project(slug)`, `spotlight(slug, feature)`, `open_case(slug)`,
  `open_contact(channel?, summary)`, `explore()`. The client validates every call (unknown slug or
  feature → ignored, and Shift is told so) before dispatching it.
- **Hand-back:** when the visitor stops talking, the buttons for the current screen reappear, so the
  tour can continue from wherever the conversation left the screen.
- **Limits:** a conversation is capped at 5 minutes (well under the 15-minute audio session limit);
  near the cap Shift offers the close. One live session per page view at a time.

### What Shift knows and how it behaves
- **Knowledge pack**, generated at build time from the same public sources the site renders:
  each case-study project's public fields (kept compact — under ~6K tokens in total, see Quota) (title, logline, industry, the new `pitch` and spotlights,
  features, metrics value + label, stack, status, role, public links), a reviewed résumé file
  `content/resume.md` (text from the public résumé PDF, owner-reviewed), the About copy, and the
  contact options. The model never receives anything the site does not already show, so no prompt
  can extract a classified client's name: it is not in the context. The leak check scans the
  generated pack (Part 4).
- **System instruction (server-side only):**
  - Speaks as *Jeon's assistant*, never as Jeon; says it is an AI if asked.
  - Business-first: asks about the visitor's business, answers in terms of outcomes, uses projects
    as proof.
  - States only facts in the knowledge pack; numbers only as given there. If it does not know, it
    says so and offers to pass the question to Jeon (the close).
  - No prices, quotes, timelines or commitments on Jeon's behalf; budget questions get "it depends on
    scope — Jeon replies personally" and the close.
  - Classified projects: describes what was built, never who for; does not speculate.
  - Off-topic or abusive input: one short, polite redirect, then the close.
  - Replies in the visitor's language when they speak another one.
  - Short spoken turns (one to three sentences), ending with a question or an offer.
- **Voice:** the same prebuilt voice as the tour narration, so the hand-over is seamless (to verify
  that the voice exists for both models during the build; otherwise the closest match).

### Fallbacks
- **Mic denied or unavailable:** buttons continue to work; the mic button explains and hides.
- **Token refused (rate limit, quota, outage):** Shift plays a prepared line — *"My live line is busy
  right now — here's how to reach Jeon directly"* — and shows the close.
- **Connection drops mid-conversation:** subtitles show what was said so far; buttons return.
- **Sound off / Mute:** everything Shift says is always on screen as subtitles.
- **Still mode / reduced motion:** the same flow without animation; the waveform is a static mark.
- **No JavaScript / bots:** the welcome copy and the project pages render as HTML.

### Contact handoff
- **Email:** `mailto:` with subject and the summary as body.
- **WhatsApp:** `https://wa.me/<number>?text=<summary>` (pre-filled).
- **Viber:** Viber links cannot pre-fill a message to a specific number, so Shift copies the summary
  to the clipboard, says so, and opens `viber://chat?number=<number>`.
- The summary is built on the client from the visitor's choices or the conversation (Shift's
  `open_contact` summary argument), at most ~500 characters, and the visitor sees it before sending.

## Part 4 — Architecture, safety and testing (new in this spec)

### Units
- **Stage controller** (`features/stage/`): a reducer that owns what the monitor shows —
  `greeting | tour | scene | case | explore | contact` plus the current project/feature. Both the tour
  buttons and Shift's function calls dispatch the same commands; one code path, unit-tested.
- **Monitor screen** (`components/screen/`): the light UI — Shift panel, scenes with spotlights,
  case view, explore grid, contact. Replaces `components/theatre/Desktop.tsx` and the case modal.
- **Tour** (`content/tour.ts` + `features/shift/tour.ts`): the branching script and its player
  (audio + subtitles + buttons).
- **Live client** (`features/shift/live/`): token fetch, WebSocket session, mic capture worklet,
  audio playback, transcription → subtitles, function-call bridge to the stage controller.
- **Token route** (`app/api/shift/token/route.ts`, Node runtime): the only server code. Mints a
  single-use ephemeral token (`uses: 1`, short `expireTime`, `newSessionExpireTime` ~1 min) with the
  model, system instruction, tools and knowledge pack locked server-side via
  `liveConnectConstraints`. Checks `Origin` against the production and preview hosts.
  *To verify at the start of Phase 3:* the docs list `model`, `responseModalities` and
  `sessionResumption` as lockable and say system instructions can be kept server-side; if tools or
  the system instruction cannot be locked into the token, the route instead relays the session
  (browser ↔ our function ↔ Live API) so the instruction never reaches the browser.
- **Knowledge builder** (`scripts/build-knowledge.mjs`): writes the pack at build time from content;
  run by `npm run build` before the leak check.
- **Voice builder** (`scripts/voice.mjs`, `npm run voice`): TTS for tour lines, cached by hash. Run
  locally by the owner when lines change; audio files are committed.

### Content additions (schema)
Per case-study project, optional at first and required for projects in a tour track:
- `pitch: { track: "calls" | "trading" | "admin" | "other", problem: string, outcome: string }` —
  problem in the client's words, outcome as plain language (numbers only via `metrics`).
- `spotlights: [{ feature: string, x: number, y: number, label: string }]` — marker positions as
  percentages on the project's screen image; `feature` must match one of `features`.
Drafted from existing content by Claude, reviewed by the owner (classified ones especially).

### Secrets, cost and abuse
- `GEMINI_API_KEY` lives only in Vercel env (production + preview), never `NEXT_PUBLIC_`, never in the
  repo. The browser only ever holds a single-use token that expires within minutes.
- **Vercel WAF rate limit** (one rule, available on Hobby): `/api/shift/token`, 5 requests per 10 min
  per IP → 429, which triggers the "line is busy" fallback.
- **Spending cap** on the Google side: a budget alert and a daily quota on the API key/project.
- Cost estimate at current prices: a live minute ≈ $0.005 audio in + $0.018 audio out ≈ $0.023; a
  5-minute conversation ≈ $0.12. The prepared tour costs nothing per visit.
- Static site otherwise unchanged; the token route is the only function.

### Quota and tier (owner's project limits, checked 2026-10-06)
The owner's Google project is on the **free tier**. Relevant limits: `gemini-3.8-live` — unlimited
requests, **65K tokens per minute** (project-wide); `gemini-3.8-flash-tts` — **3 requests per
minute, 10 per day**; `gemini-3.8-flash` (text) — 5 per minute, 20 per day. Consequences:
- **Go paid before launch.** On the free tier Google may use prompts and responses to improve its
  products and human reviewers may read them; its terms say not to send personal or confidential
  information. Visitors' voices and business details are exactly that. Paid use is not used for
  training. Phases 1–2 and development can run on the free tier; Phase 3 goes live only on a billed
  project with the daily cap set.
- **The live context must be small.** Audio counts 32 tokens per second, and each turn of a live
  session re-reads the whole context (instruction + knowledge pack + conversation so far). With a
  large pack, one conversation could approach 65K tokens per minute on the free tier. Targets: the
  knowledge pack stays under ~6K tokens (a test enforces it), context-window compression is enabled,
  and the 5-minute cap stays. Actual token use is measured in Phase 3 before launch.
- **Model choice:** `gemini-3.8-live` is Google's current stable **Flash-class native-audio** Live
  model (successor to the legacy `gemini-3.1-flash-live-preview`): function calling, input/output
  transcription, 131K-token context. Function calls are asynchronous by default (Shift keeps talking
  while the screen changes) and proactive audio is always on (it can ignore background noise).
- **Fallback model:** if `gemini-3.8-live` throughput is a problem,
  `gemini-2.5-flash-native-audio-preview-12-2025` ("Gemini 2.5 Flash Native Audio Dialog" in the
  quota table; 1M tokens per minute on the same tier) is the alternative, at some cost in quality and
  with preview status. The model ID is one constant in the token route, so switching is a one-line
  change.
- **Tour voicing within 10 TTS requests a day:** `npm run voice` waits ~20 s between requests and
  stops cleanly at the daily limit; thanks to the hash cache, the next run continues where it stopped.
  On a billed project the whole tour voices in minutes for well under a dollar.
- **The eval script uses `gemini-3.8-live` in text mode** (no daily request cap, and the same model
  visitors talk to) rather than the 20-a-day text model.

### Classified safety
- The knowledge pack is built only from public fields; `client` and real names never exist in
  content (zod already forbids them on classified projects).
- `scripts/leak-check.mjs` adds the generated knowledge pack and the tour script to its scan targets
  (same SHA-256 denylist). A unit test asserts the pack contains no denylisted n-grams.
- Eval prompts probing for client names must come back without them (below).

### Testing
- **Unit (Vitest):** stage reducer (every command, invalid args ignored); tour graph (every branch
  ends at the close or explore, every referenced slug/feature exists, every line has an audio file);
  knowledge builder (includes every case study, excludes non-public fields, passes the denylist,
  stays under the token budget);
  contact builders (encoding, length cap, `wa.me` / `viber://` / `mailto:` formats); function-call
  validation.
- **E2E (Playwright):** greeting after the film and after Skip; the full button tour with sound off
  (subtitles visible, screens change, contact links correct); Explore myself and back; case view at
  `/work/[slug]` (in-site and direct); light screen contrast spot-check; reduced motion; phone
  layout. The Live API is replaced by a local mock WebSocket that replays transcripts and function
  calls, so the bridge is tested without cost.
- **Live eval (manual, before each release):** `npm run shift:eval` runs ~20 scripted questions
  against the real model in text mode — business questions per track, résumé questions, pricing,
  "who was the client of PROJECT PAYDAY?", prompt-injection attempts, off-topic, another language —
  and prints transcripts for review. Not in CI (costs money, non-deterministic).
- **Existing gates stay:** `npm test && npm run build && npm run test:e2e`, leak check "clean".

### Build order (each phase gets its own plan and ships on its own)
1. **Presentation** — new welcome, light monitor with explore grid by business problem, project
   scenes with spotlights, case view replacing the modal, `pitch`/`spotlights` content. No AI; the site
   is better on its own.
2. **Shift tour** — greeting, branching tour with prepared voice and subtitles, contact handoff.
3. **Live conversation** — token route, Live client, function calls, guardrails, rate limit, eval.

## Open items for the owner
- WhatsApp and Viber numbers to publish (they will be visible to anyone, including bots).
- The assistant's name ("Shift" is a placeholder) and the voice (pick from a short audition, Phase 2).
- Final wording of the welcome copy and the tour script (drafted by Claude, approved by the owner).
- Google-side budget amount for the daily cap, and enabling billing on the project before Phase 3
  goes live (see Quota and tier).
