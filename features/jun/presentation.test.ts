import { describe, expect, it } from "vitest";
import { CLOSED, presentationReducer } from "./presentation";

describe("presentation", () => {
  it("starts closed and opens empty", () => {
    expect(CLOSED).toEqual({ open: false });
    expect(presentationReducer(CLOSED, { type: "start" })).toEqual({ open: true, slides: [], current: -1 });
  });

  it("shows slides one at a time, the newest current, each with its own key", () => {
    let s = presentationReducer(CLOSED, { type: "start" });
    s = presentationReducer(s, { type: "show", slide: { slug: "a", kind: "hero" } });
    s = presentationReducer(s, { type: "show", slide: { slug: "a", kind: "feature", feature: "f" } });
    expect(s.open && s.current).toBe(1);
    expect(s.open && s.slides.map((x) => x.key)).toEqual([0, 1]);
    expect(s.open && s.slides[1]).toMatchObject({ slug: "a", kind: "feature", feature: "f" });
  });

  it("ignores a slide while closed and a second start while open", () => {
    expect(presentationReducer(CLOSED, { type: "show", slide: { slug: "a", kind: "hero" } })).toBe(CLOSED);
    const open = presentationReducer(CLOSED, { type: "start" });
    expect(presentationReducer(open, { type: "start" })).toBe(open);
  });

  it("closes", () => {
    const open = presentationReducer(CLOSED, { type: "start" });
    expect(presentationReducer(open, { type: "end" })).toEqual({ open: false });
    expect(presentationReducer(CLOSED, { type: "end" })).toBe(CLOSED);
  });
});
