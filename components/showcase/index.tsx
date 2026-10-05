import type { ComponentType } from "react";
import { AinalyticsPresenter } from "./AinalyticsPresenter";
import { SupportCallDesk } from "./SupportCallDesk";
import { EZVibeTerminal } from "./EZVibeTerminal";
import { VoiceRouter } from "./VoiceRouter";
import { ContentPipeline } from "./ContentPipeline";
import { LivenessBench } from "./LivenessBench";

/**
 * Coded presentations used instead of screenshots when a product cannot be shown
 * directly (login-only, live client data). Each renders demo data only.
 */
export const SHOWCASES = {
  "ainalytics-presenter": AinalyticsPresenter,
  "support-call-desk": SupportCallDesk,
  "ezvibe-terminal": EZVibeTerminal,
  "voice-router": VoiceRouter,
  "content-pipeline": ContentPipeline,
  "liveness-bench": LivenessBench,
} satisfies Record<string, ComponentType>;

export type ShowcaseId = keyof typeof SHOWCASES;
export const SHOWCASE_IDS = Object.keys(SHOWCASES) as [ShowcaseId, ...ShowcaseId[]];
