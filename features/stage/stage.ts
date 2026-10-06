/**
 * What the monitor shows, as a pure reducer: the All work grid, one project in the
 * dashboard pane, or a panel (About, Contact). Every change is a command, the same
 * commands the assistant will send in Phase 2. Unknown slugs and panels are ignored
 * (the state is returned unchanged), so a bad command can never break the screen.
 */

export const PANELS = ["about", "contact"] as const;
export type Panel = (typeof PANELS)[number];

/** A place in the work: the grid of every project, or one project. */
export type Place = { kind: "grid" } | { kind: "project"; slug: string };

export type StageView = Place | { kind: "panel"; panel: Panel; back: Place };

export type StageCommand =
  | { type: "grid" }
  | { type: "show"; slug: string }
  | { type: "panel"; panel: Panel }
  | { type: "back" };

export interface StageWorld {
  /** Every project slug, in grid order. */
  order: string[];
}

export function initialStage(_world: StageWorld): StageView {
  return { kind: "grid" };
}

export function stageReducer(world: StageWorld) {
  const slugs = new Set(world.order);
  const panels = new Set<string>(PANELS);
  const place = (state: StageView): Place => (state.kind === "panel" ? state.back : state);

  return (state: StageView, command: StageCommand): StageView => {
    switch (command.type) {
      case "grid":
        return state.kind === "grid" ? state : { kind: "grid" };
      case "show":
        return slugs.has(command.slug) ? { kind: "project", slug: command.slug } : state;
      case "panel":
        return panels.has(command.panel) ? { kind: "panel", panel: command.panel, back: place(state) } : state;
      case "back":
        return state.kind === "panel" ? state.back : state;
    }
  };
}
