/**
 * One spoken call with Jun. The browser holds its own WebSocket to Gemini Live,
 * authorised by a single-use token from /api/jun/token; audio never passes through
 * the site. Tool calls are answered here, through onTool, in the same turn.
 *
 * Order matters: the playback context is created inside the tap (iOS unlocks audio
 * only there), the microphone is asked for before the token (a permission prompt
 * would eat the token's one-minute window), and a quota refusal on the primary model
 * gets one retry on the fallback model.
 */

import { INPUT_SAMPLE_RATE, OUTPUT_SAMPLE_RATE, base64ToBytes, bufferToBase64, pcm16ToFloat32 } from "./audio";
import { isQuotaError } from "./quota";

export type JunStatus = "connecting" | "listening" | "speaking" | "ended" | "capped";
export type JunFailure = "denied" | "missing" | "insecure" | "busy" | "off" | "unavailable";

export interface JunCallbacks {
  onStatus: (status: JunStatus) => void;
  /** Jun's words so far in the current turn (from the output transcription). */
  onSubtitle: (text: string) => void;
  onTool: (name: string, args: Record<string, unknown>) => Record<string, unknown>;
  onFailure: (kind: JunFailure) => void;
}

export const CALL_LIMIT_MS = 5 * 60_000;
export const WRAP_UP_MS = 4.5 * 60_000;
const SETUP_TIMEOUT_MS = 10_000;
const WRAP_UP = "(About thirty seconds of the call are left. Wrap up in one or two sentences and offer to pass a note to Jeon.)";

class Failure extends Error {
  constructor(readonly kind: JunFailure, readonly quota = false) {
    super(kind);
  }
}

type LiveSession = {
  sendRealtimeInput: (input: unknown) => void;
  sendToolResponse: (response: unknown) => void;
  sendClientContent: (content: unknown) => void;
  close: () => void;
};

export class JunSession {
  private session: LiveSession | null = null;
  private mic: MediaStream | null = null;
  private inCtx: AudioContext | null = null;
  private outCtx: AudioContext | null = null;
  private worklet: AudioWorkletNode | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private nextStart = 0;
  private timers: number[] = [];
  private subtitle = "";
  private stopped = false;
  private heard = false; // the server answered at least once on this connection

  constructor(private cb: JunCallbacks) {}

  /** Call from the tap that starts the call. Resolves once the call is live (or has failed). */
  async start(): Promise<void> {
    this.outCtx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
    void this.outCtx.resume();
    this.cb.onStatus("connecting");
    try {
      await this.openMic();
      try {
        await this.connect("primary");
      } catch (e) {
        if (!(e instanceof Failure && e.quota) || this.stopped) throw e;
        await this.connect("fallback");
      }
    } catch (e) {
      if (this.stopped) return;
      this.teardown();
      this.cb.onFailure(e instanceof Failure ? e.kind : "unavailable");
      return;
    }
    if (this.stopped) return;
    this.cb.onStatus("listening");
    this.pumpMic();
    this.timers.push(
      window.setTimeout(() => this.session?.sendClientContent({ turns: [{ role: "user", parts: [{ text: WRAP_UP }] }], turnComplete: true }), WRAP_UP_MS),
      window.setTimeout(() => this.end("capped"), CALL_LIMIT_MS),
    );
    // Jun speaks first, so the visitor hears the call is live.
    this.session?.sendClientContent({ turns: [{ role: "user", parts: [{ text: "(The visitor started the call.)" }] }], turnComplete: true });
  }

  setMuted(muted: boolean): void {
    // Disabling the track is what stops audio leaving the device.
    for (const track of this.mic?.getAudioTracks() ?? []) track.enabled = !muted;
  }

  stop(): void {
    this.end("ended");
  }

  private end(status: "ended" | "capped"): void {
    if (this.stopped) return;
    this.stopped = true;
    try {
      this.session?.close();
    } catch {
      /* already closed */
    }
    this.session = null;
    this.teardown();
    this.cb.onStatus(status);
  }

  // ── Microphone ──

  private async openMic(): Promise<void> {
    if (!globalThis.isSecureContext) throw new Failure("insecure");
    if (!navigator.mediaDevices?.getUserMedia) throw new Failure("missing");
    try {
      this.mic = await navigator.mediaDevices.getUserMedia({
        // Jun's own voice plays while the mic is open; without these it hears itself.
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    } catch (e) {
      const name = (e as DOMException)?.name;
      throw new Failure(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "missing");
    }
    this.inCtx = new AudioContext();
    await this.inCtx.audioWorklet.addModule("/jun-recorder-worklet.js");
  }

  private pumpMic(): void {
    if (!this.inCtx || !this.mic) return;
    const source = this.inCtx.createMediaStreamSource(this.mic);
    this.worklet = new AudioWorkletNode(this.inCtx, "jun-recorder");
    this.worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      if (this.stopped || !this.session) return;
      this.session.sendRealtimeInput({ audio: { data: bufferToBase64(e.data), mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}` } });
    };
    source.connect(this.worklet);
    // A worklet only runs while something pulls from it; a silent gain keeps the mic off the speakers.
    const silence = this.inCtx.createGain();
    silence.gain.value = 0;
    this.worklet.connect(silence).connect(this.inCtx.destination);
  }

  // ── Connection ──

  private async connect(which: "primary" | "fallback"): Promise<void> {
    let res: Response;
    try {
      res = await fetch("/api/jun/token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: which }) });
    } catch {
      throw new Failure("unavailable");
    }
    if (res.status === 429) throw new Failure("busy", true);
    if (res.status === 503) throw new Failure("off");
    if (!res.ok) throw new Failure("unavailable");
    const { token, model, config } = (await res.json()) as { token: string; model: string; config: Record<string, unknown> };

    // Loaded on demand: the SDK is large and most visits never start a call.
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: "v1alpha" } });
    this.heard = false;

    // A quota refusal arrives as the socket closing before the first server message.
    let refuse: (f: Failure) => void = () => {};
    const refused = new Promise<never>((_, reject) => (refuse = reject));
    const opened = ai.live
      .connect({
        model,
        // Exactly what the token locked; anything else silently disables tool calling.
        config,
        callbacks: {
          onmessage: (m: unknown) => {
            this.heard = true;
            this.onMessage(m as Record<string, any>);
          },
          onerror: () => {},
          onclose: (e: CloseEvent) => {
            if (this.stopped) return;
            if (!this.heard) return refuse(new Failure(isQuotaError(e) ? "busy" : "unavailable", isQuotaError(e)));
            this.end("ended");
          },
        },
      })
      .catch((e: unknown) => {
        throw new Failure(isQuotaError(e) ? "busy" : "unavailable", isQuotaError(e));
      });
    this.session = (await Promise.race([opened, refused])) as unknown as LiveSession;
    // Wait for the server's first word (setupComplete): a refusal closes the socket before
    // it, and a server that never answers is given up on after SETUP_TIMEOUT_MS.
    const started = Date.now();
    await Promise.race([
      refused,
      new Promise<void>((resolve, reject) => {
        const check = () => {
          if (this.heard || this.stopped) return resolve();
          if (Date.now() - started > SETUP_TIMEOUT_MS) return reject(new Failure("unavailable"));
          window.setTimeout(check, 50);
        };
        check();
      }),
    ]);
  }

  // ── Incoming ──

  private onMessage(message: Record<string, any>): void {
    const content = message?.serverContent;
    // The visitor talked over Jun: stop speaking at once.
    if (content?.interrupted) this.stopPlayback();
    const said = content?.outputTranscription?.text;
    if (said) {
      this.subtitle += said;
      this.cb.onSubtitle(this.subtitle.trim());
    }
    for (const part of content?.modelTurn?.parts ?? []) if (part?.inlineData?.data) this.play(part.inlineData.data);
    if (content?.turnComplete) this.subtitle = "";
    const calls = message?.toolCall?.functionCalls as { id?: string; name?: string; args?: Record<string, unknown> }[] | undefined;
    if (calls?.length) {
      const functionResponses = calls.map((c) => ({ id: c.id, name: c.name, response: this.cb.onTool(c.name ?? "", c.args ?? {}) }));
      if (!this.stopped) this.session?.sendToolResponse({ functionResponses });
    }
  }

  // ── Playback ──

  private play(base64: string): void {
    const ctx = this.outCtx;
    if (this.stopped || !ctx) return;
    const samples = pcm16ToFloat32(base64ToBytes(base64));
    if (!samples.length) return;
    const buffer = ctx.createBuffer(1, samples.length, OUTPUT_SAMPLE_RATE);
    buffer.getChannelData(0).set(samples);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    // Chunks arrive faster than they play: queue them end to end.
    this.nextStart = Math.max(this.nextStart, ctx.currentTime);
    source.start(this.nextStart);
    this.nextStart += buffer.duration;
    this.sources.add(source);
    this.cb.onStatus("speaking");
    source.onended = () => {
      this.sources.delete(source);
      if (!this.sources.size && !this.stopped) this.cb.onStatus("listening");
    };
  }

  private stopPlayback(): void {
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources.clear();
    this.nextStart = 0;
    if (!this.stopped) this.cb.onStatus("listening");
  }

  private teardown(): void {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
    this.stopPlayback();
    try {
      this.worklet?.port.close();
      this.worklet?.disconnect();
    } catch {
      /* already gone */
    }
    this.worklet = null;
    for (const track of this.mic?.getTracks() ?? []) track.stop();
    this.mic = null;
    void this.inCtx?.close().catch(() => {});
    void this.outCtx?.close().catch(() => {});
    this.inCtx = null;
    this.outCtx = null;
  }
}
