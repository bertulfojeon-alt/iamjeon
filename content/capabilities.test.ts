import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SHOWCASE_IDS } from "@/components/showcase";
import { clampSummary } from "@/lib/contact";
import { projects } from "./index";
import { AI_PROMISE, CAPABILITIES, CAPABILITIES_LEAD } from "./capabilities";

const slugs = new Set(projects.map((p) => p.slug));
const SLOP = ["elevate", "seamless", "unleash", "revolutionize", "cutting-edge", "game-changer", "supercharge", "world-class", "guarantee"];

describe("capabilities", () => {
  it.each(CAPABILITIES.map((c) => [c.id, c] as const))("%s is backed by real projects and a real demo", (_id, c) => {
    expect(c.proof.length).toBeGreaterThanOrEqual(1);
    for (const slug of c.proof) expect(slugs.has(slug), slug).toBe(true);
    expect(c.points.length).toBeGreaterThanOrEqual(3);
    if (c.demo.kind === "showcase") expect(SHOWCASE_IDS).toContain(c.demo.id);
    else expect(existsSync(path.join(process.cwd(), "public", c.demo.src)), c.demo.src).toBe(true);
    expect(clampSummary(c.ask)).toBe(c.ask);
  });

  it("names each capability once, with no figures, em dashes or filler", () => {
    expect(new Set(CAPABILITIES.map((c) => c.id)).size).toBe(CAPABILITIES.length);
    const copy = [CAPABILITIES_LEAD, AI_PROMISE.title, AI_PROMISE.body, ...CAPABILITIES.flatMap((c) => [c.title, c.line, ...c.points, c.note ?? ""])];
    for (const text of copy) {
      expect(text).not.toMatch(/\b\d|—/);
      for (const word of SLOP) expect(text.toLowerCase(), word).not.toContain(word);
    }
  });

  it("keeps the AI promise to projects that exist", () => {
    for (const slug of AI_PROMISE.proof) expect(slugs.has(slug), slug).toBe(true);
  });
});
