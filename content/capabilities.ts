/**
 * What I can build for you: the features a client can ask for, separate from the
 * projects. Each one is drawn from features the projects already list, names the
 * projects that prove it (`proof`), and shows it working: a coded demo
 * (components/showcase) or a real screen. No figures here: numbers live on the
 * projects, where each one has a source.
 * Kept free of project data so client components can import it.
 */

import type { ShowcaseId } from "@/components/showcase";

export type CapabilityDemo =
  | { kind: "showcase"; id: ShowcaseId }
  | { kind: "image"; src: string; alt: string; caption: string };

export interface Capability {
  id: string;
  title: string;
  /** One sentence: what it does for the business. */
  line: string;
  /** What the client gets, each one listed on a proof project. */
  points: string[];
  /** Where a feature is not live everywhere it is shown, the plain truth about it. */
  note?: string;
  demo: CapabilityDemo;
  proof: string[];
  /** The note "Ask me for this" puts on the contact panel, in the visitor's words. */
  ask: string;
  /** The AI twin on this site is itself an example: offer a live try. */
  tryTwin?: boolean;
}

export const CAPABILITIES_LEAD =
  "Every feature here comes from software I have built, so you can see it working before we talk. Pick what your business needs.";

export const CAPABILITIES: Capability[] = [
  {
    id: "voice-receptionist",
    title: "AI voice receptionist",
    line: "Answers every call, day and night, from your own documents, and hands the caller to your staff when a person is needed.",
    points: [
      "Speaks English, Tagalog and Bisaya, even when callers mix them",
      "Verifies callers, files tickets and books callbacks",
      "Books appointments into your Google Calendar",
      "A live calls board where your team can listen in",
    ],
    demo: { kind: "showcase", id: "support-call-desk" },
    proof: ["247aisupports", "unified-cx", "resolute-ai-site"],
    ask: "I'd like an AI receptionist to answer my business's calls.",
    tryTwin: true,
  },
  {
    id: "chat-assistant",
    title: "AI chat for Messenger, WhatsApp and your website",
    line: "One assistant answers your website chat and your messaging inbox, and your staff can take over any conversation.",
    points: [
      "A chat widget you add to your site with one snippet",
      "Looks up products and orders, and asks for proof before it shares an order",
      "A shared inbox where staff take over a thread and hand it back",
      "Drafts email replies from the same knowledge",
    ],
    note: "Messenger, Instagram, WhatsApp and Viber are built and tested on simulated traffic. Each goes live once that platform approves your business account.",
    demo: {
      kind: "image",
      src: "/media/projects/247aisupports-landing/screen.webp",
      alt: "The 247Aisupports landing page: an AI agent answering a call, with the lead captured beside it",
      caption: "247Aisupports, live at 247aisupports.com.",
    },
    proof: ["247aisupports", "ainalytics"],
    ask: "I'd like an AI assistant for my website chat and my Messenger or WhatsApp.",
  },
  {
    id: "document-reading",
    title: "Receipts and documents read for you",
    line: "Snap a receipt and it is read and checked against the tax rules. Upload your files and your AI answers from them.",
    points: [
      "Receipts scanned with OCR and matched to the supplier by TIN",
      "Input VAT checked before it counts",
      "PDFs, sheets and text turned into a knowledge base your AI answers from",
      "Statements imported from CSV, spreadsheets and HTML reports",
    ],
    demo: {
      kind: "image",
      src: "/media/projects/project-balance-sheet/screen.webp",
      alt: "Cloud accounting dashboard with receipt scanning in the top bar",
      caption: "Project Balance Sheet: the cloud books where receipts are scanned. Brand withheld.",
    },
    proof: ["project-balance-sheet", "247aisupports", "unified-cx", "the-alpha-room"],
    ask: "I'd like receipts or documents read automatically for my business.",
  },
  {
    id: "face-verification",
    title: "Face verification a photo can't fool",
    line: "Clock-ins and check-ins confirmed by face, with a liveness check that catches a photo held up to the camera.",
    points: [
      "Kiosk and phone clock-in checked by face and GPS location",
      "A liveness challenge: blink, or turn left or right",
      "Every attempt logged, so pass rates are measured, not guessed",
      "Face-matching models decide, not a chatbot, so the same image always gets the same result",
    ],
    note: "Face clock-in runs in production in Project Payday. The liveness bench in Project Facegate is research and development.",
    demo: { kind: "showcase", id: "liveness-bench" },
    proof: ["project-payday", "project-facegate"],
    ask: "I'd like face verification for attendance or check-ins.",
  },
  {
    id: "ask-your-data",
    title: "Ask your business data",
    line: "Ask why sales moved, by voice or chat, and get the answer from your own spreadsheets and database.",
    points: [
      "Connects spreadsheets, Google Sheets and Postgres, read only",
      "Asks which metric you meant instead of guessing",
      "Explains what drove a change, and flags unusual days with the cause",
      "A morning briefing email that warns you when the data is stale",
    ],
    demo: {
      kind: "image",
      src: "/media/projects/ainalytics/screen.webp",
      alt: "Ainalytics answering a business question with a chart from the company's own data",
      caption: "Ainalytics: answers from the company's own data. Demo data.",
    },
    proof: ["ainalytics", "the-alpha-room"],
    ask: "I'd like to ask questions about my business data and get answers from it.",
  },
  {
    id: "ai-presentations",
    title: "AI that presents your numbers",
    line: "It speaks, and the chart it is talking about appears on screen with the number highlighted.",
    points: [
      "Charts and slides timed to the spoken answer",
      "The chart picked for the insight: waterfall, trend, heatmap or breakdown",
      "Exports to PDF and image, with share links",
      "The AI twin on this site presents my work the same way",
    ],
    demo: { kind: "showcase", id: "ainalytics-presenter" },
    proof: ["ainalytics", "project-payday"],
    ask: "I'd like an AI assistant that presents my reports by voice.",
    tryTwin: true,
  },
  {
    id: "dashboards",
    title: "Dashboards that show what needs you first",
    line: "Owner overviews, staff consoles and reports built around the decisions you make every day.",
    points: [
      "Approvals and items that hold up work, shown first",
      "Reports from the real records: P&L, trial balance, drawdown and close reasons",
      "Live boards for calls in progress, with caller-mood badges",
      "Roles, two-factor sign-in and an audit log",
    ],
    demo: {
      kind: "image",
      src: "/media/projects/project-payday/screen.webp",
      alt: "Payroll and attendance overview: items needing approval, workforce, attendance and labour cost",
      caption: "Project Payday: the owner's overview. Names, tenant and brand withheld.",
    },
    proof: ["project-payday", "project-balance-sheet", "the-alpha-room", "unified-cx", "tg-auto-trader"],
    ask: "I'd like a dashboard for my business.",
  },
  {
    id: "automation",
    title: "Automation for the work your team repeats",
    line: "The jobs your team does by hand every day or every cutoff, done by software that waits for your approval where it matters.",
    points: [
      "Payroll that computes deductions and premiums, then locks once approved",
      "Email sequences and follow-ups that send on their own",
      "AI drafts of posts and scripts, checked by a second AI before you approve",
      "Raw recordings edited into captioned shorts with one command",
    ],
    demo: { kind: "showcase", id: "content-pipeline" },
    proof: ["smm-system", "project-payday", "tradesbymerc", "video-editor", "unsaybalita"],
    ask: "I'd like to automate work my team does by hand.",
  },
  {
    id: "price-monitoring",
    title: "Know when competitors change prices",
    line: "Competitors' online stores are watched for you, and you hear about price, stock and new-product changes.",
    points: [
      "Reads the major e-commerce platforms and detects which one a store runs on",
      "An hourly watchlist with price, stock and new-product alerts",
      "Matches the same product across stores",
      "Exports to Excel, CSV or a Shopify import",
    ],
    demo: {
      kind: "image",
      src: "/media/projects/jeonscraper/screen.webp",
      alt: "JeonScraper's war room: price, category and brand views of competitors' stores",
      caption: "JeonScraper: the war room briefing.",
    },
    proof: ["jeonscraper"],
    ask: "I'd like to track my competitors' prices and stock.",
  },
  {
    id: "saas-payments",
    title: "Your idea as a product people pay for",
    line: "Accounts, plans and payments around your idea, so customers can sign up and pay without you in the loop.",
    points: [
      "Card, GCash and PayPal payments, subscriptions and payouts",
      "Metered plans with usage limits and prepaid credit",
      "Signed licences for software customers download",
      "Each client's data kept apart, with their own branding",
    ],
    demo: {
      kind: "image",
      src: "/media/projects/tradesbymerc/academy.webp",
      alt: "TradesByMerc's student app: the academy catalog with peso pricing and members-only courses",
      caption: "TradesByMerc: the academy catalog, with peso pricing and members-only courses.",
    },
    proof: ["tradesbymerc", "247aisupports", "tg-auto-trader", "ezvibe"],
    ask: "I'd like to turn my idea into a product customers pay for.",
  },
  {
    id: "philippine-payroll",
    title: "Payroll and books that follow Philippine rules",
    line: "Government contributions, withholding tax, VAT and BIR deadlines handled by the software, not a spreadsheet.",
    points: [
      "SSS, PhilHealth, Pag-IBIG and withholding tax on your own pay schedules",
      "Holiday, overtime and night-differential premiums, plus thirteenth-month pay",
      "Quarterly VAT and a BIR forms calendar",
      "Payslips employees review and sign off on their phones",
    ],
    demo: {
      kind: "image",
      src: "/media/projects/project-payday/gallery-3.webp",
      alt: "Statutory rates: SSS, PhilHealth, Pag-IBIG, withholding tax, premiums and holidays",
      caption: "Project Payday: statutory rates, each starting at the Philippine default.",
    },
    proof: ["project-payday", "project-balance-sheet"],
    ask: "I'd like payroll or bookkeeping software that follows Philippine rules.",
  },
  {
    id: "websites",
    title: "Websites and web apps",
    line: "Company sites, landing pages and full web apps, designed, built and launched by the same developer.",
    points: [
      "A voice assistant on your site that answers visitors and captures leads",
      "Ticket tiers, contact forms and newsletter sign-ups",
      "Cinematic motion that falls back to a still page on slower phones",
      "Layouts checked on phones, tablets and desktops",
    ],
    demo: {
      kind: "image",
      src: "/media/projects/resolute-ai-site/screen.webp",
      alt: "Resolute AI's corporate site: a cinematic hero with the company's AI systems",
      caption: "Resolute AI: corporate site, live.",
    },
    proof: ["resolute-ai-site", "midnight-vibes", "tradesbymerc", "jeonscraper"],
    ask: "I'd like a website or web app for my business.",
  },
  {
    id: "trading-tools",
    title: "Trading tools for traders and coaches",
    line: "MetaTrader indicators, Telegram signal copiers, journals and academies, built by a developer who trades.",
    points: [
      "Telegram signals placed on MetaTrader, sized to your risk",
      "MQL5 indicators with offline licences",
      "Journals and coach dashboards fed by automatic account sync",
      "Course platforms with live sessions and certificates",
    ],
    demo: {
      kind: "image",
      src: "/media/projects/tg-auto-trader/slide-02.png",
      alt: "Chart Trading screen: a gold chart with the indicator library open and a buy/sell order ticket",
      caption: "TG Auto Trader: chart, indicator library and order ticket. Demo account.",
    },
    proof: ["tg-auto-trader", "merc-smc-pro", "the-alpha-room", "tradesbymerc", "smc-classroom-to-algorithm"],
    ask: "I'd like a trading tool built.",
  },
];

/** The promise behind every AI feature, with the projects that keep it. */
export const AI_PROMISE = {
  title: "AI that checks itself",
  body: "Each AI system here has a rule-based check behind it: a metric engine that asks instead of guessing, a ledger that takes back any claim no tool supported, a critic that blocks inaccurate posts, a maths engine that marks answers. So it does not guess with your customers or your numbers.",
  proof: ["ainalytics", "unified-cx", "smm-system", "jelai"],
};
