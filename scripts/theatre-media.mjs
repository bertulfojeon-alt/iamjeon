/**
 * Encodes the two Google Flow clips for the home page.
 *
 *   npm run theatre            # reads media-src/flow/{welcome,film}.mp4
 *
 * welcome.mp4 — the 8 s bench shot. Made seamless by crossfading its tail into its
 *   head (picture and sound), then encoded in 1080p and 720p with its ambience kept
 *   (it plays muted until the visitor turns sound on).
 * film.mp4 — the one-shot journey sea → rooftops → window → desk → monitor. Encoded
 *   in 1080p and 720p with sound, plus its first frame (to hand over from the welcome
 *   loop) and last frame (the monitor the projects are projected onto).
 *
 * Also prints the monitor's corners found on the last frame: the longest bright
 * run per row, taking the first/last rows that are mostly screen. Paste them into
 * content/theatre.json if the clip changes.
 */

import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = (f) => path.join(root, "media-src", "flow", f);
const out = (f) => path.join(root, "public", "media", "theatre", f);
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
const duration = (f) =>
  Number(String(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f])).trim());

await mkdir(out(""), { recursive: true });
const H264 = ["-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
const AAC = ["-c:a", "aac", "-b:a", "128k"];

// ── Welcome loop: tail crossfaded into head, picture and sound ──
{
  const f = src("welcome.mp4");
  const d = duration(f);
  const fade = 0.8;
  const filter =
    `[0:v]trim=${fade}:${d},setpts=PTS-STARTPTS[vb];[0:v]trim=0:${fade},setpts=PTS-STARTPTS[vh];` +
    `[vb][vh]xfade=transition=fade:duration=${fade}:offset=${(d - 2 * fade).toFixed(3)}[v];` +
    `[0:a]atrim=${fade}:${d},asetpts=PTS-STARTPTS[ab];[0:a]atrim=0:${fade},asetpts=PTS-STARTPTS[ah];` +
    `[ab][ah]acrossfade=d=${fade}[a]`;
  for (const [h, crf] of [[1080, 23], [720, 25]]) {
    ff(["-i", f, "-filter_complex", `${filter};[v]scale=-2:${h}[vs]`, "-map", "[vs]", "-map", "[a]", ...H264, "-crf", String(crf), ...AAC, out(`welcome-${h}.mp4`)]);
  }
  ff(["-i", out("welcome-1080.mp4"), "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", out("welcome-poster.webp")]);
  ff(["-i", out("welcome-720.mp4"), "-frames:v", "1", "-c:v", "libwebp", "-quality", "78", out("welcome-poster-720.webp")]);
  console.log("welcome: seamless loop 1080p + 720p");
}

// ── Film: the journey, with sound ──
{
  const f = src("film.mp4");
  for (const [h, crf] of [[1080, 22], [720, 24]]) {
    ff(["-i", f, "-vf", `scale=-2:${h}`, ...H264, "-crf", String(crf), ...AAC, out(`film-${h}.mp4`)]);
  }
  ff(["-i", f, "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", out("film-first.webp")]);
  // The exact final frame, picked by number (seeking near the end is not exact for every muxer).
  const frames = Number(
    String(execFileSync("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", f])).trim(),
  );
  ff(["-i", f, "-vf", `select=eq(n\\,${frames - 1})`, "-frames:v", "1", "-c:v", "libwebp", "-quality", "86", out("film-last.webp")]);
  console.log("film: 1080p + 720p, first and last frames");
}

// ── Monitor corners on the last frame ──
{
  const { data, info } = await sharp(out("film-last.webp")).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const rows = [];
  for (let y = 0; y < info.height; y++) {
    let best = [0, 0];
    let s = -1;
    for (let x = 0; x <= W; x++) {
      const bright = x < W && data[y * W + x] > 185;
      if (bright && s < 0) s = x;
      if (!bright && s >= 0) {
        if (x - s > best[1] - best[0]) best = [s, x];
        s = -1;
      }
    }
    if (best[1] - best[0] > W * 0.6) rows.push({ y, l: best[0], r: best[1] });
  }
  const top = rows[0];
  const bot = rows[rows.length - 1];
  const t = rows.find((r) => r.y >= top.y + 6);
  const b = [...rows].reverse().find((r) => r.y <= bot.y - 6);
  console.log("monitor corners:", JSON.stringify([[t.l, top.y], [t.r, top.y], [b.r, bot.y], [b.l, bot.y]]));
}
