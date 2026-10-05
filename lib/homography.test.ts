import { describe, expect, it } from "vitest";
import { coverTransform, mapQuad, rectToQuadMatrix, applyMatrix3d, type Quad } from "./homography";

describe("rectToQuadMatrix", () => {
  const w = 400;
  const h = 250;
  const quad: Quad = [
    [100, 80], // top-left
    [520, 110], // top-right
    [505, 380], // bottom-right
    [90, 350], // bottom-left
  ];

  it("maps each element corner exactly onto the marked monitor corner", () => {
    const m = rectToQuadMatrix(w, h, quad);
    const corners: [number, number][] = [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ];
    corners.forEach((c, i) => {
      const [x, y] = applyMatrix3d(m, c[0], c[1]);
      expect(x).toBeCloseTo(quad[i][0], 6);
      expect(y).toBeCloseTo(quad[i][1], 6);
    });
  });

  it("returns a 16-number column-major matrix usable by CSS matrix3d()", () => {
    const m = rectToQuadMatrix(w, h, quad);
    expect(m).toHaveLength(16);
    expect(m.every(Number.isFinite)).toBe(true);
  });
});

describe("coverTransform + mapQuad", () => {
  it("reproduces object-fit: cover for a wider viewport (crops top/bottom)", () => {
    const t = coverTransform(1920, 1080, 2400, 1000);
    expect(t.scale).toBeCloseTo(1.25);
    expect(t.offsetX).toBeCloseTo(0);
    expect(t.offsetY).toBeCloseTo((1000 - 1080 * 1.25) / 2);
  });

  it("reproduces object-fit: cover for a taller viewport (crops left/right)", () => {
    const t = coverTransform(1920, 1080, 800, 1000);
    expect(t.scale).toBeCloseTo(1000 / 1080);
    expect(t.offsetY).toBeCloseTo(0);
    expect(t.offsetX).toBeCloseTo((800 - 1920 * (1000 / 1080)) / 2);
  });

  it("moves image-space corners into viewport space", () => {
    const t = coverTransform(1920, 1080, 1920, 1080);
    const q: Quad = [
      [10, 20],
      [30, 20],
      [30, 40],
      [10, 40],
    ];
    expect(mapQuad(q, t)).toEqual(q);
  });
});
