import { describe, expect, it } from "vitest";
import { pickMode, memoryBudget } from "./mode";

const desktop = {
  reducedMotion: false,
  saveData: false,
  coarsePointer: false,
  viewportWidth: 1440,
  cores: 8,
  memoryGb: 8,
  motionPausedByUser: false,
};

describe("pickMode", () => {
  it("gives a capable desktop the full film", () => {
    expect(pickMode(desktop)).toBe("full");
  });

  it("falls back to still for reduced motion, data saver, or a user pause", () => {
    expect(pickMode({ ...desktop, reducedMotion: true })).toBe("still");
    expect(pickMode({ ...desktop, saveData: true })).toBe("still");
    expect(pickMode({ ...desktop, motionPausedByUser: true })).toBe("still");
  });

  it("gives touch devices, narrow screens and weak hardware the lite cut", () => {
    expect(pickMode({ ...desktop, coarsePointer: true })).toBe("lite");
    expect(pickMode({ ...desktop, viewportWidth: 700 })).toBe("lite");
    expect(pickMode({ ...desktop, cores: 2 })).toBe("lite");
    expect(pickMode({ ...desktop, memoryGb: 2 })).toBe("lite");
  });

  it("lets still win over lite", () => {
    expect(pickMode({ ...desktop, coarsePointer: true, reducedMotion: true })).toBe("still");
  });
});

describe("memoryBudget", () => {
  it("keeps a smaller decode window in lite mode", () => {
    expect(memoryBudget("lite").windowAhead).toBeLessThan(memoryBudget("full").windowAhead);
    expect(memoryBudget("lite").maxDpr).toBeLessThanOrEqual(1.5);
  });
});
