// app/categories/[slug]/page.js
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategory, categories } from "@/lib/categories";
import { getAllPublishedPosts } from "@/lib/posts";
import CategoryBlogs from "./CategoryBlogs";
import styles from "./category.module.css";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }) {
  const category = getCategory(params.slug);
  if (!category) return {};
  const description = `Articles about ${category.name} on Signal.`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      title: `${category.name} — Signal`,
      description,
      url: `/categories/${category.slug}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }) {
  const category = getCategory(params.slug);
  if (!category) notFound();
  const posts = await getAllPublishedPosts();

  return (
    <div className={styles.page}>
      <div className={`container ${styles.header}`}>
        <Link href="/categories" className={styles.back}>← All categories</Link>
        <div className={styles.titleRow}>
          <span className={styles.dot} style={{ background: category.color }} aria-hidden="true" />
          <h1 className={styles.title}>{category.name}</h1>
        </div>
      </div>
      <CategoryBlogs category={category.slug} posts={posts} />
    </div>
  );
}
