import type { ProjectInput } from "../schema";

const SRC = "F:\\Work\\AI Restaurant";

export default {
  slug: "ai-restaurant-os",
  title: "AI Restaurant OS",
  tier: "commission",
  chapter: "saas",
  logline:
    "QR ordering, POS, kitchen display, reservations and ledger-based inventory for restaurant groups, with the rules enforced in Postgres.",
  industry: "Hospitality software",
  year: 2026,
  status: "built",
  role: "Full-stack developer — platform, data model, AI concierge",
  stack: [
    "Next.js 16",
    "TypeScript",
    "pnpm monorepo",
    "Supabase",
    "Supabase Realtime",
    "Gemini",
    "Python",
    "FastAPI",
    "Playwright",
  ],
  screen: { poster: "/media/screens/ai-restaurant-os.webp" },
  features: [
    "Guest QR ordering with modifiers, allergen warnings and live order status",
    "POS terminal, floor plan with table states, reservations and waitlist",
    "Realtime kitchen display with per-station fan-out and late warnings",
    "Append-only inventory ledger with recipe deduction and purchase receiving",
    "Split and partial payments, refunds and cash-drawer sessions",
    "AI menu concierge that only recommends real items",
    "Forecasting microservice with walk-forward backtesting",
  ],
  beats: [
    {
      kind: "context",
      heading: "Separate tools, separate truths",
      body: [
        "Restaurant groups run POS, kitchen display, reservations and inventory as separate products that never quite agree, and a group with several brands and branches needs strict walls between them.",
        "This is one platform for all of it, organised as organisation, brand and branch, with role-based permissions down to keys like kitchen.view and inventory.adjust, and a platform admin above every tenant.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "Correct by construction",
      body: [
        "The order, kitchen-ticket and table state machines are written twice: in pure TypeScript and as Postgres triggers, so an invalid transition throws in the app and in the database. Money is stored as integer minor units with a currency, never floats. Anonymous QR orders are priced and validated on the server and carry an idempotency key.",
        "Inventory is an append-only ledger. When an order enters preparation, its recipe components are deducted exactly once. Row-level security covers every tenant table, and a live sweep across all 39 of them returned no cross-tenant rows.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "A concierge that can't invent dishes",
      body: [
        "Guests can ask for “something spicy for two under ₱600, no peanuts”. The model extracts the constraints; a deterministic recommender picks real menu items, so it can't invent a dish or a price. It drafts and never orders for the guest, and when AI is unavailable it falls back to rules with an honest label.",
        "The kitchen board fans each order out to stations in realtime, with timers, late warnings and allergen badges. It was delivered in nine gated phases and is feature-complete. A public demo deployment is planned.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "26",
      label: "pages",
      source: `find apps/web/app -name page.tsx, ${SRC} (work-a.md §4F)`,
    },
    {
      value: "57",
      label: "database tables",
      source: `unique CREATE TABLE across 13 migrations, ${SRC} (work-a.md §4F)`,
    },
    {
      value: "105",
      label: "row-level security policies",
      source: `grep of create policy across supabase/migrations, ${SRC} (work-a.md §4F)`,
    },
    {
      value: "93 + 14 + 11",
      label: "unit + end-to-end + Python tests",
      source: `it/test call sites in 11 unit files, 14 Playwright tests in 8 specs, 11 pytest tests, ${SRC} (work-a.md §4F)`,
    },
  ],
  links: [],
  order: 10,
} satisfies ProjectInput;
