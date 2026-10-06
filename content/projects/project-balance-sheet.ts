import type { ProjectInput } from "../schema";

const SRC = "work-a.md §3";

export default {
  slug: "project-balance-sheet",
  title: "Project Balance Sheet",
  tier: "classified",
  chapter: "classified",
  logline:
    "Cloud accounting for Philippine SMEs on a double-entry engine, with 12% VAT, BIR forms and receipt scanning wrapped in tax rules.",
  industry: "SME accounting",
  year: 2026,
  status: "live",
  role: "Full-stack engineer",
  stack: ["Next.js 15", "React 19", "TypeScript", "Zustand", "Supabase", "AI SDK", "Recharts", "Zod"],
  screen: { poster: "/media/projects/project-balance-sheet/screen.webp" },
  coldOpen: {
    type: "image",
    src: "/media/projects/project-balance-sheet/screen.webp",
    alt: "Accounting dashboard for a sample company: cash on hand, profit, unpaid and overdue invoices, cash-flow chart and spending breakdown",
    width: 1280,
    height: 800,
    caption: "Dashboard for a sample company — every figure is computed from the double-entry ledger. Brand withheld.",
  },
  redacted: true,
  pitch: {
    track: "admin",
    problem: "Small businesses keep receipts in a drawer and rebuild their VAT and tax filings from scratch every quarter.",
    outcome: "Cloud books on a double-entry engine: receipts are scanned with VAT rules applied, and reports and BIR deadlines come from the journal.",
  },
  features: [
    "Invoices, estimates, bills, purchase orders and payments on a double-entry engine",
    "Receipt scanning with input-VAT eligibility rules and supplier matching by TIN",
    "Bank and e-wallet feed review and reconciliation",
    "Printable reports derived from the journal, from P&L to trial balance",
    "Quarterly VAT and a BIR forms calendar",
    "Semi-monthly payroll posting to statutory payables",
    "Manual journal entries with a live balance check",
    "Products and services with inventory and low-stock alerts",
    "Project profitability and billable time logging",
    "Multi-company cloud books with invitations and conflict-safe saves",
  ],
  beats: [
    {
      kind: "context",
      heading: "Bookkeeping that knows the BIR",
      body: [
        "Small businesses in the Philippines need bookkeeping that understands 12% VAT (output less input), BIR forms and deadlines, TIN-based suppliers, statutory payroll, and payments by bank transfer, GCash or check.",
        "This is a full accounting suite: invoices and estimates, bills and purchase orders, bank-feed reconciliation, a chart of accounts and journal entries, semi-monthly payroll, project time tracking, and eight printable reports from profit and loss to the VAT summary.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "The model reads, the rules decide",
      body: [
        "Every invoice, payment, bill, bank categorisation and pay run posts a balanced double-entry journal, and every report is derived from that journal.",
        "Receipt scanning uses a model only to extract fields against a schema. Pure functions decide the rest: expense or bill, supplier match by TIN, and whether input VAT can be claimed — both parties VAT-registered, a document valid for input tax, VAT printed, the buyer this company. Uncertain fields are flagged for a person to check, and an offline harness re-reads documents to confirm zero wrong VAT claims.",
        "The book syncs as one document with version compare-and-swap, so a stale save can't overwrite an edit.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "33",
      label: "pages",
      source: `count of page.tsx files in the accounting codebase (${SRC}F)`,
    },
    {
      value: "8",
      label: "financial reports",
      source: `report routes under the app reports folder (${SRC}F)`,
    },
    {
      value: "100",
      label: "tests in 10 files",
      source: `grep of test cases, matching the team's shift report (${SRC}F)`,
    },
    {
      value: "21",
      label: "row-level security policies",
      source: `grep of create policy across 4 migrations (${SRC}F)`,
    },
  ],
  links: [],
  order: 3,
} satisfies ProjectInput;
