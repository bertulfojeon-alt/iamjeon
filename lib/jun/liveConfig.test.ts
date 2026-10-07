import { describe, expect, it } from "vitest";
import { FALLBACK_MODEL, LIVE_MODEL, VOICE, buildLiveConfig, junTools, toBidiSetup } from "./liveConfig";

const names = (tools: ReturnType<typeof junTools>) => tools[0].functionDeclarations.map((d) => d.name).sort();

describe("Jun's live config", () => {
  it("declares the seven tools from the spec", () => {
    expect(names(junTools())).toEqual(
      ["end_presentation", "get_project", "list_projects", "open_contact", "open_project", "show_slide", "start_presentation"].sort(),
    );
  });

  it("has defaults for the models and the voice", () => {
    expect(LIVE_MODEL).toBe("gemini-3.8-live");
    expect(FALLBACK_MODEL).toBe("gemini-2.5-flash-native-audio-preview-12-2025");
    expect(VOICE).toBe("Schedar");
  });

  it("gives the browser and the token the same voice, instruction and tools", () => {
    const sdk = buildLiveConfig("INSTR");
    const wire = toBidiSetup(LIVE_MODEL, "INSTR");
    expect(sdk.systemInstruction).toBe("INSTR");
    expect(wire.systemInstruction).toEqual({ parts: [{ text: "INSTR" }] });
    expect(sdk.speechConfig).toEqual(wire.generationConfig.speechConfig);
    expect(sdk.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe(VOICE);
    expect(sdk.responseModalities).toEqual(wire.generationConfig.responseModalities);
    expect(names(sdk.tools)).toEqual(names(wire.tools));
    expect(sdk.contextWindowCompression).toEqual(wire.contextWindowCompression);
    expect(sdk.inputAudioTranscription).toEqual({});
    expect(wire.outputAudioTranscription).toEqual({});
  });

  it("locks every field: the wire shape names the model and carries no fieldMask", () => {
    const wire = toBidiSetup(FALLBACK_MODEL, "x");
    expect(wire.model).toBe(`models/${FALLBACK_MODEL}`);
    expect(JSON.stringify(wire)).not.toContain("fieldMask");
  });
});
