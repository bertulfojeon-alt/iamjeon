import type { ProjectInput } from "../schema";

const SRC = "F:\\AI Support";

export default {
  slug: "247aisupports",
  title: "247Aisupports",
  tier: "flagship",
  chapter: "voice",
  logline:
    "A white-label AI receptionist for Philippine businesses: it answers calls, chat and email from each client's own documents.",
  industry: "Customer support SaaS",
  year: 2026,
  status: "live",
  role: "Solo — design, engineering, deployment",
  stack: [
    "Node.js",
    "Express",
    "SQLite",
    "WebSockets",
    "AudioWorklet",
    "Realtime speech-to-speech AI",
    "Embeddings + retrieval",
    "Vanilla JS",
    "Cloudflare",
    "Turnstile",
  ],
  screen: { poster: "/media/projects/247aisupports/screen.webp", loop: "/media/projects/247aisupports/loop.mp4" },
  showcase: "support-call-desk",
  pitch: {
    track: "calls",
    problem: "Calls, chats and emails come in after hours and on weekends, and every unanswered one is a customer who goes somewhere else.",
    outcome: "An AI receptionist answers every call, chat and email from the business's own documents, and hands over to staff when a person is needed.",
  },
  features: [
    "Real-time voice agent in the browser, relayed by the server so no AI key reaches the client",
    "Chat widget, AI-drafted email replies and messaging from one shared agent core",
    "Answers from each business's own documents: PDF and text upload, embeddings, per-tenant retrieval",
    "Try-it demo: talk to the agent about your own content, held in memory and never stored",
    "Per-tenant call queue with a visible position; calls already in progress are never cut",
    "Dead-air ladder and a three-step close that a new question can reopen",
    "Shop tools: product search, proof-gated order lookup, requests and handoff to a human",
    "Messenger, Instagram, WhatsApp and Viber webhooks, tested with signed simulated traffic",
    "Shared inbox where staff take over a thread and hand it back to the AI",
    "Connectors for Shopify, WooCommerce, HubSpot, Notion, Airtable and Google Calendar",
    "Origin-bound widget keys exchanged for short-lived signed tokens",
    "Server-side entitlement check on every path that can spend on the model",
    "Metered plans: voice minutes, messages, concurrency caps, overage and prepaid credit",
    "Tenant dashboard and operator console with TOTP 2FA, audit log and encrypted credentials",
  ],
  beats: [
    {
      kind: "context",
      heading: "Every missed call is a lost lead",
      body: [
        "Small and mid-size businesses in the Philippines lose leads to calls that ring out after hours and messages that wait until morning. One human agent covers one shift, in one language.",
        "247Aisupports gives each business an AI agent that takes voice calls in the browser, answers chat and drafts email replies, using the business's own documents as its source. It is multi-tenant and white-label: every client gets isolated data, its own persona, branding and knowledge base, and a widget they embed with one snippet.",
        "It is live at 247aisupports.com.",
      ].join("\n\n"),
    },
    {
      kind: "rising",
      heading: "A voice call that behaves like a call",
      body: [
        "Voice is the hard channel. Microphone audio is captured at 16 kHz in an AudioWorklet and relayed through the server's own WebSocket to a realtime speech model, so the browser never talks to the AI provider directly.",
        "Then come the details people notice on a real call. Callers over a plan's concurrency cap wait in a per-tenant queue and see their place in line; calls in progress are never cut. Silence triggers an escalating dead-air ladder that the speaker's own echo can't reset. Ending is a three-phase close: a recap, a last line in the caller's language, and a three-second window where a new question reopens the call.",
        "The model cannot hang up on its own. The server holds a veto.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "A public key that is worth nothing",
      body: [
        "An embeddable widget means a public key sitting in someone's page source. Anyone can copy it, and every call it opens costs real money.",
        "So the key on its own does nothing. It works only from the domains a tenant has listed — no domains, no widget. After an origin check and a bot check it is exchanged for a 15-minute signed token that can never act as a dashboard login. Every path that reaches the model then passes an entitlement check on the server: an active subscription or positive prepaid credit.",
        "No API keys, prompts or model names ever reach the browser. Connector credentials are encrypted at rest with AES-256-GCM.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "One agent, every channel",
      body: [
        "The same agent core serves voice, chat and email, grounded in each tenant's documents through a per-tenant retrieval index. Visitors can test it on their own material: the demo builds a temporary knowledge handle that lives in memory for 30 minutes and is never saved.",
        "In September 2026 the platform gained shop tools — product search, proof-gated order lookup, requests and human handoff — and signed webhooks for Messenger, Instagram, WhatsApp and Viber. Those channels pass 227 deterministic checks against simulated, signed webhooks; going live on them waits on each tenant's own credentials and Meta's app review.",
        "Tenants work from a 13-section dashboard. The operator manages tenants from an 8-section console.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "31",
      label: "database tables",
      source: `grep -c "CREATE TABLE" in src/db/schema.js, ${SRC} (own-saas.md §1F)`,
    },
    {
      value: "~139",
      label: "HTTP endpoints, plus a voice WebSocket",
      source: `123 router.get/post/put/patch/delete calls across 10 route files + 16 app.* handlers in server.js, ${SRC} (own-saas.md §1F; approximate, includes page routes)`,
    },
    {
      value: "227",
      label: "deterministic e-commerce checks",
      source: `227/227 reported in ECOMMERCE-STATUS.md with the model stubbed and webhooks simulated, ${SRC} (own-saas.md §1F)`,
    },
    {
      value: "2 / 5 / 20",
      label: "concurrent calls per plan",
      source: `plan concurrency caps in src/config/index.js, ${SRC} (own-saas.md §1F)`,
    },
    {
      value: "13 + 8",
      label: "tenant dashboard + operator console sections",
      source: `data-section attributes in public/admin/index.html and public/superadmin/index.html, ${SRC} (own-saas.md §1F)`,
    },
  ],
  links: [{ label: "247aisupports.com", href: "https://247aisupports.com", kind: "live" }],
  order: 1,
} satisfies ProjectInput;
