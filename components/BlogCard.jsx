// components/BlogCard.jsx
import Image from "next/image";
import Link from "next/link";
import CategoryPill from "./CategoryPill";
import AuthorAvatar from "./AuthorAvatar";
import styles from "./BlogCard.module.css";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogCard({ post, variant = "default", rank }) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <article className={`${styles.card} ${isFeatured ? styles.featured : ""} ${isCompact ? styles.compact : ""}`}>
      <Link href={`/blogs/${post.slug}`} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
        <div className={styles.imageWrap}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes={isFeatured ? "(max-width: 760px) 100vw, 60vw" : "(max-width: 640px) 100vw, 33vw"}
            className={styles.image}
          />
        </div>
      </Link>

      <div className={styles.body}>
        <div className={styles.categoryRow}>
          <CategoryPill slug={post.category} size="sm" asLink={false} />
        </div>

        <h3 className={styles.title}>
          <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
        </h3>

        {!isCompact && <p className={styles.excerpt}>{post.excerpt}</p>}

        <div className={styles.meta}>
          <AuthorAvatar name={post.author.name} size={24} className={styles.avatar} />
          <span className={styles.authorName}>{post.author.name}</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span>{post.readingTime} min read</span>
        </div>

        <Link
          href={`/blogs/${post.slug}`}
          className={`${styles.readMore} ${isCompact ? styles.readMoreCompact : styles.readMoreButton}`}
        >
          Read article
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
