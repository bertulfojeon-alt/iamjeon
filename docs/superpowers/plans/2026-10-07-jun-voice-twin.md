# Jun, Jeon's AI twin: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A voice-only Gemini Live guide ("Jun") that knows the portfolio, presents it full screen on
request, and lives in a waving mini-Jeon badge at the desk and on `/work/<slug>`.

**Architecture:** One Node route mints a single-use Gemini Live token that locks the model, voice,
instruction and tools. The browser holds the WebSocket. Every tool is answered in the browser: look-ups
from the same `ScreenItem` data the dashboard renders, and UI commands through the stage reducer (the
dashboard) or a new pure presentation reducer (the full-screen stage). The badge plays a stacked-alpha
H.264 clip joined on a 2D canvas.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, zod, `@google/genai` (browser, lazy-loaded),
Web Audio + AudioWorklet, Vitest, Playwright (`routeWebSocket` for the mock Live session), ffmpeg.

**Spec:** `docs/specs/2026-10-07-jun-voice-twin-design.md`

## Global Constraints

- Public repo: no classified client, product, domain or company name anywhere; the instruction is
  checked with the leak check's own `findHits` against the global and classified-only denylists.
- `GEMINI_API_KEY` server-only (never `NEXT_PUBLIC_`), read from `.env.local` locally; Claude never opens
  or prints `.env*`.
- Models: `JUN_LIVE_MODEL` default `gemini-3.8-live`; `JUN_FALLBACK_MODEL` default
  `gemini-2.5-flash-native-audio-preview-12-2025`; `JUN_VOICE` default `Charon` until the owner picks.
- Token: `uses: 1`, `newSessionExpireTime` +1 min, `expireTime` +6 min, no `fieldMask`.
- Call cap 5:00, wrap-up nudge at 4:30. One call per page.
- Badge: wave every 60 s, clip 5 s, rise 0.6 s; desktop scale 0.75 resting, 1 waving; phones one size;
  pill 20 px text (144 × 38) at ≥390 px wide, about 1.8× (128 × 34) at 360–389; ring right end 10 px from
  the edge on phones; ring ≥12 px from the ↑ button; no sideways scroll; no wave in still mode, with the
  tab hidden or during a call.
- Instruction ≤ 6,000 tokens (estimated as characters ÷ 4).
- Copy: plain, no em dashes in visitor-facing text, no exaggeration. Jun is "Jeon's AI twin" and says it
  is an AI.
- Metrics are shown as value and label only (sources are never rendered).
- Site look rules hold (Big Shoulders / Hanken Grotesk, light screen tokens on the stage, still mode
  fully readable). The badge's blue ring is the approved exception.
- Gates: `npm test && npm run build && npm run test:e2e`, leak check "clean".

## Review Focus

1. **Microphone refused or missing** (iOS denies, no device, insecure context): the card explains and
   offers contact. The tests stub `getUserMedia` to reject with `NotAllowedError` and `NotFoundError`
   (Task 9).
2. **Quota or busy upstream:** token mint 429, socket closed with `RESOURCE_EXHAUSTED`, or a second
   failure. Expected: one fallback attempt, then "line is busy" with contact. Pinned by `isQuotaError`
   unit cases (Task 6) and an e2e that closes the mock socket with a quota reason (Task 9).
3. **The model calls a tool with bad arguments** (unknown slug, a `feature` the project lacks, `numbers`
   on a project with no metrics, a `show_slide` before `start_presentation`). Expected: an error goes
   back to the model and the screen does not change. Pinned in `tools.test.ts` (Task 5).
4. **Badge on narrow phones (≤375 px) and in still mode:** the geometry and the no-wave rule, pinned in
   `jun.spec.ts` (Task 9) at 375 and 360 px and with `reducedMotion: "reduce"`.
5. **Leaving mid-call** (End, navigating to another project, closing the stage, tab hidden): the mic
   track is stopped and the socket closed. Pinned by an e2e that ends the call and asserts the stubbed
   mic track's `readyState` is `"ended"` (Task 9).

---

### Task 1: The badge clip

**Files:**
- Create: `scripts/jun-media.mjs`
- Modify: `package.json` (script `"jun-media": "node scripts/jun-media.mjs"`)
- Output (committed): `public/media/jun/wave.mp4`, `public/media/jun/rest.webp`

**Interfaces:** Produces `/media/jun/wave.mp4` (stacked: colour 320×H on top, mask below, H even),
`/media/jun/rest.webp` (transparent rest pose, the same 320 px width). It prints the frame size.

- [ ] Write `scripts/jun-media.mjs`. It spawns ffmpeg on `media-src/jun/wave-source.mp4`:
  - cut `-ss 3 -t 5`;
  - crop `600:560:300:20`;
  - key with `chromakey=0x0CFA05:0.12:0.05`, then `despill=type=green:mix=0.35`;
  - scale to 320 px wide (lanczos), as `yuva444p`;
  - split: premultiply the colour stream; `alphaextract` the mask; `vstack` the two;
  - encode with libx264, crf 24, `+faststart`.

  It also writes the rest frame at 4.9 s as WebP with alpha, and exits non-zero if the source is missing.
- [ ] Run `npm run jun-media`; check the output is ≤ 200 KB and the frame height is even (ffprobe).
- [ ] Render frames 0, 30, 50 and 119 composited over navy into the scratchpad. Check the hand tint and
  tune the despill `mix` (try 0.2 to 0.5) until the blurred hand no longer reads olive. Show the owner the
  strip before committing.
- [ ] Commit: `Jun: badge clip (stacked alpha) and rest frame`.

### Task 2: Shared screen items, contact links, stage summary

**Files:**
- Create: `content/screen-items.ts` (move `toItem` out of `app/page.tsx`; export `screenItems()`,
  returning `ScreenItem[]` in `GROUP_ORDER`)
- Modify: `app/page.tsx` (use `screenItems()`)
- Create: `lib/contact.ts`, `lib/contact.test.ts`
- Modify: `components/screen/ContactView.tsx` (constants from `lib/contact`; optional `summary` prop: a
  "Your note to Jeon" block, the links pre-filled; Viber copies the summary, then opens)
- Modify: `features/stage/stage.ts`, `features/stage/stage.test.ts` (`panel` command and view carry an
  optional `summary`, kept only for `contact`)
- Modify: `components/screen/Screen.tsx`:
  - `ns:open` accepts `Panel | { panel, summary }`;
  - a new `ns:show` event (detail: slug) calls `open(slug)`;
  - pass `view.summary` to `ContactView`.

**Interfaces:** Produces:
- `EMAIL`, `WHATSAPP`, `VIBER`;
- `clampSummary(s: string): string` (trims, collapses whitespace, at most 500 characters, cut at a word
  boundary with "…");
- `mailtoHref(summary?)`, `whatsappHref(summary?)`, `viberHref()`;
- `StageCommand` `{ type: "panel"; panel: Panel; summary?: string }`, and the view
  `{ kind: "panel"; panel; back; summary?: string }`;
- `screenItems(): ScreenItem[]`.

- [ ] Tests first (`lib/contact.test.ts`):
  - `mailtoHref("Hi & hello")` gives `mailto:bertulfojeon@gmail.com?subject=Project%20enquiry&body=Hi%20%26%20hello`;
  - `whatsappHref("a b")` gives `https://wa.me/639684333479?text=a%20b`;
  - with no summary, there is no `text` or `body` parameter;
  - `viberHref()` gives `viber://chat?number=%2B63474660563`;
  - `clampSummary` of 800 characters is ≤ 500, ends with "…" and does not cut inside a word;
  - an empty or whitespace summary gives `""`.
- [ ] Stage tests:
  - `panel` contact with a summary keeps it;
  - `panel` about drops a summary;
  - `back` then `panel` contact with no summary has `summary` undefined.
- [ ] Run `npx vitest run lib/contact.test.ts features/stage` and see them fail; implement; see them pass.
- [ ] `npm test` all green (the existing content and stage tests unchanged). Commit.

### Task 3: What Jun knows (index, detail, instruction)

**Files:**
- Create: `content/resume.md` (a verbatim copy of `F:\ME\Resume\resume.md`, owner decision "as is")
- Create: `scripts/leak-hits.mjs` (exports `sha256`, `findHits`, `loadDenylist()`, returning
  `{ global, classifiedOnly }` as `Set`s)
- Modify: `scripts/leak-check.mjs` to import them (behaviour unchanged)
- Create: `features/jun/knowledge.ts` (client-safe, pure):
  - `indexLine(item: ScreenItem): string`;
  - `projectDetail(item: ScreenItem): ProjectDetail`, with a `slides: SlideKind[]` field;
  - `SLIDE_KINDS`.
- Create: `lib/jun/instruction.ts` (server): `buildInstruction(): string`, from `screenItems()`,
  `SERVICES`, the About copy, contact and `content/resume.md` (read with `fs` at module load).
- Move the About copy (`PATH`, `KIT`, lead paragraphs) into `content/about.ts`, so `BehindTheDesk` and the
  instruction share one source.
- Test: `features/jun/knowledge.test.ts`, `lib/jun/instruction.test.ts`.

**Interfaces:**
- `type SlideKind = "hero" | "feature" | "numbers" | "screens" | "stack" | "about" | "contact"`.
- `ProjectDetail = { slug, title, group, classified, industry, year, status, role, problem, outcome,
  features: string[], spotlights: {feature,label}[], metrics: {value,label}[], stack: string[],
  story: {heading, body}[], links: {label, href}[], slides: SlideKind[] }`.
- `slides` always includes `hero` and `stack`. It includes `feature` only with spotlights, `numbers` only
  with metrics, and `screens` only with two or more shots.

- [ ] Tests first:
  - `indexLine` has the slug, title and group;
  - `projectDetail` for a project with no metrics excludes `numbers`;
  - the instruction contains every slug from `screenItems()`, contains "AI twin", contains
    "resume"/"Résumé" content (a line from `content/resume.md`), and has no `source:` strings;
  - `findHits(instruction, global)` and `findHits(instruction, classifiedOnly)` are both `[]`;
  - `instruction.length / 4 <= 6000`;
  - planting a fake hash makes `findHits` return a hit (proves the check can fail).
- [ ] Run them and see them fail; implement; see them pass. `node scripts/leak-check.mjs` still runs
  (after a build, in Task 10).
- [ ] Commit.

### Task 4: Live config and token route

**Files:**
- Create: `lib/jun/liveConfig.ts`:
  - `LIVE_MODEL`, `FALLBACK_MODEL`, `VOICE` (from env, with the defaults above);
  - `junTools()` (function declarations for the 7 tools in the spec table, `type: "OBJECT"`, `enum` for
    `kind` and `channel`);
  - `buildLiveConfig(instruction)` (SDK shape: `responseModalities: ["AUDIO"]`, `systemInstruction`,
    `inputAudioTranscription: {}`, `outputAudioTranscription: {}`, `tools`, `speechConfig`,
    `contextWindowCompression: { slidingWindow: {} }`);
  - `toBidiSetup(model, instruction)` (wire shape: `generationConfig.{responseModalities, speechConfig}`,
    `systemInstruction` as `{ parts: [{ text }] }`, the same tools, transcriptions and compression).
- Create: `app/api/jun/token/route.ts`:
  - `export const runtime = "nodejs"`, `export const dynamic = "force-dynamic"`;
  - a `POST` handler.
- Test: `lib/jun/liveConfig.test.ts`, `app/api/jun/token/route.test.ts`.

**Interfaces:** POST body `{ model: "primary" | "fallback" }`. The responses:
- `200 { token, model, config }`;
- `400` for a bad model;
- `403` for a bad origin;
- `503 { error: "off" }` when `JUN_KILL=1`;
- `500 { error: "unconfigured" }` with no key;
- `429 { error: "busy" }` for an upstream 429;
- `502 { error: "unavailable" }` otherwise.

Allowed origins: `https://iamjeon.vercel.app`, `https://iamjeon-*-bertulfojeon-alts-projects.vercel.app`,
`https://iamjeon-git-*-bertulfojeon-alts-projects.vercel.app`, and `http://localhost:*` (not in
production).

- [ ] Tests first:
  - both shapes have the same tool names, the same voice and the same instruction text; the wire shape
    has no `fieldMask`; the model is `models/<id>`;
  - the route, with `fetch` stubbed via `vi.stubGlobal`:
    - each error status above;
    - the upstream request goes to `https://generativelanguage.googleapis.com/v1alpha/auth_tokens` with an
      `x-goog-api-key` header and `uses: 1`;
    - `expireTime` − `newSessionExpireTime` is about 5 min;
    - the response never contains the upstream body text.
- [ ] Run them and see them fail; implement; see them pass. Commit.

### Task 5: Slides, presentation reducer, tool bridge

**Files:**
- Create: `features/jun/presentation.ts` + test:
  - `PresentationState = { open: false } | { open: true; slides: Slide[]; current: number }`;
  - `Slide = { key: number; slug: string | null; kind: SlideKind; feature?: string }`;
  - `presentationReducer(state, cmd)`, where `cmd` is `{type:"start"} | {type:"show"; slide: Omit<Slide,"key">} | {type:"end"}`.
- Create: `features/jun/tools.ts` + test:
  - `runTool(name, args, ctx): { response: Record<string, unknown>; effect?: JunEffect }`;
  - `ctx = { items: ScreenItem[]; presenting: boolean; onDesk: boolean }`;
  - `JunEffect = { type: "present"; cmd } | { type: "show-project"; slug } | { type: "contact"; channel?; summary }`.

**Rules:**
- `list_projects` and `get_project` answer from items.
- `show_slide` needs `presenting` (otherwise the error is "call start_presentation first"), a known slug
  (except `about` and `contact`, which take no slug), a kind in that project's `slides`, and a `feature`
  that is one of its spotlight features when the kind is `feature`.
- `open_project` needs a known slug.
- `open_contact` clamps the summary with `clampSummary`; while presenting it becomes a `contact` slide.
- An unknown tool returns an error.
- Every error is `{ error: string }` with no effect.

- [ ] Tests first: each tool's valid path, plus all of Review Focus 3. Run them and see them fail;
  implement; see them pass. Commit.

### Task 6: Live session client

**Files:**
- Create: `features/jun/live/audio.ts` + test (`bufferToBase64`, `base64ToBytes`, `pcm16ToFloat32`,
  `INPUT_SAMPLE_RATE` 16000, `OUTPUT_SAMPLE_RATE` 24000)
- Create: `public/jun-recorder-worklet.js` (mono, 16-bit, batches of 1024 samples)
- Create: `features/jun/live/session.ts`:
  - `class JunSession { start(); setMuted(b); stop(); }`;
  - callbacks: `onStatus`, `onSubtitle`, `onTool(name, args) → response`, `onError(kind)`;
  - `isQuotaError(x)`, exported and unit-tested.
- Modify: `package.json` (`@google/genai`, dynamically imported in `session.ts` only)

**Behaviour:**
- The mic is opened first, with echo cancellation, noise suppression and AGC. Errors map to
  `denied | missing | insecure`.
- Then the token: `POST /api/jun/token {model:"primary"}`. A 429, or a connect or close error matching
  `isQuotaError`, triggers one retry with `"fallback"`.
- `live.connect` uses the returned `model` and `config`.
- On open, send `(session started)`.
- Barge-in stops playback.
- Tool calls go through `onTool`, then `sendToolResponse`.
- At 4:30, send the text `(about thirty seconds left: wrap up and offer to pass a note to Jeon)`; at 5:00,
  `stop()` and `onStatus("capped")`.
- `stop()` ends the mic tracks, closes the socket and the contexts, and is idempotent.

- [ ] Tests first:
  - audio round-trips;
  - `isQuotaError` is true for a 429 status, the text `RESOURCE_EXHAUSTED`, a close reason containing
    "quota", and code 1011 with a quota reason;
  - it is false for 1000/normal and a generic network error.
- [ ] Run them and see them fail; implement; see them pass. The rest is covered by the e2e mock (Task 9).
  Commit.

### Task 7: Badge, call card, stacked-alpha join

**Files:**
- Create: `components/jun/stackedAlpha.ts` + test: `joinStacked(top: Uint8ClampedArray, mask: Uint8ClampedArray): void`
  writes the alpha from the mask's red channel and un-premultiplies RGB in place (pure). Plus
  `attachStackedVideo(video, canvas): () => void` for the per-frame loop (`requestVideoFrameCallback`,
  falling back to rAF).
- Create: `components/jun/JunBadge.tsx`, `components/jun/JunBadge.module.css`: the prototype's geometry
  ported to the module.
  - Props: `{ still: boolean; calling: boolean; level: "idle" | "listening" | "speaking"; onTap(): void }`.
  - The 60 s wave timer pauses while `document.hidden`, `still` or `calling`.
  - `data-up` drives the CSS.
- Create: `components/jun/CallCard.tsx` + CSS.
  - Views: `intro` (Start / Not now, plus the disclosure line), `connecting`, `live` (state, subtitle,
    Mute, End), `error` (the message plus contact), `contact` (summary plus the three links), `ended`.
- Create: `features/jun/Jun.tsx` (the orchestrator, client):
  - holds `JunSession`, the call state, `presentationReducer` and subtitles;
  - `onTool` calls `runTool` and applies the effect:
    - `present` goes to the reducer;
    - `show-project` dispatches `ns:show` on the desk, or `router.push('/work/<slug>')` on a work page;
    - `contact` dispatches `ns:open {panel:"contact", summary}` on the desk, or the card's `contact` view
      on a work page.
  - Ends the call on unmount and on `pagehide`.
  - Props: `{ items: ScreenItem[]; where: "desk" | "page" }`.
- Modify: `components/theatre/Theatre.tsx` to render `<Jun items={props.items} where="desk" />` only
  when `phase === "desk"`. Modify `Theatre.module.css` so `.desktopWrap[data-fit="panel"] ~ .top` stays
  centred (bottom centre; keep the 42 px size).
- Modify: `app/work/[slug]/page.tsx` to render `<Jun items={screenItems()} where="page" />`.

- [ ] Tests first (`stackedAlpha.test.ts`):
  - a 2-pixel colour/mask pair: mask 255 keeps the colour with alpha 255;
  - mask 0 gives alpha 0;
  - mask 128 on a premultiplied grey 64 un-premultiplies to about 127.
- [ ] Run it and see it fail; implement; see it pass.
- [ ] Implement the components. `npm run typecheck` is clean. Commit.

### Task 8: Presentation stage

**Files:**
- Create: `components/jun/Presentation.tsx`, `components/jun/Presentation.module.css`. It is
  full-viewport, `screen-light`, `role="dialog"`, `aria-label="Jun's presentation"`, with a footer for
  the subtitle, Mute, End call and Close. It renders the current slide by kind from `ScreenItem`:
  - `hero`: the landing loop, else the loop, else the poster (posters in still mode), title, problem,
    outcome;
  - `feature`: the poster plus `Spotlights` with that one active, and the label;
  - `numbers`: the metrics (value and label);
  - `screens`: a grid of up to 6 shots;
  - `stack`: chips;
  - `about`: photo, lead and services titles;
  - `contact`: the summary plus the three links.

  Classified items render with the same masked posters the dashboard uses. A progress rail has one dot
  per slide. The slide enters with a 300 ms fade and rise, disabled in still mode.

- [ ] No unit test (presentational). It is covered by Task 9's mock session. `npm run typecheck` clean.
  Commit.

### Task 9: End-to-end tests

**Files:**
- Create: `e2e/jun.spec.ts`. It reuses a `toDesk` helper, copied from `night.spec.ts` (the file keeps its
  helpers local).
- Create: `e2e/jun-mock.ts`:
  - `stubMic(page, mode: "ok" | "denied" | "missing")` (`addInitScript` replacing
    `navigator.mediaDevices.getUserMedia` with a silent `MediaStreamAudioDestinationNode` stream, and
    recording the tracks on `window.__junTracks`);
  - `mockLive(page, script)`:
    - routes `POST /api/jun/token` to `{ token: "t", model: "m", config: {...} }`;
    - uses `page.routeWebSocket(/BidiGenerateContent/)` to reply `{setupComplete:{}}`, then play
      scripted server messages (`serverContent.outputTranscription`, `toolCall.functionCalls`);
    - collects `toolResponse` messages for assertions.

**Cases (desktop project unless noted):**
- No badge on the welcome or during the film; a badge at the desk; a badge on `/work/tradesbymerc`.
- Geometry at 1280, 430, 390, 375 and 360 px, resting and waving (waving is forced via
  `page.clock.runFor(60_000)`):
  - the pill inside the ring, measured on the front ring `path`;
  - the ring within the viewport;
  - a gap of at least 12 px to the ↑ button;
  - `scrollWidth === innerWidth`.
- A wave on the clock: `data-up` becomes `true` after 60 s. With `reducedMotion: "reduce"` it never
  does.
- Tap, then Not now closes the card. Tap, then Start with a denied or missing mic shows the explanation
  plus contact.
- The mock session:
  - the subtitle shows the transcription;
  - `start_presentation` opens the dialog;
  - `show_slide` for a hero shows that project's title;
  - `show_slide` for a feature shows the spotlight label;
  - `show_slide` with numbers shows a metric value;
  - `show_slide` with a bad slug: the dialog is unchanged and the tool response holds an error;
  - `end_presentation` closes the dialog;
  - `open_project` gives the URL `/work/<slug>`;
  - `open_contact` shows the summary and a WhatsApp link with `text=`.
- End: the stubbed mic track `readyState` is `"ended"`.
- Quota: the mock socket closes with code 1011 and reason "RESOURCE_EXHAUSTED". Expect a second token
  request with `model: "fallback"`; if that also closes, the busy message plus contact.

- [ ] Write the spec. Run `npm run build && npx playwright test e2e/jun.spec.ts --project=desktop --project=phone`.
  Fix until green. Then run the whole suite. Commit.

### Task 10: Audition and eval scripts, docs, gates, preview

**Files:**
- Create: `scripts/jun-audition.mjs`:
  - run as `node --env-file=.env.local`;
  - the TTS REST `models/${JUN_TTS_MODEL ?? "gemini-3.8-flash-tts"}:generateContent` with
    `responseModalities:["AUDIO"]` and `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName`;
  - writes one WAV per voice (Charon, Iapetus, Algieba, Orus, Schedar) to `media-src/jun/audition/`;
  - waits 21 s between requests; on 429 it stops cleanly, and skips voices already written.
- Create: `scripts/jun-eval.mjs`: against a running local server, it gets a token from
  `/api/jun/token`, connects with `@google/genai` in Node, sends the ~20 questions as text turns, and
  prints Jun's output transcriptions.
- Modify: `package.json` (`"jun:audition"`, `"jun:eval"`)
- Modify: `docs/STATUS.md` (what was built and what is waiting on the owner), `CLAUDE.md` (commands)

- [ ] `npm test && npm run build && npm run test:e2e`, all green; the leak check "clean".
- [ ] If `.env.local` has the key: run the audition and the eval, and report. If not, report that both
  are blocked on the key.
- [ ] The Vercel WAF rate limit (5 per 10 min per IP on `/api/jun/token`) and `GEMINI_API_KEY` in Vercel env
  are owner-side settings: list both in the report with exact values; do not change Vercel settings without
  his confirmation.
- [ ] Commit, then push `night-shift` (preview deploy). `main` is untouched. Check the preview deploy
  status with `gh api`.
