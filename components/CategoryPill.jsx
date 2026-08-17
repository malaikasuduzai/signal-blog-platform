// components/CategoryPill.jsx
import Link from "next/link";
import { getCategory } from "@/lib/categories";
import styles from "./CategoryPill.module.css";

export default function CategoryPill({ slug, size = "sm", asLink = true, active = false }) {
  const category = getCategory(slug);
  if (!category) return null;

  const content = (
    <span className={`${styles.pill} ${styles[size]} ${active ? styles.active : ""}`}>
      <span className={styles.dot} style={{ background: category.color }} aria-hidden="true" />
      {category.name}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href={`/categories/${category.slug}`} className={styles.link}>
      {content}
    </Link>
  );
}
