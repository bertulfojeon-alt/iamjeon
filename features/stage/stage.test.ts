import { describe, expect, it } from "vitest";
import { initialStage, stageReducer, type StageWorld } from "./stage";

const world: StageWorld = {
  order: ["calls-a", "calls-b", "trade-a"],
  trackOf: { "calls-a": "calls", "calls-b": "calls", "trade-a": "trading" },
};
const reduce = stageReducer(world);

describe("stage", () => {
  it("starts on explore, focused on the first project", () => {
    expect(initialStage(world)).toEqual({ kind: "explore", focus: "calls-a" });
  });

  it("focuses and shows known projects", () => {
    const s0 = initialStage(world);
    expect(reduce(s0, { type: "focus", slug: "trade-a" })).toEqual({ kind: "explore", focus: "trade-a" });
    expect(reduce(s0, { type: "show", slug: "calls-b" })).toEqual({ kind: "scene", slug: "calls-b" });
  });

  it("ignores unknown slugs and returns the same state", () => {
    const s0 = initialStage(world);
    expect(reduce(s0, { type: "show", slug: "nope" })).toBe(s0);
    expect(reduce(s0, { type: "focus", slug: "nope" })).toBe(s0);
  });

  it("'next' moves within the scene's track and wraps", () => {
    expect(reduce({ kind: "scene", slug: "calls-a" }, { type: "next" })).toEqual({ kind: "scene", slug: "calls-b" });
    expect(reduce({ kind: "scene", slug: "calls-b" }, { type: "next" })).toEqual({ kind: "scene", slug: "calls-a" });
    const solo = { kind: "scene", slug: "trade-a" } as const;
    expect(reduce(solo, { type: "next" })).toBe(solo);
    const explore = initialStage(world);
    expect(reduce(explore, { type: "next" })).toBe(explore);
  });

  it("returning to explore keeps the scene's project in focus", () => {
    expect(reduce({ kind: "scene", slug: "trade-a" }, { type: "explore" })).toEqual({ kind: "explore", focus: "trade-a" });
    expect(reduce({ kind: "panel", panel: "about" }, { type: "explore" })).toEqual({ kind: "explore", focus: "calls-a" });
    expect(reduce({ kind: "panel", panel: "about" }, { type: "explore", focus: "calls-b" })).toEqual({ kind: "explore", focus: "calls-b" });
  });

  it("opens panels", () => {
    expect(reduce(initialStage(world), { type: "panel", panel: "contact" })).toEqual({ kind: "panel", panel: "contact" });
  });
});
