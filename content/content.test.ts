/**
 * Content rules. Every project must parse, and no project may carry a term that
 * would identify confidential work. Sensitive terms are stored here only as SHA-256
 * hashes of their normalised form (lowercase, split on non-alphanumerics, joined by
 * single spaces), so this file never contains the words it guards against.
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import denylist from "../scripts/leak-denylist.json";
import { projects } from "./index";
import { projectInputs } from "./projects";
import type { Project } from "./schema";

/** Hashed denylists shared with the build-time leak check (scripts/leak-check.mjs). */
const BANNED_HASHES = new Set(denylist.banned);
const REDACTED_HASHES = new Set(denylist.redacted);
const CLASSIFIED_HASHES = new Set(denylist.classifiedOnly);

/** Marketing filler the copy must not use. */
const SLOP = ["elevate", "seamless", "unleash", "revolutionize", "cutting-edge", "game-changer", "supercharge"];

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Every string in the project (keys and values), so escape sequences can't hide words. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      out.push(k);
      strings(v, out);
    }
  }
  return out;
}

function tokens(p: Project): string[] {
  return strings(p)
    .join(" \n ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Hashes of every 1-, 2- and 3-word n-gram in the project. */
function ngramHashes(p: Project): Map<string, string> {
  const t = tokens(p);
  const out = new Map<string, string>();
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i + n <= t.length; i++) {
      const gram = t.slice(i, i + n).join(" ");
      out.set(sha256(gram), gram);
    }
  }
  return out;
}

function hits(p: Project, denylist: Set<string>): string[] {
  // Report hashes only, so a failing run doesn't print the guarded word either.
  return [...ngramHashes(p).keys()].filter((h) => denylist.has(h)).map((h) => h.slice(0, 12));
}

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

describe("project content", () => {
  it("loads every project input through the schema", () => {
    expect(projects.length).toBe(projectInputs.length);
    expect(projects.length).toBeGreaterThanOrEqual(24);
  });

  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps classified projects anonymous", () => {
    const classified = projects.filter((p) => p.tier === "classified");
    expect(classified.length).toBe(3);
    for (const p of classified) {
      expect(p.redacted, p.slug).toBe(true);
      expect(p.links, p.slug).toEqual([]);
      expect(p.client, p.slug).toBeUndefined();
      expect(p.chapter, p.slug).toBe("classified");
      expect(hits(p, CLASSIFIED_HASHES), p.slug).toEqual([]);
    }
  });

  it.each(projects.map((p) => [p.slug, p] as const))("%s contains no banned term", (_slug, p) => {
    expect(hits(p, BANNED_HASHES)).toEqual([]);
    expect(hits(p, REDACTED_HASHES)).toEqual([]);
  });

  it.each(projects.map((p) => [p.slug, p] as const))("%s avoids slop copy", (_slug, p) => {
    const text = tokens(p).join(" ");
    for (const word of SLOP) {
      const normalised = word.toLowerCase().split(/[^a-z0-9]+/).join(" ");
      expect(text.includes(normalised), word).toBe(false);
    }
  });

  it.each(projects.map((p) => [p.slug, p] as const))("%s keeps beat bodies at 60–160 words", (_slug, p) => {
    for (const b of p.beats) {
      const n = wordCount(b.body);
      expect(n, `${b.heading}: ${n} words`).toBeGreaterThanOrEqual(60);
      expect(n, `${b.heading}: ${n} words`).toBeLessThanOrEqual(160);
    }
  });

  it("gives flagships the full arc", () => {
    for (const p of projects.filter((x) => x.tier === "flagship")) {
      expect(p.beats.map((b) => b.kind).slice(0, 4), p.slug).toEqual([
        "context",
        "rising",
        "decision",
        "resolution",
      ]);
    }
  });

  it("points every screen, loop and media item at a file that exists", () => {
    const missing: string[] = [];
    for (const p of projects) {
      const refs = [p.screen.poster, p.screen.loop, p.coldOpen?.src, p.coldOpen?.poster, ...p.beats.flatMap((b) => (b.media ?? []).flatMap((m) => [m.src, m.poster]))];
      for (const r of refs) if (r && !existsSync(path.join(process.cwd(), "public", r))) missing.push(`${p.slug}: ${r}`);
    }
    expect(missing).toEqual([]);
  });
});
