import { describe, expect, it } from "vitest";
import { base64ToBytes, bufferToBase64, pcm16ToFloat32 } from "./audio";

describe("live audio", () => {
  it("round-trips bytes through base64, including large buffers", () => {
    const bytes = new Uint8Array(100_000).map((_, i) => i % 256);
    expect(base64ToBytes(bufferToBase64(bytes.buffer))).toEqual(bytes);
  });

  it("turns 16-bit PCM into floats in [-1, 1)", () => {
    const pcm = new Int16Array([0, 16384, -32768, 32767]);
    const f = pcm16ToFloat32(new Uint8Array(pcm.buffer));
    expect(Array.from(f)).toEqual([0, 0.5, -1, 32767 / 32768]);
  });

  it("ignores a trailing odd byte", () => {
    expect(pcm16ToFloat32(new Uint8Array([0, 64, 7])).length).toBe(1);
  });
});
