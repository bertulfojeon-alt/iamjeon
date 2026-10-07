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

describe("ending while connecting", () => {
  it("frees a microphone granted after End, and never fetches a token", async () => {
    const stopped = vi.fn();
    let grant: (s: MediaStream) => void = () => {};
    vi.stubGlobal("isSecureContext", true);
    vi.stubGlobal(
      "AudioContext",
      class {
        audioWorklet = { addModule: async () => {} };
        resume = async () => {};
        close = async () => {};
      },
    );
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: () => new Promise<MediaStream>((r) => (grant = r)) } });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const session = new JunSession({ onStatus: () => {}, onSubtitle: () => {}, onTool: () => ({}), onFailure: () => {} });
    const started = session.start();
    session.stop(); // End, while the browser still asks for the microphone
    grant({ getTracks: () => [{ stop: stopped }], getAudioTracks: () => [] } as unknown as MediaStream);
    await started;

    expect(stopped).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
