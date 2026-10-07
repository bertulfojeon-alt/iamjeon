/**
 * Encodes Jun's badge clip: mini Jeon waving, cut out of its green background.
 *
 *   npm run jun-media          # reads media-src/jun/wave-source.mp4 (gitignored)
 *
 * The source is an 8 s, 1280×720 clip on flat green (#0CFA05). 3.0–8.0 s starts and ends
 * in the rest pose, so the badge can hold its first frame between waves.
 *
 * wave.mp4 — a stacked-alpha H.264 file: the picture on top, its transparency mask below.
 *   The badge joins the halves on a 2D canvas (components/jun/stackedAlpha.ts). H.264 plays
 *   everywhere; Safari ignores WebM alpha, and this ffmpeg's x265 cannot encode HEVC alpha.
 *   The picture is premultiplied (edges darken toward black), and the canvas un-premultiplies it.
 * rest.webp — the rest pose with real transparency, for still mode and before the clip loads.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "media-src", "jun", "wave-source.mp4");
const out = (f) => path.join(root, "public", "media", "jun", f);
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });

if (!existsSync(source)) {
  console.error(`jun-media: missing ${path.relative(root, source)} (the owner's green-screen clip).`);
  process.exit(1);
}
mkdirSync(out(""), { recursive: true });

const START = 3;
const LENGTH = 5;
const WIDTH = 320;
// Despill strength. Compared on the motion-blurred hand: 0 turns it pink, 0.2 and up olive; 0.1 reads true.
const DESPILL = process.env.JUN_DESPILL ?? "0.1";
const key = `crop=600:560:300:20,chromakey=0x0CFA05:0.12:0.05,despill=type=green:mix=${DESPILL}:expand=0,scale=${WIDTH}:-2:flags=lanczos`;

ff([
  "-ss", String(START), "-t", String(LENGTH), "-i", source, "-an",
  "-filter_complex",
  `[0]${key},format=yuva444p,split[a][b];[a]premultiply=inplace=1,format=yuv444p[c];[b]alphaextract,format=yuv444p[m];[c][m]vstack,format=yuv420p`,
  "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-profile:v", "high", "-movflags", "+faststart",
  out("wave.mp4"),
]);
// The clip's first frame is the rest pose the badge holds; the still matches it.
ff(["-ss", String(START), "-i", source, "-vf", key, "-frames:v", "1", "-c:v", "libwebp", "-quality", "85", out("rest.webp")]);

const [w, h] = String(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", out("wave.mp4")]))
  .trim()
  .split(",")
  .map(Number);
const kb = (f) => Math.round(statSync(out(f)).size / 1024);
console.log(`jun-media: wave.mp4 ${w}×${h} (frame ${w}×${h / 2}), ${kb("wave.mp4")} KB · rest.webp ${kb("rest.webp")} KB`);
