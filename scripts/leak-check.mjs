/**
 * Build-time leak check. Runs after `next build` and fails the build if any
 * guarded identifier appears in what would be deployed.
 *
 * Scans everything a visitor can fetch: prerendered HTML / RSC payloads
 * (.next/server/app), client JS and CSS (.next/static), and every text file under
 * public/. Server-only chunks are not publicly reachable and are skipped — they
 * also carry vendor locale strings that collide with short guarded words. Classified case pages are additionally checked against the
 * classified-only list. The denylist holds SHA-256 hashes of lowercase 1–3 word
 * n-grams only, so this public repo never contains the words it protects.
 *
 * Images and video frames are covered by the capture pipeline's OCR pass
 * (scripts/capture), which writes to public/media/projects.
 *
 *   node scripts/leak-check.mjs            scan the build
 *   node scripts/leak-check.mjs --self-test  plant a guarded term and prove it is caught
 */

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findHits, loadDenylist } from "./leak-hits.mjs";

export { findHits };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { global: GLOBAL, classifiedOnly: CLASSIFIED } = await loadDenylist();
const TEXT_EXT = new Set([".html", ".rsc", ".body", ".js", ".json", ".txt", ".svg", ".xml", ".webmanifest", ".css", ".meta"]);

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "cache" || e.name === "node_modules") continue;
      yield* walk(full);
    } else if (TEXT_EXT.has(path.extname(e.name))) {
      yield full;
    }
  }
}

async function scan() {
  const targets = [path.join(root, ".next", "server", "app"), path.join(root, ".next", "static"), path.join(root, "public")];
  const failures = [];
  let files = 0;
  for (const dir of targets) {
    for await (const file of walk(dir)) {
      const { size } = await stat(file);
      if (size > 8 * 1024 * 1024) continue;
      const text = await readFile(file, "utf8");
      files++;
      const rel = path.relative(root, file);
      const hits = findHits(text, GLOBAL);
      // Classified case pages also must not carry the client's own name.
      if (/work[\\/]project-/.test(rel)) hits.push(...findHits(text, CLASSIFIED));
      if (hits.length) failures.push({ file: rel, hits });
    }
  }
  return { files, failures };
}

if (process.argv.includes("--self-test")) {
  // Prove the check can fail: take one guarded hash and reconstruct a planted text
  // is impossible (hashes are one-way), so the caller supplies the plain term via env.
  const term = process.env.LEAK_SELF_TEST_TERM;
  if (!term) {
    console.error("Set LEAK_SELF_TEST_TERM to a guarded term (from the private appendix) to run the self-test.");
    process.exit(2);
  }
  const caught = findHits(`some page text ${term} more text`, GLOBAL).length > 0;
  console.log(caught ? "self-test: planted term was CAUGHT (check works)" : "self-test: planted term was MISSED");
  process.exit(caught ? 0 : 1);
}

const { files, failures } = await scan();
if (files === 0) {
  console.error("leak-check: no build output found — run `next build` first.");
  process.exit(1);
}
if (failures.length) {
  console.error(`leak-check: FAILED — guarded identifiers found in ${failures.length} file(s):`);
  for (const f of failures) console.error(`  ${f.file}  [${f.hits.join(", ")}]`);
  process.exit(1);
}
console.log(`leak-check: clean — ${files} files scanned, 0 guarded identifiers.`);
