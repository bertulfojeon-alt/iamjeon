# Night Shift — iamjeon

Portfolio of **Loreto "Jeon" Saquilabon Jr.**, a full-stack developer and automation engineer in Lapu-Lapu City, Cebu. Live at [iamjeon.vercel.app](https://iamjeon.vercel.app).

The site plays like one shot from a film:

1. **Welcome.** A loop of Jeon on a seawall bench at night, typing, with the sea and the keys on the soundtrack.
2. **The film.** On the first scroll the copy leaves and a 7-second shot plays: sea, rooftops, a lit window, Jeon sitting down at his desk, then a push-in to the right-hand monitor.
3. **The desk.** The monitor becomes a light project dashboard. All work shows every project as a card, browsable by business problem, service or skill, with search.
4. **Projects.** A card opens the project in the monitor: its landing page or product video, screenshots, features, verified numbers and the stack. Every project also has its own page at `/work/[slug]`.

Client work under NDA appears as classified projects (PROJECT PAYDAY, PROJECT FACEGATE, PROJECT BALANCE SHEET). They have no product names, domains or logos, and their screens are masked. Some products are shown with coded demos instead of screenshots: these run in the browser and show what the product does.

## Stack

Next.js 16 (App Router) · React 19 (`<ViewTransition>`) · TypeScript · Tailwind v4 · Lenis · zod.

The pages use no WebGL. The film is a plain `<video>`, and the desktop is DOM projected onto the monitor in the film's last frame with a homography (`lib/homography.ts`).

The site has three viewing modes: full, lite and still. An inline script picks one before first paint. Reduced-motion, data-saver and "Pause motion" visitors get still frames, and everything stays readable.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest: content rules, homography, modes
npm run build        # production build + leak check
npm run test:e2e     # Playwright (Edge + WebKit iPhone/MacBook); build first
npm run theatre      # re-encode the welcome loop and film from media-src/flow/
```

## Content

- One file per project in `content/projects/`. Ordering and chapters live in `content/index.ts`.
- The zod schema (`content/schema.ts`) requires a `source` for every metric and enforces the classified rules.
- `npm run build` runs `scripts/leak-check.mjs`, which scans the built output against a denylist of SHA-256 hashes. The repo holds only the hashes, never the real words.

Status, what is built and what comes next: [docs/STATUS.md](docs/STATUS.md).

## Contact

bertulfojeon@gmail.com · [Résumé](https://iamjeon.vercel.app/IamjeonResume.pdf)

The previous static site is preserved at tag `v1-static`.
