/**
 * What the monitor shows, as a pure reducer: one project in the dashboard pane, or
 * a panel (About, Contact). Every change is a command — the same commands the
 * assistant will send in Phase 2. Unknown slugs and panels are ignored (the state
 * is returned unchanged), so a bad command can never break the screen.
 */

export const PANELS = ["about", "contact"] as const;
export type Panel = (typeof PANELS)[number];

export type StageView = { kind: "project"; slug: string } | { kind: "panel"; panel: Panel; back: string };

export type StageCommand = { type: "show"; slug: string } | { type: "panel"; panel: Panel } | { type: "back" };

export interface StageWorld {
  /** Every project slug, in side-nav order. */
  order: string[];
}

export function initialStage(world: StageWorld): StageView {
  return { kind: "project", slug: world.order[0] };
}

export function stageReducer(world: StageWorld) {
  const slugs = new Set(world.order);
  const panels = new Set<string>(PANELS);
  const current = (state: StageView) => (state.kind === "project" ? state.slug : state.back);

  return (state: StageView, command: StageCommand): StageView => {
    switch (command.type) {
      case "show":
        return slugs.has(command.slug) ? { kind: "project", slug: command.slug } : state;
      case "panel":
        return panels.has(command.panel) ? { kind: "panel", panel: command.panel, back: current(state) } : state;
      case "back":
        return state.kind === "panel" ? { kind: "project", slug: state.back } : state;
    }
  };
}
