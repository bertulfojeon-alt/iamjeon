/**
 * What the monitor shows, as a pure reducer. The explore menu, the project scenes
 * and the panels all render from this state, and every change is a command — the
 * same commands the assistant will send in Phase 2. Unknown slugs are ignored
 * (the state is returned unchanged), so a bad command can never break the screen.
 */

import type { Track } from "@/content/tracks";

export type Panel = "about" | "side" | "contact";

export type StageView =
  | { kind: "explore"; focus: string }
  | { kind: "scene"; slug: string }
  | { kind: "panel"; panel: Panel };

export type StageCommand =
  | { type: "explore"; focus?: string }
  | { type: "focus"; slug: string }
  | { type: "show"; slug: string }
  | { type: "next" }
  | { type: "panel"; panel: Panel };

export interface StageWorld {
  /** Every case-study slug, grouped by track in screen order. */
  order: string[];
  trackOf: Record<string, Track>;
}

export function initialStage(world: StageWorld): StageView {
  return { kind: "explore", focus: world.order[0] };
}

export function stageReducer(world: StageWorld) {
  const known = (slug: string | undefined): slug is string => !!slug && slug in world.trackOf;

  return (state: StageView, command: StageCommand): StageView => {
    switch (command.type) {
      case "focus":
        return known(command.slug) ? { kind: "explore", focus: command.slug } : state;
      case "show":
        return known(command.slug) ? { kind: "scene", slug: command.slug } : state;
      case "next": {
        if (state.kind !== "scene") return state;
        const track = world.trackOf[state.slug];
        const same = world.order.filter((s) => world.trackOf[s] === track);
        if (same.length < 2) return state;
        return { kind: "scene", slug: same[(same.indexOf(state.slug) + 1) % same.length] };
      }
      case "explore": {
        const focus = known(command.focus) ? command.focus : state.kind === "scene" ? state.slug : world.order[0];
        return { kind: "explore", focus };
      }
      case "panel":
        return { kind: "panel", panel: command.panel };
    }
  };
}
