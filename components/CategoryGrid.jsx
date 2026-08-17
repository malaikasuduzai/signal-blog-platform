// components/CategoryGrid.jsx
import Link from "next/link";
import { categories } from "@/lib/categories";
import { getCategoryPostCounts } from "@/lib/posts";
import styles from "./CategoryGrid.module.css";

export default async function CategoryGrid() {
  const counts = await getCategoryPostCounts();
  return (
    <div className={styles.grid}>
      {categories.map((c) => {
        const count = counts[c.slug] || 0;
        return (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className={styles.tile}
            style={{ "--accent": c.color }}
          >
            <span className={styles.badge} aria-hidden="true">
              {c.name.charAt(0)}
            </span>
            <span className={styles.name}>{c.name}</span>
            <span className={styles.count}>
              {count} article{count === 1 ? "" : "s"}
            </span>
            <span className={styles.arrow} aria-hidden="true">→</span>
          </Link>
        );
      })}
    </div>
  );
}
