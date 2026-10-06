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
});
