import type { ComponentType } from "react";
import { AinalyticsPresenter } from "./AinalyticsPresenter";

/**
 * Coded presentations used instead of screenshots when a product cannot be shown
 * directly (login-only, live client data). Each renders demo data only.
 */
export const SHOWCASES = {
  "ainalytics-presenter": AinalyticsPresenter,
} satisfies Record<string, ComponentType>;

export type ShowcaseId = keyof typeof SHOWCASES;
export const SHOWCASE_IDS = Object.keys(SHOWCASES) as [ShowcaseId, ...ShowcaseId[]];
