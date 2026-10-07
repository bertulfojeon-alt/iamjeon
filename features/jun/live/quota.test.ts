import { describe, expect, it } from "vitest";
import { isQuotaError } from "./quota";

describe("isQuotaError", () => {
  it("recognises quota refusals", () => {
    expect(isQuotaError({ status: 429 })).toBe(true);
    expect(isQuotaError(new Error("RESOURCE_EXHAUSTED: try later"))).toBe(true);
    expect(isQuotaError({ code: 1011, reason: "You exceeded your current quota" })).toBe(true);
    expect(isQuotaError({ code: 1008, reason: "Resource has been exhausted" })).toBe(true);
  });

  it("does not treat other failures as quota", () => {
    expect(isQuotaError({ code: 1000, reason: "" })).toBe(false);
    expect(isQuotaError(new Error("Failed to fetch"))).toBe(false);
    expect(isQuotaError({ status: 502 })).toBe(false);
    expect(isQuotaError(undefined)).toBe(false);
  });
});
