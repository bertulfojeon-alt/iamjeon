import type { ProjectInput } from "../schema";

const SRC = "work-a.md §1";

export default {
  slug: "project-payday",
  title: "Project Payday",
  tier: "classified",
  chapter: "classified",
  logline:
    "HR, time and payroll for Philippine businesses: geofenced clock-ins, statutory payroll with approval locks and a voice assistant.",
  industry: "HR and payroll",
  year: 2026,
  status: "live",
  role: "Full-stack engineer",
  stack: [
    "React",
    "Vite",
    "TypeScript",
    "Supabase",
    "Postgres",
    "Edge Functions",
    "pg_cron",
    "Realtime speech AI",
    "PWA",
  ],
  screen: { poster: "/media/projects/project-payday/screen.webp" },
  coldOpen: {
    type: "image",
    src: "/media/projects/project-payday/screen.webp",
    alt: "Payroll and attendance overview: items needing approval, workforce, attendance and month-to-date labour cost",
    width: 1280,
    height: 800,
    caption: "Owner overview — approvals that block payroll, attendance and labour cost. Names, tenant and brand withheld.",
  },
  redacted: true,
  pitch: {
    track: "admin",
    problem: "Payroll week means chasing timesheets, checking who really showed up, and recomputing deductions and premiums by hand.",
    outcome: "Clock-ins are checked by location and face, and payroll computes government deductions and premiums, then locks once approved.",
  },
  spotlights: [
    { feature: "Kiosk and phone clock-in gated by GPS geofence and face match", x: 8, y: 25, label: "Clock-in checked by place and face" },
    { feature: "Schedules, overtime queues and two-stage leave approvals", x: 30, y: 19, label: "Overtime and leave approvals" },
    { feature: "Payroll register: open, for approval, approved, paid, frozen once approved", x: 6, y: 80, label: "Payroll locks once approved" },
  ],
  features: [
    "Kiosk and phone clock-in gated by GPS geofence and face match",
    "Configurable pay schedules with SSS, PhilHealth, Pag-IBIG and withholding tax",
    "Payroll register: open, for approval, approved, paid, frozen once approved",
    "Voice assistant that presents charts and slides in step with its answer",
    "Holiday, rest-day, overtime and night-differential premiums, plus 13th-month pay",
    "Loans and cash advances deducted without pushing net pay below zero",
    "Schedules, overtime queues and two-stage leave approvals",
    "Mobile employee portal: payslip review and sign-off, leave, overtime, documents",
    "Recruitment pipeline with a public careers page, plus onboarding and offboarding",
    "Approved expenses and paid payroll synced one way into a linked accounting book",
  ],
  beats: [
    {
      kind: "context",
      heading: "Payroll the law can check",
      body: [
        "Philippine employers have to apply SSS, PhilHealth and Pag-IBIG contributions, TRAIN-law withholding, holiday and rest-day premiums, night differential and 13th-month pay correctly — often from spreadsheets, with attendance kept on paper.",
        "This platform runs the path from clock-in to payslip: a kiosk and phone clock-in gated by a GPS geofence and a face match, schedules, leave with two-stage approvals, overtime queues, and a payroll register that moves from open to approved to paid. Employees review and sign off their payslips in a mobile portal.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "Guarantees in the database",
      body: [
        "Payroll is a state machine enforced by a database trigger. Approved runs are frozen as revisions and never overwritten, an exclusion constraint makes overlapping pay periods impossible, and every row is checked so that gross minus deductions minus net is zero.",
        "Tenancy is enforced in row-level security on every table. Statutory and premium logic lives in shared modules mirrored byte for byte between browser and server, and parity tests fail if the copies drift. The assistant reads through 21 read-only tools, and tests fail if a tool selects personal ID columns or shows a chart label the model never saw.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "Talk to the numbers",
      body: [
        "Owners can ask by voice. A realtime speech session runs straight from the browser on a single-use token, so audio never passes through the backend, and the model can open a full-screen presentation stage with charts timed to its answer.",
        "The platform is in production use, with 120 migrations, 97 tables, 29 edge functions and more than 2,200 test cases behind it.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "120",
      label: "database migrations",
      source: `count of migration files in the HR codebase (${SRC}F)`,
    },
    {
      value: "97",
      label: "tables",
      source: `unique CREATE TABLE names across migrations (${SRC}F)`,
    },
    {
      value: "29",
      label: "edge functions, plus 54 shared modules",
      source: `ls of the functions folder excluding the shared folder (${SRC}F)`,
    },
    {
      value: "2,254+",
      label: "test cases",
      source: `grep of it/test call sites across 204 test files; the runner reported 2,764 on 2026-10-01 (${SRC}F)`,
    },
    {
      value: "21",
      label: "read-only assistant tools",
      source: `unique name: entries in the shared HR tools module (${SRC}F)`,
    },
  ],
  links: [],
  order: 1,
} satisfies ProjectInput;
