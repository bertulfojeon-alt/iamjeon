/**
 * Shared type definitions for the cinematic engine.
 *
 * Scenes are authored as plain config objects against these types, keeping the
 * engine data-driven: dropping in a real image sequence is a config change, not a
 * code change.
 */

/** How a frame is fit into the canvas viewport. */
export type FrameFit = "cover" | "contain";

/** One rendition of a sequence on disk. */
export interface SequenceSource {
  /** Directory (under /public) holding the frames, no trailing slash. */
  basePath: string;
  /** Filename pattern with a `{#...}` token marking the zero-padded index. */
  pattern: string;
  /** Total number of frames in this rendition. */
  frameCount: number;
  /** 0-based index of the first frame (defaults to 0). */
  startIndex?: number;
}

/**
 * A scroll-scrubbed shot. `desktop` is the landscape rendition; `mobile` is an
 * optional lighter vertical rendition used in "lite" mode. Both should cover the
 * same camera move so progress maps 1:1.
 */
export interface SequenceConfig {
  desktop: SequenceSource;
  mobile?: SequenceSource;
  fit?: FrameFit;
  /** First frame — shown before frames decode, so the cut into this shot never jumps. */
  poster: string;
  mobilePoster?: string;
  /** The single most telling frame, used instead of the poster in "still" mode. */
  still?: string;
}

/** A text overlay tied to a span of the scene timeline. */
export interface OverlayConfig {
  id: string;
  /** Scene progress [0..1] where the overlay is fully visible. 0 = visible from first paint. */
  at: number;
  /** Scene progress [0..1] where the overlay begins leaving. Omit to stay. */
  until?: number;
  align?: "top" | "center" | "bottom";
}

/** Full definition of a cinematic scene. */
export interface SceneConfig {
  id: string;
  sequence: SequenceConfig;
  overlays: OverlayConfig[];
  /** Pin length as a multiple of viewport height (default 2). */
  scrollLengthVh?: number;
  /** Text alternative describing the (decorative) footage. */
  ariaLabel: string;
  /**
   * Continues straight from the previous scene's last frame. The section tucks
   * under the previous one and only shows once that shot has finished, so the cut
   * between identical boundary frames is invisible.
   */
  chained?: boolean;
}
