/**
 * Procedural stand-in footage for the Night Shift journey, used until the real
 * Google Flow clips are converted with `npm run frames`.
 *
 * Each scene follows the same camera path as its real clip, and consecutive
 * scenes share their boundary frame (C1 end === C2 start, C3 end === room plate),
 * so scroll continuity can be built and tested now.
 *
 * Output: public/media/night/<scene>/{desktop,mobile}/f_####.webp + posters,
 *         public/media/night/room-plate.webp, public/media/screens/<slug>.webp
 */

import sharp from "sharp";
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = (...p) => path.join(root, "public", "media", ...p);
const FRAMES = 72;
const room = JSON.parse(await readFile(path.join(root, "content", "room.json"), "utf8"));

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
// Deterministic pseudo-random so every run produces identical frames.
const rand = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const W = 1920;
const H = 1080;

function sky(top, bottom) {
  return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>`;
}

function cityLights(horizonY, scale, warm) {
  let s = "";
  for (let i = 0; i < 160; i++) {
    const x = rand(i) * W;
    const y = horizonY - rand(i + 500) * 26 * scale;
    const r = (0.8 + rand(i + 900) * 1.8) * scale;
    const c = rand(i + 77) > 0.35 ? warm : "#dfe8f2";
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${c}" opacity="${(0.45 + rand(i + 3) * 0.5).toFixed(2)}"/>`;
  }
  return s;
}

function rooftops(baseY, zoom, litOpacity) {
  // Silhouetted roofs; one window (centre) lit sodium amber.
  let s = `<g transform="translate(${W / 2} ${baseY}) scale(${zoom}) translate(${-W / 2} 0)">`;
  for (let i = 0; i < 18; i++) {
    const x = i * 120 - 80 + rand(i) * 40;
    const h = 120 + rand(i + 40) * 160;
    s += `<polygon points="${x},0 ${x + 60},${-h * 0.35} ${x + 140},0 ${x + 140},${H} ${x},${H}" fill="#070a10" stroke="#121a26" stroke-width="2"/>`;
  }
  s += `<rect x="${W / 2 - 34}" y="-64" width="68" height="52" fill="#ff9a3c" opacity="${litOpacity}"/>`;
  s += `<rect x="${W / 2 - 34}" y="-64" width="68" height="52" fill="none" stroke="#2a1c10" stroke-width="5"/>`;
  s += `</g>`;
  return s;
}

function roomSvg(zoom = 1, fade = 1) {
  const monitors = room.monitors
    .map(
      (q) =>
        `<polygon points="${q.map((p) => p.join(",")).join(" ")}" fill="#020305" stroke="#1d2533" stroke-width="6"/>`,
    )
    .join("");
  return `<g opacity="${fade}" transform="translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-W / 2} ${-H / 2})">
    <rect width="${W}" height="${H}" fill="#0b1018"/>
    <rect x="40" y="120" width="300" height="560" fill="#141a24" stroke="#1f2a3a" stroke-width="8"/>
    <rect x="48" y="128" width="284" height="544" fill="#ff9a3c" opacity="0.10"/>
    ${Array.from({ length: 26 }, (_, i) => `<line x1="${60 + rand(i) * 260}" y1="${140 + rand(i + 9) * 300}" x2="${62 + rand(i) * 260}" y2="${200 + rand(i + 9) * 420}" stroke="#8693a6" stroke-width="1.5" opacity="0.35"/>`).join("")}
    <rect x="0" y="780" width="${W}" height="${H - 780}" fill="#120d0a"/>
    <rect x="0" y="770" width="${W}" height="14" fill="#2a1d14"/>
    ${monitors}
    <rect x="860" y="742" width="200" height="30" rx="4" fill="#05070b"/>
    <ellipse cx="${W / 2}" cy="480" rx="760" ry="330" fill="#dfe8f2" opacity="0.025"/>
  </g>`;
}

const scenes = {
  // Sea at midnight → over the rooftops toward the lit window.
  c1: (t) => {
    const e = ease(t);
    const horizon = lerp(0.56, 0.34, e) * H;
    let water = "";
    for (let i = 0; i < 40; i++) {
      const y = horizon + ((rand(i) * (H - horizon) + t * 900 * (0.4 + rand(i + 2))) % (H - horizon));
      water += `<rect x="${(rand(i + 7) * W).toFixed(0)}" y="${y.toFixed(0)}" width="${(30 + rand(i + 4) * 120).toFixed(0)}" height="2" fill="${rand(i + 8) > 0.5 ? "#ff9a3c" : "#dfe8f2"}" opacity="0.35"/>`;
    }
    return `${sky("#05070c", "#0d1522")}
      <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="#04060a"/>
      ${water}${cityLights(horizon, lerp(1, 1.8, e), "#ff9a3c")}
      ${rooftops(lerp(H + 260, H * 0.86, ease(Math.max(0, (t - 0.45) / 0.55))), 1, 0.9)}`;
  },
  // Rooftops → close on the rain-covered lit window.
  c2: (t) => {
    const e = ease(t);
    return `${sky("#05070c", "#0d1522")}
      ${cityLights(0.34 * H, 1.8, "#ff9a3c")}
      ${(() => {
        // Zoom about the lit window (centre y = baseY - 38·zoom) and drift it to frame centre.
        const zoom = lerp(1, 9, e);
        return rooftops(lerp(H * 0.86 - 38, H / 2, e) + 38 * zoom, zoom, lerp(0.9, 1, e));
      })()}`;
  },
  // Through the window into the room; ends exactly on the room plate.
  c3: (t) => {
    const e = ease(t);
    const glow = 1 - ease(Math.min(1, t / 0.5));
    return `<rect width="${W}" height="${H}" fill="#05070c"/>
      ${roomSvg(lerp(1.6, 1, e), ease(Math.min(1, t / 0.45)))}
      <rect width="${W}" height="${H}" fill="#ff9a3c" opacity="${(glow * 0.85).toFixed(3)}"/>`;
  },
  // Dawn: pull back from the window out over the sea at sunrise.
  c4: (t) => {
    const e = ease(t);
    const horizon = lerp(0.34, 0.58, e) * H;
    return `${sky(t < 0.5 ? "#1a1a2e" : "#3a2b3f", "#f4b48a")}
      <circle cx="${W * 0.62}" cy="${horizon - 10}" r="${lerp(40, 70, e)}" fill="#ffd9a8" opacity="0.9"/>
      <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="#1b1720"/>
      ${cityLights(horizon, 1.2, "#ffd9a8")}
      ${rooftops(lerp(H * 1.4, H + 300, e), lerp(5, 1, e), 0.6)}`;
  },
};

async function render(svgBody, file, size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svgBody}</svg>`;
  let img = sharp(Buffer.from(svg));
  if (size === "mobile") {
    // Vertical rendition: centre crop to 9:16, then scale.
    const cropW = Math.round((H * 9) / 16);
    img = sharp(await img.png().toBuffer())
      .extract({ left: Math.round((W - cropW) / 2), top: 0, width: cropW, height: H })
      .resize(720, 1280);
  } else {
    img = img.resize(1600, 900);
  }
  await img.webp({ quality: 62 }).toFile(file);
}

// Optional filter: `node generate-placeholders.mjs c2 screens` renders only those parts.
const only = new Set(process.argv.slice(2));
const want = (part) => only.size === 0 || only.has(part);

for (const [name, draw] of Object.entries(scenes)) {
  if (!want(name)) continue;
  for (const size of ["desktop", "mobile"]) {
    const dir = out("night", name, size);
    await mkdir(dir, { recursive: true });
    for (let i = 0; i < FRAMES; i++) {
      await render(draw(i / (FRAMES - 1)), path.join(dir, `f_${String(i).padStart(4, "0")}.webp`), size);
    }
    await render(draw(0), out("night", name, `poster-${size}.webp`), size);
  }
  // Still-mode frame: the single most telling moment of the shot.
  const stillAt = { c1: 0.28, c2: 0, c3: 1, c4: 1 }[name];
  await render(draw(stillAt), out("night", name, "still.webp"), "desktop");
  console.log(`scene ${name}: ${FRAMES} frames × 2 renditions`);
}

// The room plate is the exact last frame of C3, at full resolution.
if (want("c3")) await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${scenes.c3(1)}</svg>`))
  .webp({ quality: 80 })
  .toFile(out("night", "room-plate.webp"));
if (want("c3")) console.log("room plate written");

// Placeholder monitor screens, one per project file (replaced by real captures).
const projectFiles = (await readdir(path.join(root, "content", "projects")).catch(() => [])).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts",
);
await mkdir(out("screens"), { recursive: true });
for (const f of want("screens") ? projectFiles : []) {
  const slug = f.replace(/\.ts$/, "");
  const label = slug.replace(/-/g, " ").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800">
    <rect width="1280" height="800" fill="#0b1018"/>
    <rect x="0" y="0" width="1280" height="56" fill="#111824"/>
    <rect x="40" y="96" width="360" height="660" rx="10" fill="#111824"/>
    <rect x="430" y="96" width="810" height="300" rx="10" fill="#111824"/>
    <polyline points="460,350 560,300 660,320 760,240 860,270 960,190 1060,220 1200,150" fill="none" stroke="#ff9a3c" stroke-width="4"/>
    <rect x="430" y="420" width="395" height="336" rx="10" fill="#111824"/>
    <rect x="845" y="420" width="395" height="336" rx="10" fill="#111824"/>
    <text x="640" y="600" text-anchor="middle" font-family="Segoe UI, Arial" font-size="40" fill="#8693a6" letter-spacing="6">${label}</text>
    <text x="640" y="650" text-anchor="middle" font-family="Segoe UI, Arial" font-size="20" fill="#4d5a6d" letter-spacing="4">CAPTURE PENDING</text>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 70 }).toFile(out("screens", `${slug}.webp`));
}
console.log(`screens: ${projectFiles.length} placeholders`);
