import { describe, expect, it } from "vitest";
import { screenItems } from "@/content/screen-items";
import { indexLine, projectDetail } from "./knowledge";

const items = screenItems();
const bySlug = (slug: string) => items.find((i) => i.slug === slug)!;

describe("Jun's project index", () => {
  it("names each project by slug, title and group", () => {
    const line = indexLine(bySlug("tradesbymerc"));
    expect(line).toContain("tradesbymerc");
    expect(line).toContain("TradesByMerc");
    expect(line).toContain("trading");
  });

  it("flags classified work as client work under NDA", () => {
    expect(indexLine(bySlug("project-payday"))).toMatch(/classified/i);
  });
});

describe("Jun's project detail", () => {
  it("offers only the slides a project can fill", () => {
    for (const item of items) {
      const d = projectDetail(item);
      expect(d.slides).toContain("hero");
      expect(d.slides).toContain("stack");
      expect(d.slides.includes("numbers")).toBe(item.metrics.length > 0);
      expect(d.slides.includes("feature")).toBe(item.spotlights.length > 0);
      expect(d.slides.includes("screens")).toBe(item.shots.length >= 2);
    }
  });

  it("carries metrics as value and label only, never a source", () => {
    const withMetrics = items.find((i) => i.metrics.length > 0)!;
    const d = projectDetail(withMetrics);
    expect(d.metrics.length).toBeGreaterThan(0);
    for (const m of d.metrics) expect(Object.keys(m).sort()).toEqual(["label", "value"]);
  });

  it("names spotlights by feature and label", () => {
    const withSpots = items.find((i) => i.spotlights.length > 0)!;
    expect(projectDetail(withSpots).spotlights[0]).toEqual({ feature: withSpots.spotlights[0].feature, label: withSpots.spotlights[0].label });
  });
});
