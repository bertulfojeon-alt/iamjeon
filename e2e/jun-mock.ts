/**
 * Test doubles for Jun: a microphone that needs no device, and a stand-in for the
 * Gemini Live service (the token route plus the WebSocket), so the whole call can be
 * driven from a test without cost: transcripts, tool calls and the socket closing.
 */

import type { Page, WebSocketRoute } from "@playwright/test";

/** Replaces getUserMedia: a silent tone stream ("ok"), or the two refusals. */
export async function stubMic(page: Page, mode: "ok" | "denied" | "missing") {
  await page.addInitScript((m) => {
    const w = window as unknown as { __junTracks: MediaStreamTrack[] };
    w.__junTracks = [];
    const md = navigator.mediaDevices ?? ({} as MediaDevices);
    Object.defineProperty(navigator, "mediaDevices", { value: md, configurable: true });
    md.getUserMedia = async () => {
      if (m === "denied") throw new DOMException("blocked", "NotAllowedError");
      if (m === "missing") throw new DOMException("none", "NotFoundError");
      const ctx = new AudioContext();
      const dest = ctx.createMediaStreamDestination();
      const osc = ctx.createOscillator();
      osc.connect(dest);
      osc.start();
      w.__junTracks.push(...dest.stream.getTracks());
      return dest.stream;
    };
  }, mode);
}

export interface LiveMock {
  /** Bodies of every token request, in order ({ model }). */
  tokenRequests: { model: string }[];
  /** Every toolResponse the page sent back. */
  toolResponses: { name: string; response: Record<string, unknown> }[];
  /** Sends one server message to the open socket. */
  send: (message: unknown) => void;
  /** Closes the socket from the server side. */
  close: (code: number, reason: string) => void;
  /** Says a line, as the output transcription. */
  say: (text: string) => void;
  /** Calls one tool. */
  call: (name: string, args?: Record<string, unknown>) => void;
}

/**
 * Stands in for /api/jun/token and the Live socket. `refuse` closes the first N
 * connections before setup with a quota reason (to exercise the fallback).
 */
export async function mockLive(page: Page, { refuse = 0 }: { refuse?: number } = {}): Promise<LiveMock> {
  let socket: WebSocketRoute | null = null;
  let id = 0;
  let refused = 0;
  const mock: LiveMock = {
    tokenRequests: [],
    toolResponses: [],
    send: (message) => socket?.send(JSON.stringify(message)),
    close: (code, reason) => socket?.close({ code, reason }),
    say: (text) => mock.send({ serverContent: { outputTranscription: { text } } }),
    call: (name, args = {}) => mock.send({ toolCall: { functionCalls: [{ id: `call-${++id}`, name, args }] } }),
  };

  await page.route("**/api/jun/token", async (route) => {
    const body = JSON.parse(route.request().postData() ?? "{}");
    mock.tokenRequests.push(body);
    await route.fulfill({ json: { token: "auth_tokens/mock", model: `mock-${body.model}`, config: { responseModalities: ["AUDIO"] } } });
  });

  await page.routeWebSocket(/BidiGenerateContentConstrained/, (ws) => {
    ws.onMessage((raw) => {
      const msg = JSON.parse(String(raw));
      if (msg.setup) {
        if (refused < refuse) {
          refused++;
          ws.close({ code: 1011, reason: "RESOURCE_EXHAUSTED: quota" });
          return;
        }
        socket = ws;
        ws.send(JSON.stringify({ setupComplete: {} }));
      }
      for (const r of msg.toolResponse?.functionResponses ?? []) mock.toolResponses.push({ name: r.name, response: r.response });
    });
  });
  return mock;
}
