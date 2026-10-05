/**
 * Screen replacement maths.
 *
 * The room footage ends on a still frame of a monitor wall. Each monitor's four
 * corners are marked once, in source-image pixels. At runtime we:
 *   1. reproduce `object-fit: cover` to move those corners into viewport pixels;
 *   2. solve the projective transform (homography) that maps a plain w×h element
 *      onto that quadrilateral;
 *   3. hand it to CSS as `matrix3d(...)` with `transform-origin: 0 0`.
 * The result: a live DOM screen sits exactly on the monitor in the footage.
 */

export type Point = [number, number];
/** Corners in order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point];

export interface CoverTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** Same maths as CSS `object-fit: cover; object-position: center`. */
export function coverTransform(imgW: number, imgH: number, boxW: number, boxH: number): CoverTransform {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  return {
    scale,
    offsetX: (boxW - imgW * scale) / 2,
    offsetY: (boxH - imgH * scale) / 2,
  };
}

export function mapQuad(quad: Quad, t: CoverTransform): Quad {
  return quad.map(([x, y]) => [x * t.scale + t.offsetX, y * t.scale + t.offsetY]) as Quad;
}

/** Solve A·x = b in place (Gaussian elimination with partial pivoting). */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    [A[col], A[pivot]] = [A[pivot], A[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    const p = A[col][col];
    if (Math.abs(p) < 1e-12) throw new Error("Degenerate quad: corners are collinear");
    for (let r = col + 1; r < n; r++) {
      const f = A[r][col] / p;
      for (let c = col; c < n; c++) A[r][c] -= f * A[col][c];
      b[r] -= f * b[col];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let c = r + 1; c < n; c++) s -= A[r][c] * x[c];
    x[r] = s / A[r][r];
  }
  return x;
}

/**
 * CSS matrix3d (column-major, 16 values) mapping the element rectangle
 * (0,0)-(w,h) onto `quad`. Apply with `transform-origin: 0 0`.
 */
export function rectToQuadMatrix(w: number, h: number, quad: Quad): number[] {
  const src: Point[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = quad[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const [a, bb, c, d, e, f, g, hh] = solve(A, b);
  // 3×3 [[a b c][d e f][g h 1]] embedded in a 4×4, column-major for CSS.
  return [a, d, 0, g, bb, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1];
}

/** Project a 2D point through a CSS matrix3d (used by tests and hit-checks). */
export function applyMatrix3d(m: number[], x: number, y: number): Point {
  const X = m[0] * x + m[4] * y + m[12];
  const Y = m[1] * x + m[5] * y + m[13];
  const W = m[3] * x + m[7] * y + m[15];
  return [X / W, Y / W];
}

export function toCssMatrix3d(m: number[]): string {
  return `matrix3d(${m.map((n) => +n.toFixed(10)).join(",")})`;
}
