/**
 * Project content schema.
 *
 * Every project on the site is one typed object validated against this schema at
 * build time. Two rules are enforced here rather than by convention:
 *  - every number shown carries a `source` (what was counted, and where), so a
 *    marketing figure with nothing behind it cannot ship;
 *  - classified projects cannot carry links, a client name or an un-redacted flag.
 */

import { z } from "zod";

export const TIERS = ["flagship", "commission", "classified", "archive"] as const;
export const CHAPTERS = ["trading", "voice", "saas", "classified", "archive"] as const;
export const STATUSES = [
  "live",
  "pre-release",
  "built",
  "in-development",
  "r-and-d",
  "local",
] as const;

const media = z.object({
  type: z.enum(["image", "video"]),
  /** Path under /public, e.g. "/media/projects/tg-auto-trader/slide-01.png". */
  src: z.string().startsWith("/"),
  /** Poster frame for videos (required for video so the page never shows a blank box). */
  poster: z.string().startsWith("/").optional(),
  alt: z.string().min(8),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().optional(),
});

const metric = z.object({
  value: z.string().min(1),
  label: z.string().min(2),
  /** Where the number comes from: what was counted and where. Never rendered. */
  source: z.string().min(12),
});

const link = z.object({
  label: z.string().min(2),
  href: z.url(),
  kind: z.enum(["live", "source", "download", "waitlist", "demo"]),
});

const beat = z.object({
  kind: z.enum(["context", "rising", "decision", "resolution"]),
  heading: z.string().min(3),
  /** Short paragraphs separated by blank lines. Plain text, no HTML. */
  body: z.string().min(40),
  media: z.array(media).optional(),
});

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(2),
    tier: z.enum(TIERS),
    chapter: z.enum(CHAPTERS),
    /** One sentence shown on the monitor wall and in the archive. */
    logline: z.string().min(12).max(140),
    industry: z.string().min(3),
    year: z.number().int().min(2015).max(2030),
    status: z.enum(STATUSES),
    role: z.string().min(3),
    /** Who it was built for, when that may be said publicly. */
    client: z.string().optional(),
    stack: z.array(z.string()).min(1),
    /** What appears on the monitor wall screen. */
    screen: z.object({
      poster: z.string().startsWith("/"),
      loop: z.string().startsWith("/").optional(),
    }),
    /** The opening shot of the case study. */
    coldOpen: media.optional(),
    /** A coded, demo-data presentation shown instead of the cold open (components/showcase). */
    showcase: z.enum(["ainalytics-presenter"]).optional(),
    features: z.array(z.string().min(6)).default([]),
    beats: z.array(beat).default([]),
    metrics: z.array(metric).default([]),
    links: z.array(link).default([]),
    /** Classified projects render with redaction bars and no identifying detail. */
    redacted: z.boolean().default(false),
    /** Ordering within its chapter (lower first). */
    order: z.number().int().default(100),
  })
  .superRefine((p, ctx) => {
    if (p.tier === "classified") {
      if (!p.redacted) ctx.addIssue({ code: "custom", message: `${p.slug}: classified projects must be redacted` });
      if (p.links.length) ctx.addIssue({ code: "custom", message: `${p.slug}: classified projects cannot have links` });
      if (p.client) ctx.addIssue({ code: "custom", message: `${p.slug}: classified projects cannot name a client` });
      if (p.chapter !== "classified") ctx.addIssue({ code: "custom", message: `${p.slug}: classified tier must use the classified chapter` });
    }
    if (p.tier !== "classified" && p.redacted) {
      ctx.addIssue({ code: "custom", message: `${p.slug}: only classified projects may be redacted` });
    }
    if (p.tier === "flagship" && p.beats.length < 4) {
      ctx.addIssue({ code: "custom", message: `${p.slug}: flagship case studies need at least 4 beats` });
    }
    if (p.tier === "archive" && p.chapter !== "archive") {
      ctx.addIssue({ code: "custom", message: `${p.slug}: archive tier must use the archive chapter` });
    }
    for (const m of [p.coldOpen, ...p.beats.flatMap((b) => b.media ?? [])]) {
      if (m?.type === "video" && !m.poster) {
        ctx.addIssue({ code: "custom", message: `${p.slug}: video ${m.src} needs a poster` });
      }
    }
  });

export type Project = z.output<typeof projectSchema>;
export type ProjectInput = z.input<typeof projectSchema>;
export type Tier = (typeof TIERS)[number];
export type Chapter = (typeof CHAPTERS)[number];
