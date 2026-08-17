// components/SectionHeading.jsx
import Link from "next/link";
import styles from "./SectionHeading.module.css";

export default function SectionHeading({ eyebrow, title, action, id }) {
  return (
    <div className={styles.wrap} id={id}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 className={styles.title}>{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className={styles.action}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
