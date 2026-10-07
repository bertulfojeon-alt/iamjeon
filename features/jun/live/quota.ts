/**
 * Whether a failure means "this model's quota is used up", the one failure that is
 * worth retrying on the fallback model. It shows up three ways: the token route's
 * 429, an error carrying Google's RESOURCE_EXHAUSTED, or the socket closing with a
 * quota reason.
 */

const QUOTA = /RESOURCE_EXHAUSTED|quota|exhausted|rate limit/i;

export function isQuotaError(x: unknown): boolean {
  if (!x || typeof x !== "object") return false;
  const o = x as { status?: unknown; message?: unknown; reason?: unknown };
  if (o.status === 429) return true;
  return [o.message, o.reason].some((v) => typeof v === "string" && QUOTA.test(v));
}
