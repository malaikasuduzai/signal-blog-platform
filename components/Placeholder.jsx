// components/Placeholder.jsx
// Shared "coming in a later day" notice for routes that exist in the PRD's
// page structure but are out of scope for the current build day.
import Link from "next/link";
import styles from "./Placeholder.module.css";

export default function Placeholder({ eyebrow, title, note, backHref = "/", backLabel = "← Back to homepage" }) {
  return (
    <div className={`container ${styles.wrap}`}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1>{title}</h1>
      <p className={styles.note}>{note}</p>
      <Link href={backHref} className={styles.back}>{backLabel}</Link>
    </div>
  );
}
