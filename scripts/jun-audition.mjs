/**
 * Voices one greeting in each candidate voice so the owner can pick Jun's voice.
 *
 *   npm run jun:audition       # needs GEMINI_API_KEY in .env.local
 *
 * Writes media-src/jun/audition/<Voice>.wav (gitignored). The free tier allows 10 TTS
 * requests a day, so it waits between requests, skips voices already written, and stops
 * cleanly at the daily limit; the next run continues where it stopped.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  /* no file: the key check below explains */
}
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("jun:audition: GEMINI_API_KEY is not set. Add it to .env.local (never commit it) and run again.");
  process.exit(1);
}

const MODEL = process.env.JUN_TTS_MODEL || "gemini-3.8-flash-tts";
const VOICES = ["Charon", "Iapetus", "Algieba", "Orus", "Schedar"];
const LINE =
  "Say it calmly and warmly, like a friendly expert: Hi, I'm Jun, Jeon's AI twin. I know all of his work. What kind of business are you in? I can show you what he could build for it.";
const out = path.join(root, "media-src", "jun", "audition");
mkdirSync(out, { recursive: true });

/** 24 kHz mono 16-bit PCM, as the TTS model returns it, wrapped in a WAV header. */
function wav(pcm) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(24000, 24);
  h.writeUInt32LE(48000, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let first = true;
for (const voice of VOICES) {
  const file = path.join(out, `${voice}.wav`);
  if (existsSync(file)) {
    console.log(`jun:audition: ${voice} already voiced`);
    continue;
  }
  if (!first) await wait(21_000); // free tier: 3 requests a minute
  first = false;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: LINE }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
    }),
  });
  if (res.status === 429) {
    console.log("jun:audition: the daily TTS limit is reached; run again tomorrow to continue.");
    break;
  }
  if (!res.ok) {
    console.error(`jun:audition: ${voice} failed (${res.status})`);
    continue;
  }
  const data = (await res.json()).candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
  if (!data) {
    console.error(`jun:audition: ${voice} returned no audio`);
    continue;
  }
  writeFileSync(file, wav(Buffer.from(data, "base64")));
  console.log(`jun:audition: ${voice} → ${path.relative(root, file)}`);
}
