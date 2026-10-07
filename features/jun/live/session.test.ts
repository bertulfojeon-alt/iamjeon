import { describe, expect, it, vi } from "vitest";
import { JunSession } from "./session";

describe("JunSession", () => {
  it("reports a browser without Web Audio as unsupported instead of hanging", async () => {
    const onFailure = vi.fn();
    const onStatus = vi.fn();
    const session = new JunSession({ onStatus, onSubtitle: () => {}, onTool: () => ({}), onFailure });
    await session.start();
    expect(onFailure).toHaveBeenCalledWith("unsupported");
  });
});
