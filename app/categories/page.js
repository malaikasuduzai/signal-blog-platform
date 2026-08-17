// app/categories/page.js
import CategoryGrid from "@/components/CategoryGrid";
import styles from "./categories.module.css";

export const metadata = {
  title: "Categories",
  description: "Browse every topic covered on Signal, from AI to productivity.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Categories — Signal",
    description: "Browse every topic covered on Signal, from AI to productivity.",
    url: "/categories",
    type: "website",
  },
};

export default function CategoriesPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Browse by topic</p>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.sub}>
            Every topic covered on Signal, from AI to productivity.
          </p>
        </div>
        <CategoryGrid />
      </div>
    </div>
  );
}
