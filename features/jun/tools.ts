/**
 * Jun's tools, answered in the browser. Look-ups read the same public items the
 * dashboard renders; UI commands come back as an effect for the caller to apply
 * (the presentation reducer, the desk, or contact). Every call is checked first:
 * a bad call gets an error the model can act on, and no effect, so the screen
 * never changes on a mistake.
 */

import type { ScreenItem } from "@/components/screen/Screen";
import { GROUP_ORDER } from "@/content/tracks";
import { clampSummary } from "@/lib/contact";
import { SLIDE_KINDS, projectDetail, projectSlides, type SlideKind } from "./knowledge";
import type { PresentationCommand } from "./presentation";

export interface ToolContext {
  items: ScreenItem[];
  presenting: boolean;
}

export type Channel = "email" | "whatsapp" | "viber";

export type JunEffect =
  | { type: "present"; cmd: PresentationCommand }
  | { type: "show-project"; slug: string }
  | { type: "contact"; summary: string; channel?: Channel };

export interface ToolResult {
  response: Record<string, unknown>;
  effect?: JunEffect;
}

const fail = (error: string): ToolResult => ({ response: { error } });
const ok = (effect?: JunEffect, extra: Record<string, unknown> = {}): ToolResult => ({ response: { ok: true, ...extra }, effect });
const CHANNELS: readonly string[] = ["email", "whatsapp", "viber"];

export function runTool(name: string, args: Record<string, unknown>, ctx: ToolContext): ToolResult {
  const bySlug = new Map(ctx.items.map((i) => [i.slug, i]));
  const find = (slug: unknown) => (typeof slug === "string" ? bySlug.get(slug) : undefined);
  const unknown = (slug: unknown) => fail(`No project "${String(slug)}". Use a slug from the project index.`);

  switch (name) {
    case "list_projects": {
      const group = args.group;
      if (group !== undefined && !(GROUP_ORDER as readonly unknown[]).includes(group)) return fail(`Unknown group. Use one of: ${GROUP_ORDER.join(", ")}.`);
      const projects = ctx.items
        .filter((i) => group === undefined || i.group === group)
        .map((i) => ({ slug: i.slug, title: i.title, group: i.group, summary: i.summary, classified: i.classified }));
      return { response: { projects } };
    }

    case "get_project": {
      const item = find(args.slug);
      return item ? { response: { project: projectDetail(item) } } : unknown(args.slug);
    }

    case "start_presentation":
      return ctx.presenting ? ok(undefined, { note: "The presentation is already open." }) : ok({ type: "present", cmd: { type: "start" } });

    case "end_presentation":
      return ctx.presenting ? ok({ type: "present", cmd: { type: "end" } }) : ok(undefined, { note: "No presentation is open." });

    case "show_slide": {
      if (!ctx.presenting) return fail("The presentation is not open. Offer it, and call start_presentation once the visitor agrees.");
      const kind = args.kind;
      if (typeof kind !== "string" || !(SLIDE_KINDS as readonly string[]).includes(kind)) return fail(`Unknown slide kind. Use one of: ${SLIDE_KINDS.join(", ")}.`);
      if (kind === "about") return ok({ type: "present", cmd: { type: "show", slide: { slug: null, kind } } });
      if (kind === "contact") return fail("For contact, call open_contact with a note to Jeon.");
      const item = find(args.slug);
      if (!item) return unknown(args.slug);
      if (!projectSlides(item).includes(kind as SlideKind)) return fail(`${item.title} has no ${kind} slide. It can show: ${projectSlides(item).join(", ")}.`);
      if (kind === "feature") {
        const spot = item.spotlights.find((s) => s.feature === args.feature);
        if (!spot) return fail(`Pass one of ${item.title}'s spotlight features exactly: ${item.spotlights.map((s) => s.feature).join(" | ")}.`);
        return ok({ type: "present", cmd: { type: "show", slide: { slug: item.slug, kind, feature: spot.feature } } });
      }
      return ok({ type: "present", cmd: { type: "show", slide: { slug: item.slug, kind: kind as SlideKind } } });
    }

    case "open_project": {
      const item = find(args.slug);
      return item ? ok({ type: "show-project", slug: item.slug }) : unknown(args.slug);
    }

    case "open_contact": {
      const summary = clampSummary(typeof args.summary === "string" ? args.summary : "");
      if (!summary) return fail("Write a short note to Jeon in the visitor's terms as summary.");
      if (ctx.presenting) return ok({ type: "present", cmd: { type: "show", slide: { slug: null, kind: "contact", summary } } });
      const channel = typeof args.channel === "string" && CHANNELS.includes(args.channel) ? (args.channel as Channel) : undefined;
      return ok(channel ? { type: "contact", summary, channel } : { type: "contact", summary });
    }

    default:
      return fail(`There is no tool called ${name}.`);
  }
}
