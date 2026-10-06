/**
 * Contact on the light screen: the invitation and direct links on the left, Jeon's
 * photo on the right, then one row per channel (email, WhatsApp, Viber) and a
 * large outlined sign-off.
 */

import styles from "./ContactView.module.css";

const EMAIL = "bertulfojeon@gmail.com";
const WHATSAPP = { label: "+63 968 4333 479", href: "https://wa.me/639684333479" };
const VIBER = { label: "+63474660563", href: "viber://chat?number=%2B63474660563" };

const Arrow = () => (
  <svg className={styles.arrow} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="m3.5 6 8.5 7 8.5-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M9 8.2c.2-.4.5-.4.8-.4h.5c.2 0 .4 0 .6.4l.8 1.8c.1.3 0 .5-.1.7l-.5.6c-.1.2-.2.4 0 .6.4.7 1 1.3 1.6 1.7.6.4 1 .5 1.2.6.2.1.4 0 .5-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .4-.1 1.2-.7 1.6-.6.4-1.5.6-2.6.2-1.2-.4-2.6-1.2-3.8-2.5C9.5 12.6 8.8 11.3 8.6 10.3c-.2-1 .1-1.7.4-2.1Z"
      fill="currentColor"
    />
  </svg>
);

const ViberIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 3c-4.6 0-8 1.6-8 7.3 0 3.3 1 5.3 3 6.3V20l2.7-2.4c.7.1 1.5.2 2.3.2 4.6 0 8-1.6 8-7.5S16.6 3 12 3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M12.6 6.6a3.4 3.4 0 0 1 3.1 3.2M12.5 8.3a1.6 1.6 0 0 1 1.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path
      d="M8.7 7.6c.3-.3.7-.3 1 0l.8 1c.2.3.2.6 0 .9l-.4.5c.3.8 1 1.6 1.8 2l.5-.4c.3-.2.6-.2.9 0l1 .8c.3.3.3.7 0 1l-.6.6c-.4.4-1 .5-1.6.3-2-.7-3.6-2.3-4.3-4.3-.2-.6-.1-1.2.3-1.6Z"
      fill="currentColor"
    />
  </svg>
);

const DocIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3h7l4 4v14H7Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M14 3v4h4M9.5 12h5M9.5 15.5h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export function ContactView() {
  return (
    <section className={styles.contact} aria-label="Contact" data-screen-view data-lenis-prevent>
      <div className={styles.top}>
        <div className={styles.copy}>
          <h2 className={`display ${styles.title}`}>Let&rsquo;s build something.</h2>
          <p className={styles.lead}>Have a project, an automation idea, or a system that needs building? Let&rsquo;s talk.</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={`mailto:${EMAIL}?subject=Project%20enquiry`} aria-label={`Email ${EMAIL}`}>
              <MailIcon />
              {EMAIL}
              <Arrow />
            </a>
            <a className={styles.secondary} href={WHATSAPP.href} target="_blank" rel="noopener" aria-label={`WhatsApp ${WHATSAPP.label}`}>
              <WhatsAppIcon />
              {WHATSAPP.label}
              <Arrow />
            </a>
            <a className={styles.secondary} href="/IamjeonResume.pdf" target="_blank" rel="noopener">
              <DocIcon />
              Résumé (PDF)
              <Arrow />
            </a>
          </div>
          <p className={styles.where}>
            <PinIcon />
            Lapu-Lapu City, Cebu · working with clients in any time zone
          </p>
        </div>

        <figure className={styles.photo}>
          <img src="/media/me/contact.webp" alt="Loreto “Jeon” Saquilabon Jr. at his desk" width={900} height={775} />
          <span className={styles.available}>
            <i aria-hidden="true" /> Available for projects
          </span>
          <figcaption className={styles.badge}>
            <span aria-hidden="true">&lt;/&gt;</span>
            <strong>System developer</strong>
            <small>AI · Systems · Automation</small>
          </figcaption>
        </figure>
      </div>

      <ul className={styles.channels}>
        <li>
          <a href={`mailto:${EMAIL}?subject=Project%20enquiry`} aria-label="Email: drop me a message">
            <MailIcon />
            <span>
              <strong>Email</strong>
              <small>Drop me a message</small>
            </span>
            <Arrow />
          </a>
        </li>
        <li>
          <a href={WHATSAPP.href} target="_blank" rel="noopener" aria-label={`WhatsApp: ${WHATSAPP.label}`}>
            <WhatsAppIcon />
            <span>
              <strong>WhatsApp</strong>
              <small>{WHATSAPP.label}</small>
            </span>
            <Arrow />
          </a>
        </li>
        <li>
          <a href={VIBER.href} aria-label={`Viber: ${VIBER.label}`}>
            <ViberIcon />
            <span>
              <strong>Viber</strong>
              <small>{VIBER.label}</small>
            </span>
            <Arrow />
          </a>
        </li>
      </ul>

      <p className={styles.hello} aria-hidden="true">
        Say hello.
      </p>
    </section>
  );
}
