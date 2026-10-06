/**
 * The welcome's location card: Jeon's time in Lapu-Lapu City and, when it differs,
 * the visitor's own time (from their browser), so the offshore point makes itself.
 */

export const HOME_TIME_ZONE = "Asia/Manila";

const format = (now: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone })
    .format(now)
    .replace(/ /g, " ");

export function clockLine(now: Date, visitorTimeZone?: string): { here: string; there: string | null } {
  const here = format(now, HOME_TIME_ZONE);
  if (!visitorTimeZone) return { here, there: null };
  try {
    const there = format(now, visitorTimeZone);
    return { here, there: there === here ? null : there };
  } catch {
    return { here, there: null };
  }
}
