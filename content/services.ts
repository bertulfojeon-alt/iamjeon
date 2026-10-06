/**
 * What Jeon offers, for the All work page. Each service names the projects that
 * show it (`proof`), so every claim points at work a client can open. No figures
 * here: numbers live on the projects, where each one has a source.
 * Kept free of project data so client components can import it.
 */

export interface Service {
  id: string;
  title: string;
  /** One line under the title in the sidebar tooltip and the service header. */
  line: string;
  lead: string;
  points: string[];
  proof: string[];
}

export const SERVICES: Service[] = [
  {
    id: "agents",
    title: "AI agents for calls & chat",
    line: "Answer customers by phone, chat and email.",
    lead: "An assistant that answers your customers by phone, website chat and email from your own documents, files their requests, and passes the conversation to your staff when a person is needed.",
    points: [
      "Answers from your documents and data, not guesses",
      "Verifies callers and files tickets or callbacks",
      "Hands over to a person with the conversation attached",
    ],
    proof: ["247aisupports", "unified-cx", "ainalytics"],
  },
  {
    id: "trading",
    title: "Trading tools & platforms",
    line: "Indicators, copiers, journals and academies.",
    lead: "MetaTrader indicators and expert advisors, Telegram signal copiers, trading journals and course platforms with payments, for traders, mentors and their students.",
    points: [
      "MQL5 indicators and expert advisors, tested on real charts",
      "Telegram signals placed as orders, sized to the trader's risk",
      "Academies with courses, live sessions and card or GCash payments",
    ],
    proof: ["tg-auto-trader", "merc-smc-pro", "tradesbymerc", "the-alpha-room", "smc-classroom-to-algorithm"],
  },
  {
    id: "backoffice",
    title: "Back-office systems",
    line: "Payroll, attendance and bookkeeping.",
    lead: "Payroll, attendance and bookkeeping software built around Philippine rules: government contributions, withholding tax, VAT and BIR deadlines.",
    points: [
      "Payroll with SSS, PhilHealth, Pag-IBIG and withholding",
      "Clock-ins checked by location and face",
      "Double-entry books with receipt scanning",
    ],
    proof: ["project-payday", "project-balance-sheet", "project-facegate"],
  },
  {
    id: "automation",
    title: "Workflow automation",
    line: "Take repeated work off your team.",
    lead: "Pipelines that take repeated work off your team: turning trends into scripts and videos, editing raw recordings into shorts, collecting product data and publishing on a schedule.",
    points: [
      "AI drafts with a review step before anything is posted",
      "Automatic video editing, captions and sound",
      "Scheduled publishing and data collection",
    ],
    proof: ["smm-system", "video-editor", "unsaybalita", "jeonscraper", "claude-orchestrator"],
  },
  {
    id: "web",
    title: "Websites & web apps",
    line: "Company sites, landing pages and web apps.",
    lead: "Company sites, landing pages and full web apps built with React and Next.js, from the first design to deployment.",
    points: [
      "Design, build and deployment by the same developer",
      "Layouts that work on phones and desktops",
      "Payments, sign-in and email when the site needs them",
    ],
    proof: ["resolute-ai-site", "midnight-vibes", "tradesbymerc", "jeonscraper"],
  },
];

export interface Skill {
  label: string;
  /** Matched, case-insensitively, against each stack entry. */
  pattern: string;
}

export const SKILLS: Skill[] = [
  { label: "React / Next.js", pattern: "^(react|next\\.js)" },
  { label: "TypeScript", pattern: "^typescript$" },
  { label: "Node.js", pattern: "^node\\.js" },
  { label: "Python", pattern: "^python$" },
  { label: "Supabase / Postgres", pattern: "supabase|postgres" },
  { label: "MetaTrader / MQL5", pattern: "mql5|metatrader" },
  { label: "Voice & AI models", pattern: "speech|gemini|ai sdk|groq|whisper|embeddings" },
  { label: "Desktop apps", pattern: "tauri|electron" },
];

export function skillMatches(skill: Skill, stack: string[]): boolean {
  const re = new RegExp(skill.pattern, "i");
  return stack.some((s) => re.test(s));
}
