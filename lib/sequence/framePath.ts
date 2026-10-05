/**
 * Resolves a sequence frame index to a concrete URL.
 *
 * The pattern uses a run of `#` characters as a zero-padded index placeholder:
 *   resolveFramePath("/sequences/demo", "frame_{####}.webp", 7) // ->
 *     "/sequences/demo/frame_0007.webp"
 *
 * Keeping path resolution isolated means swapping a sequence's naming scheme is
 * a one-line config change.
 */

const TOKEN = /\{(#+)\}/;

export function resolveFramePath(
  basePath: string,
  pattern: string,
  index: number,
): string {
  const match = pattern.match(TOKEN);
  if (!match) {
    throw new Error(
      `Sequence pattern "${pattern}" is missing a {#...} index token.`,
    );
  }
  const width = match[1].length;
  const padded = String(index).padStart(width, "0");
  const filename = pattern.replace(TOKEN, padded);
  return `${basePath}/${filename}`;
}
