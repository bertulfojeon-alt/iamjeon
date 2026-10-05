"use client";

/**
 * A coded presentation of 247Aisupports at work, shown instead of dashboard
 * screenshots. Demo data only (a fictional clinic and caller), product palette
 * (dark canvas, violet → magenta). One ~16 s loop:
 *
 *   after-hours call rings → the AI picks up → the caller speaks Taglish, the
 *   language is detected → the answer is grounded in the clinic's own document →
 *   a slot is booked: lead card, calendar event, sentiment → reset.
 */

import { lineEnd, useLoopClock, wordAt, wordsShown, type Line } from "./useLoopClock";
import styles from "./SupportCallDesk.module.css";

const LOOP = 16;

const LINES: Line[] = [
  { who: "caller", at: 1.6, pace: 0.24, text: "Hi! May slot pa ba kayo bukas for a cleaning?" },
  { who: "ai", at: 4.3, pace: 0.24, text: "Opo! Tomorrow we have 10:00 AM or 2:30 PM. Which works for you?" },
  { who: "caller", at: 8.0, pace: 0.26, text: "2:30 po, please." },
  { who: "ai", at: 9.4, pace: 0.24, text: "Booked — 2:30 PM tomorrow for a cleaning. I'll text you a confirmation." },
];

const DETECT_AT = 3.2;
const SOURCE_AT = wordAt(LINES[1], "Tomorrow");
const BOOKED_AT = wordAt(LINES[3], "Booked");
const CALENDAR_AT = BOOKED_AT + 0.9;
const SENTIMENT_AT = BOOKED_AT + 1.8;

export function SupportCallDesk() {
  const t = useLoopClock(LOOP, 14.6);
  const ringing = t < 1.2;
  const speaking = LINES.find((l) => t >= l.at && t < lineEnd(l) + 0.3);
  const fading = t >= LOOP - 0.7;

  return (
    <div
      className={styles.stage}
      data-fading={fading}
      role="img"
      aria-label="Demo: an AI agent answers an after-hours call in Taglish, answers from the clinic's own documents, books a cleaning appointment and logs the lead, calendar event and sentiment."
    >
      <aside className={styles.call}>
        <div className={styles.callHead}>
          <span className={styles.status} data-ringing={ringing}>
            {ringing ? "Incoming call…" : "● Live call"}
          </span>
          <span className={styles.time}>9:42 PM · after hours</span>
        </div>
        <div className={styles.biz}>Bright Smile Dental — AI front desk</div>

        <div className={styles.wave} data-active={Boolean(speaking)} data-who={speaking?.who ?? "none"}>
          {Array.from({ length: 28 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${(i % 7) * 0.07}s` }} />
          ))}
        </div>

        <div className={styles.chips}>
          <span className={styles.chip} data-in={t >= DETECT_AT}>
            Taglish detected
          </span>
          <span className={styles.chip} data-in={t >= SOURCE_AT}>
            Answered from: Clinic hours.pdf
          </span>
        </div>

        <ol className={styles.transcript}>
          {LINES.filter((l) => t >= l.at)
            .slice(-3)
            .map((l) => (
              <li key={l.at} data-who={l.who}>
                <span className={styles.speaker}>{l.who === "ai" ? "AI agent" : "Caller"}</span>
                {wordsShown(l, t)}
              </li>
            ))}
        </ol>
      </aside>

      <main className={styles.board}>
        <header className={styles.boardHead}>
          <span>Conversations</span>
          <span className={styles.live}>
            <i /> 3 calls live · 0 waiting
          </span>
        </header>

        <section className={styles.lead} data-in={t >= BOOKED_AT}>
          <div className={styles.leadTop}>
            <span className={styles.leadTag}>New lead · booked</span>
            <span className={styles.sentiment} data-in={t >= SENTIMENT_AT}>
              Positive
            </span>
          </div>
          <div className={styles.leadName}>Maria S.</div>
          <dl className={styles.leadMeta}>
            <div>
              <dt>Service</dt>
              <dd>Teeth cleaning</dd>
            </div>
            <div>
              <dt>When</dt>
              <dd>Tomorrow, 2:30 PM</dd>
            </div>
            <div>
              <dt>Channel</dt>
              <dd>Voice · Taglish</dd>
            </div>
          </dl>
        </section>

        <section className={styles.cal} data-in={t >= CALENDAR_AT}>
          <div className={styles.calDay}>
            <span>Tomorrow</span>
            <strong>14</strong>
          </div>
          <div className={styles.calSlots}>
            <span className={styles.slot}>10:00 AM · Open</span>
            <span className={styles.slot} data-booked="true">
              2:30 PM · Cleaning — Maria S.
            </span>
            <span className={styles.slot}>4:00 PM · Open</span>
          </div>
          <span className={styles.calNote}>Added to Google Calendar</span>
        </section>

        <section className={styles.channels}>
          {[
            ["Voice", "live"],
            ["Chat", "on"],
            ["Email", "on"],
            ["Messenger", "on"],
          ].map(([name, state]) => (
            <span key={name} className={styles.channel} data-state={state}>
              <i /> {name}
            </span>
          ))}
        </section>
      </main>
    </div>
  );
}
