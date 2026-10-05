import type { Metadata } from "next";
import Link from "next/link";
import theatre from "@/content/theatre.json";
import styles from "./not-found.module.css";

export const metadata: Metadata = { title: "Nothing on this screen", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main-content" className={styles.lost}>
      <img className={styles.plate} src={theatre.film.last} alt="" />
      <div className={styles.copy}>
        <p className={styles.code}>404</p>
        <h1 className={`display ${styles.title}`}>Nothing on this screen</h1>
        <p className={styles.line}>The page you asked for was never built, or it moved. The desk is still lit.</p>
        <Link href="/" className={styles.back}>
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
