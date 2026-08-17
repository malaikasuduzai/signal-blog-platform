// components/PrevNextNav.jsx
import Link from "next/link";
import styles from "./PrevNextNav.module.css";

export default function PrevNextNav({ prev, next }) {
  if (!prev && !next) return null;

  return (
    <nav className={styles.wrap} aria-label="Previous and next blog">
      {prev ? (
        <Link href={`/blogs/${prev.slug}`} className={`${styles.side} ${styles.prev}`}>
          <span className={styles.direction}>← Previous</span>
          <span className={styles.postTitle}>{prev.title}</span>
        </Link>
      ) : (
        <span className={styles.side} />
      )}
      {next ? (
        <Link href={`/blogs/${next.slug}`} className={`${styles.side} ${styles.next}`}>
          <span className={styles.direction}>Next →</span>
          <span className={styles.postTitle}>{next.title}</span>
        </Link>
      ) : (
        <span className={styles.side} />
      )}
    </nav>
  );
}
