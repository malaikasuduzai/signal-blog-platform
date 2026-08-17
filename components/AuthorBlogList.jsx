// components/AuthorBlogList.jsx
import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";

const STATUS_LABEL = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AuthorBlogList({ blogs, emptyText, emptyCta }) {
  if (blogs.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <p>{emptyText}</p>
          {emptyCta && (
            <p>
              <Link href={emptyCta.href} style={{ color: "var(--color-indigo)", fontWeight: 600 }}>
                {emptyCta.label} →
              </Link>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelBody}>
        <div className={styles.list}>
          {blogs.map((blog) => (
            <div className={styles.row} key={blog.id}>
              <div className={styles.rowMain}>
                <h3>{blog.title}</h3>
                <p className={styles.rowMeta}>
                  {blog.category.name} · submitted {formatDate(blog.createdAt)}
                  {blog.status === "REJECTED" && blog.rejectionNote
                    ? ` · admin note: ${blog.rejectionNote}`
                    : ""}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {blog.status === "DRAFT" && (
                  <Link
                    href={`/dashboard/edit/${blog.id}`}
                    style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-indigo)" }}
                  >
                    Continue editing
                  </Link>
                )}
                <span className={`${styles.status} ${styles["status" + blog.status]}`}>
                  {STATUS_LABEL[blog.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
