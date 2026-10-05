import type { ProjectInput } from "../schema";

const SRC = "work-a.md §2";

export default {
  slug: "project-facegate",
  title: "Project Facegate",
  tier: "classified",
  chapter: "classified",
  logline:
    "Face verification and liveness R&D for attendance kiosks: real embeddings and challenge-response, with no LLM in the decision.",
  industry: "Biometric security",
  year: 2026,
  status: "r-and-d",
  role: "Engineer — computer vision and security design",
  stack: ["TypeScript", "React", "Vite", "MediaPipe", "ONNX Runtime", "SCRFD", "AuraFace-v1", "Node.js"],
  screen: { poster: "/media/projects/project-facegate/screen.webp", loop: "/media/projects/project-facegate/loop.mp4" },
  showcase: "liveness-bench",
  redacted: true,
  features: [
    "Challenge-response liveness: blink twice, turn left or turn right",
    "Five-point alignment to a 112×112 template and 512-dimension embeddings",
    "Deterministic recognition: the same crop always yields the same embedding",
    "Embeddings versioned by model, quantisation and runtime",
    "Licence-clean model selection, checked against training-data provenance",
    "Liveness bench that logs each trial as a live face or a photo, so pass rates are measured",
    "Face detection with keypoints and cosine scoring against several templates",
    "Checksum-pinned model download and a latency, memory and determinism benchmark",
  ],
  beats: [
    {
      kind: "context",
      heading: "A printed photo passed",
      body: [
        "The incumbent face check on an attendance kiosk asked a general-purpose LLM whether two photos matched. It accepted printed photos held up to the camera, and the screen reported a liveness result it had never computed. Clocking in for a colleague took one printout.",
        "This R&D replaces the guess with a deterministic pipeline: detect the face with five keypoints, align it to a 112×112 template, compute a 512-dimension embedding and compare by cosine similarity. A browser liveness bench issues random challenges — blink twice, turn left, turn right — and logs every trial, so pass rates are measured rather than assumed.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "The server decides",
      body: [
        "The same crop run 20 times produces a byte-identical embedding, and thread count was shown not to change the output. Embeddings are tagged by model, quantisation and runtime so they are never compared across backends.",
        "Model selection was a licence audit: weights trained on datasets unfit for commercial use were rejected. The client never sees a score, because scores can be used to rebuild a template; the server decides and logs every attempt. Measured latency and bundle size made 8-bit quantisation a prerequisite for deployment.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "512",
      label: "embedding dimensions",
      source: `recognition model output, documented and confirmed by running the model (${SRC}F)`,
    },
    {
      value: "94 + 10",
      label: "unit + integration test cases",
      source: `it/test call sites in 9 unit files and 1 integration file using real weights (${SRC}F)`,
    },
    {
      value: "10",
      label: "pure logic modules",
      source: `find of embed (7), liveness (2) and face (1) modules (${SRC}F)`,
    },
  ],
  links: [],
  order: 2,
} satisfies ProjectInput;
