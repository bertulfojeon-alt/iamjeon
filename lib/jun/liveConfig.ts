/**
 * Jun's Gemini Live session settings, in the two shapes they must exist in: the SDK's
 * LiveConnectConfig (what the browser passes to ai.live.connect) and the REST wire
 * shape locked into the single-use token. Both are derived here from one definition,
 * because a token whose locked setup omits `tools` silently disables tool calling,
 * and the browser must connect with exactly what the token locked.
 */

import { GROUP_ORDER } from "@/content/tracks";
import { SLIDE_KINDS } from "@/features/jun/knowledge";

export const LIVE_MODEL = process.env.JUN_LIVE_MODEL || "gemini-3.8-live";
export const FALLBACK_MODEL = process.env.JUN_FALLBACK_MODEL || "gemini-2.5-flash-native-audio-preview-12-2025";
/** The owner picked Schedar (calm male) from the audition on 2026-10-07. */
export const VOICE = process.env.JUN_VOICE || "Schedar";

const str = (description: string, extra: Record<string, unknown> = {}) => ({ type: "STRING", description, ...extra });
const none = { type: "OBJECT", properties: {} };

const DECLARATIONS = [
  {
    name: "list_projects",
    description: "List Jeon's projects (slug, title, group, one line), optionally only one group.",
    parameters: { type: "OBJECT", properties: { group: str("Only this group.", { enum: [...GROUP_ORDER] }) } },
  },
  {
    name: "get_project",
    description:
      "Everything the site shows about one project: problem, outcome, features, spotlights, numbers, stack, story, links, and the slide kinds it can show. Call it before talking about a project in detail.",
    parameters: { type: "OBJECT", properties: { slug: str("The project's slug from the index.") }, required: ["slug"] },
  },
  {
    name: "start_presentation",
    description:
      "Offer the full-screen presentation: the visitor sees a button and opens it with a tap, or declines. You are told which. Call it once, when it would help or when they ask to see something; never again after a no. Do not call show_slide until you are told it is open.",
    parameters: none,
  },
  {
    name: "show_slide",
    description:
      "Put one slide on the presentation screen at the moment you start talking about it. kind must be one of the slides get_project listed for that project; about and contact take no slug; feature needs one of the project's spotlight features.",
    parameters: {
      type: "OBJECT",
      properties: {
        kind: str("The slide kind.", { enum: [...SLIDE_KINDS] }),
        slug: str("The project's slug (not for about or contact)."),
        feature: str("For kind feature: the spotlight's feature, exactly as get_project gave it."),
      },
      required: ["kind"],
    },
  },
  {
    name: "end_presentation",
    description: "Close the presentation as soon as the visitor asks to stop, go back or close it. The call continues.",
    parameters: none,
  },
  {
    name: "open_project",
    description: "Outside a presentation: open a project on Jeon's desk, as if the visitor clicked it.",
    parameters: { type: "OBJECT", properties: { slug: str("The project's slug.") }, required: ["slug"] },
  },
  {
    name: "open_contact",
    description:
      "Show Jeon's contact options with a short note for him in the visitor's own terms (their business, what they need, how soon). The visitor sees it and can edit it before sending.",
    parameters: {
      type: "OBJECT",
      properties: {
        summary: str("The note to Jeon, a few sentences, written as the visitor's request."),
        channel: str("The channel they prefer, if they said.", { enum: ["email", "whatsapp", "viber"] }),
      },
      required: ["summary"],
    },
  },
];

export function junTools() {
  return [{ functionDeclarations: DECLARATIONS }];
}

const speechConfig = () => ({ voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } });
const compression = () => ({ slidingWindow: {} });

/** SDK shape: the browser passes this straight to ai.live.connect({ model, config }). */
export function buildLiveConfig(instruction: string) {
  return {
    responseModalities: ["AUDIO"],
    systemInstruction: instruction,
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    tools: junTools(),
    speechConfig: speechConfig(),
    contextWindowCompression: compression(),
  };
}

/**
 * REST wire shape for POST v1alpha/auth_tokens (`bidiGenerateContentSetup`). It differs from
 * the SDK shape: modality and speech live under generationConfig, and the instruction is a
 * Content. No fieldMask: leaving it out is what locks every field.
 */
export function toBidiSetup(model: string, instruction: string) {
  return {
    model: `models/${model}`,
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: speechConfig() },
    systemInstruction: { parts: [{ text: instruction }] },
    tools: junTools(),
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    contextWindowCompression: compression(),
  };
}
