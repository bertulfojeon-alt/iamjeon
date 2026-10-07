/**
 * Mints a single-use Gemini Live token so the visitor's browser can open its own
 * voice session with Jun. The key never leaves the server; the token locks the model,
 * voice, instruction and tools, and expires a minute after minting if unused (and a
 * minute after a full-length call that started at the last moment). The browser connects with
 * exactly the config returned here.
 *
 * The only server code on the site. Abuse is bounded by the origin check, the token's
 * single use, the call cap and a Vercel WAF rate limit on this path.
 */

import { CALL_MINUTES } from "@/features/jun/limits";
import { buildInstruction } from "@/lib/jun/instruction";
import { FALLBACK_MODEL, LIVE_MODEL, buildLiveConfig, toBidiSetup } from "@/lib/jun/liveConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_URL = "https://generativelanguage.googleapis.com/v1alpha/auth_tokens";
const MODELS = { primary: LIVE_MODEL, fallback: FALLBACK_MODEL } as const;

const ALLOWED = [
  /^https:\/\/iamjeon\.vercel\.app$/,
  // This project's previews: per-deployment and per-branch hosts on the owner's team.
  /^https:\/\/iamjeon-[a-z0-9-]+-bertulfojeon-alts-projects\.vercel\.app$/,
];
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const LOCAL_HOST = /^(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * The live site and its previews; and this machine, when the server itself runs here
 * (`next dev`, or the production build under `next start`). A deployed server is never
 * reached at localhost, so a forged localhost origin does not pass there.
 */
function allowed(origin: string | null, host: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED.some((re) => re.test(origin))) return true;
  return LOCAL_ORIGIN.test(origin) && (process.env.NODE_ENV !== "production" || LOCAL_HOST.test(host ?? ""));
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

// Built once per server instance: the content it reads only changes with a deploy.
let instruction: string | null = null;

export async function POST(req: Request) {
  if (!allowed(req.headers.get("origin"), req.headers.get("host"))) return json({ error: "forbidden" }, 403);
  if (process.env.JUN_KILL === "1") return json({ error: "off" }, 503);

  const body = (await req.json().catch(() => null)) as { model?: unknown } | null;
  const which = body && typeof body === "object" ? body.model : undefined;
  if (which !== "primary" && which !== "fallback") return json({ error: "bad request" }, 400);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return json({ error: "unconfigured" }, 500);

  instruction ??= buildInstruction();
  const model = MODELS[which];
  const now = Date.now();
  let res: Response;
  try {
    res = await fetch(TOKEN_URL, {
      method: "POST",
      // Live and ephemeral tokens use the API-key header, not Bearer.
      headers: { "x-goog-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        uses: 1,
        expireTime: new Date(now + (CALL_MINUTES + 2) * 60_000).toISOString(),
        newSessionExpireTime: new Date(now + 60_000).toISOString(),
        bidiGenerateContentSetup: toBidiSetup(model, instruction),
      }),
    });
  } catch {
    return json({ error: "unavailable" }, 502);
  }

  // Google's body can name the project or quota; it never reaches the visitor.
  if (res.status === 429) return json({ error: "busy" }, 429);
  if (!res.ok) {
    console.error("jun token: upstream", res.status);
    return json({ error: "unavailable" }, 502);
  }
  const { name } = (await res.json().catch(() => ({}))) as { name?: string };
  if (!name) return json({ error: "unavailable" }, 502);

  return json({ token: name, model, config: buildLiveConfig(instruction) });
}
