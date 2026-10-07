/**
 * Behind the desk — the camera turns from the screens to the person.
 * A quiet, readable chapter: story, path, and the kit.
 */

import { WarmTitle } from "@/components/ui/WarmTitle";
import { ABOUT_LEAD, ABOUT_STORY, KIT, PATH } from "@/content/about";
import styles from "./BehindTheDesk.module.css";

export function BehindTheDesk() {
  return (
    <section id="about" className={styles.about} aria-labelledby="about-title">
      <div className={`wrap ${styles.grid}`}>
        <figure className={styles.portrait}>
          <img src="/media/me/me-about.webp" width={960} height={638} alt="Loreto “Jeon” Saquilabon Jr. at his desk" loading="lazy" />
          <div className={styles.glow} aria-hidden="true" />
        </figure>
        <div className={styles.text}>
          <WarmTitle as="h2" className={styles.title}>
            <span id="about-title">Behind the desk</span>
          </WarmTitle>
          <p className={styles.lead}>{ABOUT_LEAD}</p>
          <p className="dim">{ABOUT_STORY}</p>

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
