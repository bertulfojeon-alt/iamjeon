/**
 * The case-file strip on classified projects. The bars are empty shapes: the
 * withheld words are never in the page, so "view source" reveals nothing.
 */

import styles from "./RedactionStrip.module.css";

const FIELDS = [
  { label: "Client", width: "11ch" },
  { label: "Product name", width: "8ch" },
  { label: "Live address", width: "17ch" },
];

export function RedactionStrip({ codename }: { codename: string }) {
  return (
    <aside className={styles.strip} aria-label="Case file details withheld">
      <p className={styles.note}>
        <strong>{codename}</strong> is shown under a codename. The client, product name and address are withheld; the
        system itself is described as built. A live walkthrough is available under NDA.
      </p>
      <dl className={styles.fields}>
        {FIELDS.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>
              <span className={styles.bar} style={{ width: f.width }} aria-label="withheld" role="img" />
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
