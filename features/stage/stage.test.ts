import { describe, expect, it } from "vitest";
import { initialStage, stageReducer, type StageWorld } from "./stage";

const world: StageWorld = { order: ["calls-a", "calls-b", "trade-a"] };
const reduce = stageReducer(world);

describe("stage", () => {
  it("starts on the All work grid", () => {
    expect(initialStage(world)).toEqual({ kind: "grid" });
  });

  it("shows known projects", () => {
    expect(reduce(initialStage(world), { type: "show", slug: "trade-a" })).toEqual({ kind: "project", slug: "trade-a" });
  });

  it("ignores unknown slugs, including prototype keys, and returns the same state", () => {
    const s0 = initialStage(world);
    expect(reduce(s0, { type: "show", slug: "nope" })).toBe(s0);
    expect(reduce(s0, { type: "show", slug: "toString" })).toBe(s0);
    expect(reduce(s0, { type: "show", slug: "constructor" })).toBe(s0);
  });

  it("returns to the grid from a project or a panel", () => {
    const shown = reduce(initialStage(world), { type: "show", slug: "trade-a" });
    expect(reduce(shown, { type: "grid" })).toEqual({ kind: "grid" });
    expect(reduce(reduce(shown, { type: "panel", panel: "about" }), { type: "grid" })).toEqual({ kind: "grid" });
    const s0 = initialStage(world);
    expect(reduce(s0, { type: "grid" })).toBe(s0);
  });

  it("opens panels and only known ones", () => {
    const s0 = initialStage(world);
    expect(reduce(s0, { type: "panel", panel: "contact" })).toEqual({ kind: "panel", panel: "contact", back: { kind: "grid" } });
    expect(reduce(s0, { type: "panel", panel: "nope" as never })).toBe(s0);
  });

  it("'back' from a panel returns to what was open before it", () => {
    const shown = reduce(initialStage(world), { type: "show", slug: "trade-a" });
    const panel = reduce(shown, { type: "panel", panel: "about" });
    expect(reduce(panel, { type: "back" })).toEqual({ kind: "project", slug: "trade-a" });
    const other = reduce(panel, { type: "panel", panel: "contact" });
    expect(reduce(other, { type: "back" })).toEqual({ kind: "project", slug: "trade-a" });
    expect(reduce(shown, { type: "back" })).toBe(shown);
  });
  it("keeps a summary on the contact panel only (Jun's note to Jeon)", () => {
    const s0 = initialStage(world);
    const contact = reduce(s0, { type: "panel", panel: "contact", summary: "Runs a call centre, needs after-hours answers." });
    expect(contact).toMatchObject({ kind: "panel", panel: "contact", summary: "Runs a call centre, needs after-hours answers." });
    const about = reduce(s0, { type: "panel", panel: "about", summary: "ignored" });
    expect(about).not.toHaveProperty("summary");
    const plain = reduce(reduce(contact, { type: "back" }), { type: "panel", panel: "contact" });
    expect(plain).not.toHaveProperty("summary");
  });
  it("keeps a panel when the address catches up with the project it was opened over", () => {
    // Jun opens a project (the address changes to /work/trade-a), then Contact; the address
    // effect lands after and sends "show trade-a": the panel must stay.
    const shown = reduce(initialStage(world), { type: "show", slug: "trade-a" });
    const contact = reduce(shown, { type: "panel", panel: "contact", summary: "note" });
    expect(reduce(contact, { type: "show", slug: "trade-a" })).toBe(contact);
    expect(reduce(contact, { type: "show", slug: "calls-a" })).toEqual({ kind: "project", slug: "calls-a" });
  });
});
