/**
 * Jun's full-screen presentation, as a pure reducer like the stage's: open or closed,
 * and the slides shown so far (the newest is on screen). Jun's tool calls are checked
 * in tools.ts before they reach it; it still ignores a slide while closed and a second
 * start, so a stray command can never break the screen.
 */

import type { SlideKind } from "./knowledge";

export interface Slide {
  /** Unique within one presentation, so each slide re-enters rather than morphing. */
  key: number;
  slug: string | null;
  kind: SlideKind;
  feature?: string;
  /** For contact: Jun's note to Jeon. */
  summary?: string;
}

export type PresentationState = { open: false } | { open: true; slides: Slide[]; current: number };

export type PresentationCommand = { type: "start" } | { type: "show"; slide: Omit<Slide, "key"> } | { type: "end" };

export const CLOSED: PresentationState = { open: false };

export function presentationReducer(state: PresentationState, cmd: PresentationCommand): PresentationState {
  switch (cmd.type) {
    case "start":
      return state.open ? state : { open: true, slides: [], current: -1 };
    case "show": {
      if (!state.open) return state;
      const slides = [...state.slides, { ...cmd.slide, key: state.slides.length }];
      return { open: true, slides, current: slides.length - 1 };
    }
    case "end":
      return state.open ? CLOSED : state;
  }
}
