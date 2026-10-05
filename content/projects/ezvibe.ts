import type { ProjectInput } from "../schema";

const SRC = "F:\\EZVibe";

export default {
  slug: "ezvibe",
  title: "EZVibe",
  tier: "flagship",
  chapter: "saas",
  logline:
    "A Windows terminal where every tab is its own identity, so parallel AI coding agents never push with the wrong account.",
  industry: "Developer tools",
  year: 2026,
  status: "pre-release",
  role: "Solo — design, Rust core, interface, licensing backend",
  stack: [
    "Tauri 2",
    "Rust",
    "React 19",
    "TypeScript",
    "xterm.js",
    "ConPTY",
    "Windows DPAPI",
    "Supabase Edge Functions",
    "Ed25519",
    "GitHub Actions",
  ],
  screen: { poster: "/media/projects/ezvibe/screen.webp", loop: "/media/projects/ezvibe/loop.mp4" },
  showcase: "ezvibe-terminal",
  features: [
    "One profile per tab: Claude Code, GitHub, git author, Vercel, Supabase and browser",
    "Folders pinned to profiles, with a warning bar when a tab wanders into another's folder",
    "Activity dots and desktop notifications for agents waiting on an answer",
    "Per-profile usage meter that learns each account's ceiling from real lockouts",
    "Move-here button that shifts work to a profile with more headroom",
    "One git worktree per agent tab, with a guided merge back that aborts cleanly on conflict",
    "Session restore and close protection while an agent is still running",
    "Isolated browser per profile for OAuth sign-ins",
    "Connection checks run inside each profile's own environment, with one-click logins",
    "Custom environment variables encrypted with Windows DPAPI",
    "Google sign-in, server-side trial and Ed25519-signed, machine-locked licences",
    "Licence state and offline grace decided in compiled Rust, never in the UI",
    "Signed auto-updater and keyboard shortcuts for every tab action",
  ],
  beats: [
    {
      kind: "context",
      heading: "One Windows user, one identity",
      body: [
        "On Windows, one user account means one Claude Code config, one GitHub login and one browser cookie jar. A freelancer running agents for two clients and a personal project at the same time is one stray command away from pushing to a client repo under the wrong account.",
        "The tools that run several coding agents side by side are Mac-only or built on tmux. There was no Windows-native answer.",
        "EZVibe makes every terminal tab a sealed identity, with its own Claude Code account, GitHub login, git author, Vercel and Supabase credentials and browser profile.",
      ].join("\n\n"),
    },
    {
      kind: "rising",
      heading: "Isolation by construction",
      body: [
        "The trick is not monitoring. It is the environment a shell is born with. Each tab spawns a real ConPTY whose environment points Claude Code, the GitHub CLI and git at that profile's own folders, puts a Vercel shim on the PATH, decrypts the Supabase token just in time and routes BROWSER to an isolated browser profile. Custom variables are sealed with Windows DPAPI.",
        "EZVibe never reads, copies or sends a CLI token file. It only sets paths.",
        "An integration test spawns two live shells under two profiles and asserts that every config write landed in its own tree. Pinned folders always open in the right profile, and a coloured bar appears the moment a tab moves into another profile's folder.",
      ].join("\n\n"),
    },
    {
      kind: "decision",
      heading: "Trust lives in compiled Rust",
      body: [
        "A paid desktop app invites tampering, so licence decisions never happen in JavaScript. The interface displays licence state; the Rust core decides it, and there is exactly one enforcement point: the terminal spawner refuses to start a shell when the licence is locked.",
        "Verdicts are Ed25519-signed by a server function whose private seed never leaves the backend vault, and the app embeds only the public key. Trials run on the server, one per machine, ever. Row-level security gives clients read-own access only, so no client can write its own licence.",
        "The local cache is DPAPI-sealed and fails closed on tampering. Rolling the clock back is caught against the latest server time seen.",
      ].join("\n\n"),
    },
    {
      kind: "resolution",
      heading: "Small, fast and tested",
      body: [
        "The release build is tuned for size: stripped symbols, link-time optimisation, a single codegen unit and abort on panic. The NSIS installer measured 3.24 MB against a 15 MB budget, before the newest features landed, and the window paints its first frame in a median 0.55–0.6 s.",
        "The core is 14 Rust modules exposing 43 IPC commands, covered by 117 Rust unit tests and 6 integration tests, plus 67 interface test cases and 10 server rule tests, all running on a Windows CI runner.",
        "Since those measurements it has gained a usage meter and one-click worktree tabs. It is feature-complete and in pre-release. Nothing has been published and no price is set.",
      ].join("\n\n"),
    },
  ],
  metrics: [
    {
      value: "3.24 MB",
      label: "NSIS installer",
      source: `measured 2026-09-08, before the W1–W3 features (may have grown slightly); MSI 4.68 MB, ${SRC} (own-saas.md §2E.5, §2F)`,
    },
    {
      value: "0.55–0.6 s",
      label: "median first paint",
      source: `renderer-side first-paint mark via scripts/perf-coldstart.ps1, measured 2026-09-16, ${SRC} (own-saas.md §2E.5, §2F)`,
    },
    {
      value: "14",
      label: "Rust modules",
      source: `ls of src-tauri/src/*.rs, ${SRC} (own-saas.md §2F)`,
    },
    {
      value: "43",
      label: "IPC commands",
      source: `grep -c '#[tauri::command]' in src-tauri/src/lib.rs, ${SRC} (own-saas.md §2F)`,
    },
    {
      value: "117 + 6",
      label: "Rust unit + integration tests",
      source: `grep of #[test] in src-tauri/src and test files in src-tauri/tests (one ignored by design), ${SRC} (own-saas.md §2F)`,
    },
    {
      value: "67",
      label: "interface test cases",
      source: `grep of it(/test( across 13 Vitest files, ${SRC} (own-saas.md §2F)`,
    },
  ],
  links: [{ label: "ezvibe.vercel.app — join the waitlist", href: "https://ezvibe.vercel.app", kind: "waitlist" }],
  order: 1,
} satisfies ProjectInput;
