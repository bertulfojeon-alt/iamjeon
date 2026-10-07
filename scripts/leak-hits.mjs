/**
 * The leak check's matcher, shared by the build check (scripts/leak-check.mjs) and the
 * unit tests that scan text the build check cannot see (Jun's instruction is built on
 * the server, whose chunks the build check skips). The denylist holds SHA-256 hashes
 * of lowercase 1–3 word n-grams only, so the repo never contains the words it protects.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const sha256 = (s) => createHash("sha256").update(s).digest("hex");

/** The guarded lists: `global` applies everywhere, `classifiedOnly` to classified pages. */
export async function loadDenylist() {
  const denylist = JSON.parse(await readFile(path.join(root, "scripts", "leak-denylist.json"), "utf8"));
  return { global: new Set([...denylist.banned, ...denylist.redacted]), classifiedOnly: new Set(denylist.classifiedOnly) };
}

/** Short hash prefixes of every guarded n-gram found in `text`. */
export function findHits(text, list) {
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const hits = new Set();
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      const h = sha256(tokens.slice(i, i + n).join(" "));
      if (list.has(h)) hits.add(h.slice(0, 12));
    }
  }
  return [...hits];
}
