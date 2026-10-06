import { describe, expect, it } from "vitest";
import { clockLine } from "./clock";

const at = new Date("2026-10-06T15:58:00Z"); // 11:58 PM in Manila

describe("clockLine", () => {
  it("shows Lapu-Lapu time and the visitor's time when they differ", () => {
    expect(clockLine(at, "America/New_York")).toEqual({ here: "11:58 PM", there: "11:58 AM" });
  });
  it("shows only one clock for visitors in the Philippines' time", () => {
    expect(clockLine(at, "Asia/Manila")).toEqual({ here: "11:58 PM", there: null });
    expect(clockLine(at, "Asia/Singapore")).toEqual({ here: "11:58 PM", there: null });
  });
  it("survives a missing or invalid time zone", () => {
    expect(clockLine(at)).toEqual({ here: "11:58 PM", there: null });
    expect(clockLine(at, "Not/AZone")).toEqual({ here: "11:58 PM", there: null });
  });
});
