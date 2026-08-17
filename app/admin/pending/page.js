// app/admin/pending/page.js
// Pending Submission Management (PRD §7/§8): every blog currently
// awaiting admin review, with a link into the full review page for each.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "../admin.module.css";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function PendingPage() {
  const blogs = await prisma.blog.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "asc" },
    include: { category: true, author: { select: { name: true, email: true, avatar: true } } },
  });

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Admin panel</p>
          <h1 className={styles.title}>Pending review</h1>
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className={styles.panel}>
          <div className={styles.empty}>
            Nothing pending -- every submission has been reviewed. 🎉
          </div>
        </div>
      ) : (
        <div className={styles.panel}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <div className={styles.titleCell}>
                        {blog.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={blog.featuredImage} alt="" className={styles.thumb} />
                        ) : (
                          <div className={`${styles.thumb} ${styles.thumbEmpty}`} title="No featured image yet">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                              <rect x="3" y="4" width="18" height="16" rx="2" />
                              <circle cx="9" cy="10" r="1.6" />
                              <path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.12 0L4 20" />
                            </svg>
                          </div>
                        )}
                        <div className={styles.titleCellText}>
                          <strong>{blog.title}</strong>
                          <span>{blog.excerpt?.slice(0, 60) || "No description yet"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {blog.author?.name}
                      <br />
                      <span className={styles.hint}>{blog.author?.email}</span>
                    </td>
                    <td>{blog.category?.name}</td>
                    <td>{formatDate(blog.createdAt)}</td>
                    <td>
                      <Link href={`/admin/pending/${blog.id}`} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
