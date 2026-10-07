import { describe, expect, it } from "vitest";
import { joinStacked } from "./stackedAlpha";

const px = (...v: number[]) => new Uint8ClampedArray(v);

describe("joinStacked", () => {
  it("keeps an opaque pixel as is", () => {
    const top = px(200, 100, 50, 255);
    joinStacked(top, px(255, 255, 255, 255));
    expect(Array.from(top)).toEqual([200, 100, 50, 255]);
  });

  it("makes a pixel with a black mask transparent", () => {
    const top = px(0, 0, 0, 255);
    joinStacked(top, px(0, 0, 0, 255));
    expect(top[3]).toBe(0);
  });

  it("un-premultiplies a soft edge", () => {
    const top = px(64, 64, 64, 255);
    joinStacked(top, px(128, 128, 128, 255));
    expect(top[3]).toBe(128);
    expect(top[0]).toBeGreaterThanOrEqual(126);
    expect(top[0]).toBeLessThanOrEqual(128);
  });

  it("never overflows when compression makes the colour brighter than the mask allows", () => {
    const top = px(250, 10, 10, 255);
    joinStacked(top, px(100, 100, 100, 255));
    expect(top[0]).toBe(255);
  });

  it("handles every pixel of a frame", () => {
    const top = px(10, 10, 10, 255, 20, 20, 20, 255);
    joinStacked(top, px(0, 0, 0, 255, 255, 255, 255, 255));
    expect([top[3], top[7]]).toEqual([0, 255]);
  });
});

describe("drawStackedFrame", () => {
  it("skips a frame too small to split (WebKit reports 1×1 before decoding) without touching the canvas", async () => {
    const { drawStackedFrame } = await import("./stackedAlpha");
    let reads = 0;
    const work = { canvas: { width: 0, height: 0 }, drawImage: () => {}, getImageData: () => (reads++, { data: new Uint8ClampedArray(4) }) };
    const video = { videoWidth: 1, videoHeight: 1 } as HTMLVideoElement;
    const canvas = { width: 0, height: 0, getContext: () => ({ putImageData: () => {} }) } as unknown as HTMLCanvasElement;
    expect(drawStackedFrame(video, canvas, work as unknown as CanvasRenderingContext2D)).toBe(false);
    expect(reads).toBe(0);
  });
});
