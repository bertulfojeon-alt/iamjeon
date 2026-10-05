/** Shared view-transition name for a project's screen: the wall monitor and the case hero use the same one. */
export function screenTransitionName(slug: string) {
  return `screen-${slug}`;
}
