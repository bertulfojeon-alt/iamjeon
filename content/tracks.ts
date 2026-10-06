/**
 * Business tracks — how the work is grouped for clients (by the problem it solves,
 * not by technology). Kept free of project data so client components can import it.
 */

export const TRACKS = ["calls", "trading", "admin", "other"] as const;
export type Track = (typeof TRACKS)[number];

export const TRACK_TITLES: Record<Track, string> = {
  calls: "Calls & messages",
  trading: "Trading",
  admin: "Admin & back-office",
  other: "More work",
};

/** One line under each group in the explore menu. */
export const TRACK_LINES: Record<Track, string> = {
  calls: "Every call, chat and email answered, day and night.",
  trading: "Desks, academies and tools for traders and their coaches.",
  admin: "Payroll, attendance and books. Client work under NDA.",
  other: "Products and tools built along the way.",
};

/** The dashboard's side-nav groups: the tracks, then side projects. */
export type Group = Track | "side";
export const GROUP_ORDER: Group[] = ["calls", "trading", "admin", "other", "side"];
export const GROUP_TITLES: Record<Group, string> = { ...TRACK_TITLES, side: "Side projects" };
