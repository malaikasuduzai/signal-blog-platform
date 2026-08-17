// components/RelatedBlogs.jsx
import BlogCard from "./BlogCard";
import styles from "./RelatedBlogs.module.css";

export default function RelatedBlogs({ posts }) {
  if (!posts.length) return null;

  return (
    <aside className={styles.wrap} aria-label="Related blogs">
      <h2 className={styles.title}>Related blogs</h2>
      <div className={styles.list}>
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} variant="compact" />
        ))}
      </div>
    </aside>
  );
}
