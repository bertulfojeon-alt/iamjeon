import { describe, expect, it } from "vitest";
import { screenItems } from "@/content/screen-items";
import { runTool, type ToolContext } from "./tools";

const items = screenItems();
const withAll = items.find((i) => i.spotlights.length && i.metrics.length)!;
const noMetrics = items.find((i) => i.metrics.length === 0)!;
const ctx = (presenting = false, showing: string | null = null): ToolContext => ({ items, presenting, showing });

describe("look-ups", () => {
  it("lists every project, or one group", () => {
    const all = runTool("list_projects", {}, ctx()).response.projects as { slug: string }[];
    expect(all.map((p) => p.slug)).toEqual(items.map((i) => i.slug));
    const trading = runTool("list_projects", { group: "trading" }, ctx()).response.projects as { group: string }[];
    expect(trading.length).toBeGreaterThan(0);
    expect(trading.every((p) => p.group === "trading")).toBe(true);
    expect(runTool("list_projects", { group: "crypto" }, ctx()).response.error).toBeTruthy();
  });

  it("reminds Jun, with the facts, to describe only what is listed", () => {
    const note = runTool("get_project", { slug: withAll.slug }, ctx()).response.note as string;
    expect(note).toMatch(/only/i);
    expect(note).toMatch(/connector/i);
  });

  it("while presenting, looking up another project puts that project on screen", () => {
    const other = items.find((i) => i.slug !== withAll.slug)!;
    expect(runTool("get_project", { slug: withAll.slug }, ctx(true, other.slug)).effect).toEqual({
      type: "present",
      cmd: { type: "show", slide: { slug: withAll.slug, kind: "hero" } },
    });
    // Already on screen, or not presenting: the screen stays as it is.
    expect(runTool("get_project", { slug: withAll.slug }, ctx(true, withAll.slug)).effect).toBeUndefined();
    expect(runTool("get_project", { slug: withAll.slug }, ctx(false, other.slug)).effect).toBeUndefined();
  });

  it("returns a project's detail, and an error for an unknown slug", () => {
    const r = runTool("get_project", { slug: withAll.slug }, ctx());
    expect((r.response.project as { slug: string }).slug).toBe(withAll.slug);
    expect(r.effect).toBeUndefined();
    for (const slug of ["nope", "constructor", "__proto__", 42]) {
      const bad = runTool("get_project", { slug }, ctx());
      expect(bad.response.error).toBeTruthy();
      expect(bad.effect).toBeUndefined();
    }
  });
});

describe("the presentation", () => {
  it("only offers the presentation: the visitor opens it with a tap", () => {
    const r = runTool("start_presentation", {}, ctx());
    expect(r.effect).toEqual({ type: "offer-presentation" });
    expect(r.response.note).toMatch(/wait/i);
    expect(runTool("start_presentation", {}, ctx(true)).effect).toBeUndefined();
  });

  it("refuses a slide before it is open", () => {
    const r = runTool("show_slide", { kind: "hero", slug: withAll.slug }, ctx());
    expect(r.response.error).toMatch(/start_presentation/);
    expect(r.effect).toBeUndefined();
  });

  it("shows a project's slides", () => {
    expect(runTool("show_slide", { kind: "hero", slug: withAll.slug }, ctx(true)).effect).toEqual({
      type: "present",
      cmd: { type: "show", slide: { slug: withAll.slug, kind: "hero" } },
    });
    const feature = withAll.spotlights[0].feature;
    expect(runTool("show_slide", { kind: "feature", slug: withAll.slug, feature }, ctx(true)).effect).toEqual({
      type: "present",
      cmd: { type: "show", slide: { slug: withAll.slug, kind: "feature", feature } },
    });
  });

  it("shows about with no project", () => {
    expect(runTool("show_slide", { kind: "about" }, ctx(true)).effect).toEqual({ type: "present", cmd: { type: "show", slide: { slug: null, kind: "about" } } });
  });

  it("refuses slides a project cannot fill, unknown kinds and unknown features", () => {
    const cases = [
      { kind: "hero", slug: "nope" },
      { kind: "numbers", slug: noMetrics.slug },
      { kind: "feature", slug: withAll.slug, feature: "not a feature" },
      { kind: "feature", slug: withAll.slug },
      { kind: "hologram", slug: withAll.slug },
      { kind: "hero" },
    ];
    for (const args of cases) {
      const r = runTool("show_slide", args, ctx(true));
      expect(r.response.error, JSON.stringify(args)).toBeTruthy();
      expect(r.effect).toBeUndefined();
    }
  });

  it("closes only when open", () => {
    expect(runTool("end_presentation", {}, ctx(true)).effect).toEqual({ type: "present", cmd: { type: "end" } });
    expect(runTool("end_presentation", {}, ctx()).effect).toBeUndefined();
  });
});

describe("the desk and contact", () => {
  it("opens a known project", () => {
    expect(runTool("open_project", { slug: withAll.slug }, ctx()).effect).toEqual({ type: "show-project", slug: withAll.slug });
    expect(runTool("open_project", { slug: "nope" }, ctx()).effect).toBeUndefined();
  });

  it("opens contact with a clamped note, or a contact slide while presenting", () => {
    const long = "x ".repeat(400);
    const r = runTool("open_contact", { summary: long, channel: "whatsapp" }, ctx());
    expect(r.effect?.type).toBe("contact");
    expect(r.effect?.type === "contact" && r.effect.summary.length).toBeLessThanOrEqual(500);
    expect(r.effect?.type === "contact" && r.effect.channel).toBe("whatsapp");
    expect(runTool("open_contact", { summary: "Hi", channel: "carrier pigeon" }, ctx()).effect).toEqual({ type: "contact", summary: "Hi" });
    expect(runTool("open_contact", { summary: "Hi" }, ctx(true)).effect).toEqual({
      type: "present",
      cmd: { type: "show", slide: { slug: null, kind: "contact", summary: "Hi" } },
    });
    expect(runTool("open_contact", { summary: "  " }, ctx()).response.error).toBeTruthy();
  });

  it("answers an unknown tool with an error", () => {
    expect(runTool("delete_everything", {}, ctx()).response.error).toBeTruthy();
  });
});
