/** Contact on the light screen. Phase 2 adds WhatsApp and Viber with a pre-filled summary. */

import styles from "./ContactView.module.css";

const EMAIL = "bertulfojeon@gmail.com";

export function ContactView() {
  return (
    <section className={styles.contact} aria-label="Contact" data-screen-view>
      <h2 className={`display ${styles.title}`}>Let&rsquo;s build something.</h2>
      <p className={styles.lead}>
        A system that answers your calls, runs your trading desk or takes payroll off your plate — or a live walkthrough
        of anything on this screen. Freelance and full-time.
      </p>
      <div className={styles.actions}>
        <a className={styles.primary} href={`mailto:${EMAIL}?subject=Project%20enquiry`}>
          {EMAIL}
        </a>
        <a className={styles.secondary} href="tel:+639684333479">
          +63 968 4333 479
        </a>
        <a className={styles.secondary} href="/IamjeonResume.pdf" target="_blank" rel="noopener">
          Résumé (PDF)
        </a>
      </div>
      <p className={styles.where}>Lapu-Lapu City, Cebu · working with clients in any time zone</p>
    </section>
  );
}
