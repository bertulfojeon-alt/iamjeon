import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { screenItems } from "@/content/screen-items";
import { findHits, loadDenylist, sha256 } from "@/scripts/leak-hits.mjs";
import { indexLine, projectDetail } from "@/features/jun/knowledge";
import { buildInstruction } from "./instruction";

const instruction = buildInstruction();

describe("Jun's system instruction", () => {
  it("indexes every project the site shows", () => {
    for (const item of screenItems()) expect(instruction).toContain(item.slug);
  });

  it("speaks as Jeon's AI twin and says it is an AI", () => {
    expect(instruction).toMatch(/AI twin/);
    expect(instruction).toMatch(/you are an AI/i);
  });

  it("carries the résumé as written", () => {
    const resume = readFileSync("content/resume.md", "utf8");
    expect(instruction).toContain(resume.split("\n").find((l) => l.startsWith("### Customer Service"))!);
  });

  it("never carries a metric's source note", () => {
    expect(instruction).not.toMatch(/source:/i);
  });

  it("stays inside the token budget (about 4 characters a token)", () => {
    expect(instruction.length / 4).toBeLessThanOrEqual(6000);
  });

  it("passes the leak check's global denylist", async () => {
    const { global } = await loadDenylist();
    expect(findHits(instruction, global)).toEqual([]);
  });

  // The classified-only list guards classified pages (the build check applies it to
  // /work/project-*). Public projects elsewhere on the site may use those words, so
  // the same rule holds here: whatever Jun is told about a classified project, in the
  // index or through get_project, must pass it.
  it("tells Jun nothing about a classified project that is on the classified-only list", async () => {
    const { classifiedOnly } = await loadDenylist();
    const classified = screenItems().filter((i) => i.classified);
    expect(classified.length).toBeGreaterThan(0);
    for (const item of classified) {
      expect(findHits(indexLine(item), classifiedOnly)).toEqual([]);
      expect(findHits(JSON.stringify(projectDetail(item)), classifiedOnly)).toEqual([]);
    }
  });

  it("never adds a capability the work does not show", () => {
    expect(instruction).toMatch(/never add a capability/i);
  });

  it("waits for a yes before presenting: offering and opening are never in the same turn", () => {
    expect(instruction).toMatch(/stop and wait for their answer/i);
  });

  it("forbids linking classified work to any named company", () => {
    expect(instruction).toMatch(/never connect a classified project to any company/i);
  });

  it("would catch a guarded term (the check can fail)", () => {
    const planted = new Set([sha256("zebra quartz")]);
    expect(findHits(`${instruction} zebra quartz`, planted)).toHaveLength(1);
  });
});
