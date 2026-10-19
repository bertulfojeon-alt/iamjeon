/**
 * Skills for the All work sidebar: each one filters the grid to the projects whose
 * stack matches it. What Jeon offers lives in ./capabilities (What I build).
 * Kept free of project data so client components can import it.
 */

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
