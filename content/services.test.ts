import { describe, expect, it } from "vitest";
import { projects } from "./index";
import { SERVICES, SKILLS, skillMatches } from "./services";

const slugs = new Set(projects.map((p) => p.slug));
const SLOP = ["elevate", "seamless", "unleash", "revolutionize", "cutting-edge", "game-changer", "supercharge", "world-class", "guarantee"];

describe("services", () => {
  it.each(SERVICES.map((s) => [s.id, s] as const))("%s is backed by real projects", (_id, s) => {
    expect(s.proof.length).toBeGreaterThanOrEqual(2);
    for (const slug of s.proof) expect(slugs.has(slug), slug).toBe(true);
  });

  it("names each service once, with no figures, em dashes or filler", () => {
    expect(new Set(SERVICES.map((s) => s.id)).size).toBe(SERVICES.length);
    for (const s of SERVICES) {
      const text = [s.title, s.line, s.lead, ...s.points].join(" ");
      expect(text, s.id).not.toMatch(/\b\d|—/);
      for (const word of SLOP) expect(text.toLowerCase(), `${s.id}: ${word}`).not.toContain(word);
    }
  });
});

describe("skills", () => {
  it.each(SKILLS.map((s) => [s.label, s] as const))("%s matches at least two projects' stacks", (_label, s) => {
    expect(projects.filter((p) => skillMatches(s, p.stack)).length).toBeGreaterThanOrEqual(2);
  });
});
