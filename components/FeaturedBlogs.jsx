// components/FeaturedBlogs.jsx
import BlogCard from "./BlogCard";
import styles from "./FeaturedBlogs.module.css";

export default function FeaturedBlogs({ posts, title = "Featured blogs" }) {
  if (!posts.length) return null;

  return (
    <section className={styles.wrap} aria-label={title}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.badge}>Editors&apos; picks</span>
      </div>
      <div className={styles.scroller}>
        {posts.map((post) => (
          <div key={post.slug} className={styles.item}>
            <BlogCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
