/**
 * Behind the desk — the camera turns from the screens to the person.
 * A quiet, readable chapter: story, path, and the kit.
 */

import { WarmTitle } from "@/components/ui/WarmTitle";
import styles from "./BehindTheDesk.module.css";

const PATH = [
  { years: "2015 – 2017", role: "Data entry", where: "Bureau of Customs, Sub-Port Mactan", lesson: "Accuracy at volume — the habit behind every schema I design." },
  { years: "2015 – 2017", role: "Graphic designer", where: "Kwayyu Tailoring & Printing", lesson: "Layout, type and deadlines — the eye behind the interfaces." },
  { years: "2017 – 2019", role: "Customer service", where: "Teleperformance", lesson: "Hundreds of real support calls — the reason my voice agents sound like people who listen." },
  { years: "2020 – now", role: "Full-stack developer", where: "Independent", lesson: "Trading platforms, AI voice agents and SaaS for clients, plus products of my own." },
];

const KIT = [
  { area: "Interfaces", tools: "Next.js, React, TypeScript, Tailwind, GSAP, canvas, Tauri" },
  { area: "Systems", tools: "Node.js, Postgres / Supabase, SQLite, Rust, Python, WebSockets" },
  { area: "AI & voice", tools: "Gemini Live, real-time voice, RAG, tool calling, Twilio / SIP" },
  { area: "Trading", tools: "MetaTrader 5, MQL5, Pine Script, Telegram automation, backtesting" },
  { area: "Shipping", tools: "Vercel, Railway, Cloudflare, Playwright, Vitest, CI" },
];

export function BehindTheDesk() {
  return (
    <section id="about" className={styles.about} aria-labelledby="about-title">
      <div className={`wrap ${styles.grid}`}>
        <figure className={styles.portrait}>
          <img src="/media/me/me-about.png" alt="Loreto “Jeon” Saquilabon Jr. at his desk" loading="lazy" />
          <div className={styles.glow} aria-hidden="true" />
        </figure>
        <div className={styles.text}>
          <WarmTitle as="h2" className={styles.title}>
            <span id="about-title">Behind the desk</span>
          </WarmTitle>
          <p className={styles.lead}>
            I&rsquo;m Jeon. I build the whole thing — interface, backend, data, AI, deployment — and I stay until it
            works for the people using it.
          </p>
          <p className="dim">
            I didn&rsquo;t start in software. I started in a customs office keying records, in a print shop drawing
            logos, and on a phone headset solving other people&rsquo;s problems. Every one of those jobs is still in the
            work: careful data, clean screens, and patience for real users. I trade Forex myself, which is why so many of
            these screens are for traders.
          </p>

          <ol className={styles.path}>
            {PATH.map((p) => (
              <li key={p.role}>
                <span className={styles.years}>{p.years}</span>
                <div>
                  <h3>
                    {p.role} <span className="dim">· {p.where}</span>
                  </h3>
                  <p className="dim">{p.lesson}</p>
                </div>
              </li>
            ))}
          </ol>

          <dl className={styles.kit}>
            {KIT.map((k) => (
              <div key={k.area}>
                <dt>{k.area}</dt>
                <dd>{k.tools}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
