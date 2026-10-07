import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const call = async (body: unknown, origin = "https://iamjeon.vercel.app", host = "iamjeon.vercel.app") => {
  const { POST } = await import("./route");
  return POST(new Request(`https://${host}/api/jun/token`, { method: "POST", headers: { origin, host, "content-type": "application/json" }, body: JSON.stringify(body) }));
};

describe("POST /api/jun/token", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("JUN_KILL", "");
    fetchMock = vi.fn(async () => new Response(JSON.stringify({ name: "auth_tokens/abc" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("mints a single-use token that locks the setup", async () => {
    const res = await call({ model: "primary" });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.token).toBe("auth_tokens/abc");
    expect(json.model).toBe("gemini-3.8-live");
    expect(json.config.tools[0].functionDeclarations.length).toBe(7);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1alpha/auth_tokens");
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
    const sent = JSON.parse(init.body);
    expect(sent.uses).toBe(1);
    expect(sent.bidiGenerateContentSetup.model).toBe("models/gemini-3.8-live");
    expect(sent.fieldMask).toBeUndefined();
    const gap = Date.parse(sent.expireTime) - Date.parse(sent.newSessionExpireTime);
    expect(gap).toBeGreaterThan(4.5 * 60_000);
    expect(gap).toBeLessThan(5.5 * 60_000);
  });

  it("uses the fallback model on request", async () => {
    const json = await (await call({ model: "fallback" })).json();
    expect(json.model).toBe("gemini-2.5-flash-native-audio-preview-12-2025");
  });

  it("refuses an unknown model", async () => {
    expect((await call({ model: "gemini-ultra" })).status).toBe(400);
    expect((await call("nonsense")).status).toBe(400);
  });

  it("refuses other sites", async () => {
    expect((await call({ model: "primary" }, "https://evil.example")).status).toBe(403);
    expect((await call({ model: "primary" }, "https://iamjeon-git-x-someoneelse.vercel.app")).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts this project's preview hosts", async () => {
    expect((await call({ model: "primary" }, "https://iamjeon-git-night-shift-bertulfojeon-alts-projects.vercel.app")).status).toBe(200);
    expect((await call({ model: "primary" }, "https://iamjeon-k2j3h4-bertulfojeon-alts-projects.vercel.app")).status).toBe(200);
  });

  it("lets the production build run on this machine (next start on localhost)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await call({ model: "primary" }, "http://localhost:3737", "localhost:3737")).status).toBe(200);
  });

  it("never accepts a localhost origin on a deployed host", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await call({ model: "primary" }, "http://localhost:3737", "iamjeon.vercel.app")).status).toBe(403);
  });

  it("is off when the kill switch is set", async () => {
    vi.stubEnv("JUN_KILL", "1");
    const res = await call({ model: "primary" });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "off" });
  });

  it("says unconfigured without a key", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    expect((await call({ model: "primary" })).status).toBe(500);
  });

  it("maps upstream errors without passing Google's body through", async () => {
    fetchMock.mockResolvedValueOnce(new Response("quota exceeded for project 123 SECRET", { status: 429 }));
    const busy = await call({ model: "primary" });
    expect(busy.status).toBe(429);
    expect(await busy.text()).not.toContain("SECRET");
    fetchMock.mockResolvedValueOnce(new Response("internal SECRET", { status: 500 }));
    const down = await call({ model: "primary" });
    expect(down.status).toBe(502);
    expect(await down.text()).not.toContain("SECRET");
  });
});
