/**
 * Converts the Google Flow clips into scroll-scrub footage.
 *
 *   npm run frames                       # reads F:\ME\flow (or FLOW_DIR)
 *   npm run frames -- --only c3          # one clip
 *
 * For each clip C1–C4 (→ scenes c1–c4):
 *   - desktop frames 1600×900 WebP, mobile frames 720×1280 (centre 9:16 crop),
 *     sampled at FPS (default 15 → 120 frames for an 8 s clip)
 *   - poster-desktop/mobile (first frame) and still.webp (most telling frame)
 * C3's last frame also becomes the room plate (full 1920×1080), because the
 * monitor wall continues straight from it. Re-mark content/room.json corners after.
 * Loops L1/L2 are encoded as silent seamless H.264 loops (crossfaded ends).
 * Generated audio is stripped from the footage and kept in media-src/audio for
 * possible use as ambience. footage.json is rewritten with the real frame counts.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FLOW = process.env.FLOW_DIR ?? "F:\\ME\\flow";
const FPS = Number(process.env.FPS ?? 15);
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const media = (...p) => path.join(root, "public", "media", ...p);

const STILL_AT = { c1: 0.28, c2: 0, c3: 1, c4: 1 }; // fraction of the clip

function ff(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}
function duration(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  return Number(String(out).trim());
}
async function countFrames(dir) {
  return (await readdir(dir)).filter((f) => f.startsWith("f_")).length;
}

async function findClip(name) {
  const files = await readdir(FLOW).catch(() => []);
  return files.find((f) => f.toLowerCase().startsWith(name.toLowerCase()) && /\.(mp4|mov|webm)$/i.test(f));
}

const footagePath = path.join(root, "content", "footage.json");
const footage = JSON.parse(await readFile(footagePath, "utf8"));
await mkdir(path.join(root, "media-src", "audio"), { recursive: true });

for (const n of [1, 2, 3, 4]) {
  const scene = `c${n}`;
  if (only && only !== scene) continue;
  const clip = await findClip(`C${n}`);
  if (!clip) {
    console.log(`${scene}: no C${n} clip in ${FLOW} — keeping current footage`);
    continue;
  }
  const src = path.join(FLOW, clip);
  const dur = duration(src);
  console.log(`${scene}: ${clip} (${dur.toFixed(2)} s)`);

  for (const size of ["desktop", "mobile"]) {
    const dir = media("night", scene, size);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    const vf =
      size === "desktop"
        ? `fps=${FPS},scale=1600:900:flags=lanczos`
        : `fps=${FPS},crop=ih*9/16:ih,scale=720:1280:flags=lanczos`;
    ff(["-i", src, "-an", "-vf", vf, "-c:v", "libwebp", "-quality", size === "desktop" ? "70" : "62", "-start_number", "0", path.join(dir, "f_%04d.webp")]);
    footage[scene][size] = await countFrames(dir);
    // Poster = first frame, so the cut into this shot never jumps.
    ff(["-i", path.join(dir, "f_0000.webp"), path.join(media("night", scene), `poster-${size}.webp`)]);
  }

  const stillT = Math.min(dur - 0.05, Math.max(0, dur * STILL_AT[scene]));
  ff(["-ss", String(stillT), "-i", src, "-frames:v", "1", "-vf", "scale=1600:900", "-c:v", "libwebp", "-quality", "78", media("night", scene, "still.webp")]);

  if (scene === "c3") {
    // The wall's backdrop: the exact last frame at full resolution.
    ff(["-sseof", "-0.05", "-i", src, "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", media("night", "room-plate.webp")]);
    console.log("  room plate updated — re-mark the six monitor corners in content/room.json");
  }

  // Keep Veo's generated ambience for possible use as the sound layer.
  try {
    ff(["-i", src, "-vn", "-c:a", "aac", "-b:a", "128k", path.join(root, "media-src", "audio", `${scene}.m4a`)]);
  } catch {
    console.log("  (no audio track)");
  }
  console.log(`  frames: desktop ${footage[scene].desktop}, mobile ${footage[scene].mobile}`);
}

// Ambient loops: crossfade the tail into the head so the repeat is seamless.
for (const name of ["L1", "L2"]) {
  if (only && only !== name.toLowerCase()) continue;
  const clip = await findClip(name);
  if (!clip) continue;
  const src = path.join(FLOW, clip);
  const dur = duration(src);
  const fade = 1;
  await mkdir(media("night", "loops"), { recursive: true });
  const outFile = media("night", "loops", `${name.toLowerCase()}.mp4`);
  ff([
    "-i", src, "-i", src, "-an",
    "-filter_complex",
    `[0:v]trim=${fade}:${dur},setpts=PTS-STARTPTS[body];[1:v]trim=0:${fade},setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=${fade}:offset=${(dur - 2 * fade).toFixed(3)},scale=1600:900,format=yuv420p[v]`,
    "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-movflags", "+faststart", outFile,
  ]);
  console.log(`${name}: seamless loop → ${path.relative(root, outFile)}`);
}

await writeFile(footagePath, JSON.stringify(footage, null, 2) + "\n");
if (!existsSync(FLOW)) console.log(`(Flow folder ${FLOW} not found yet)`);
console.log("footage.json updated");
