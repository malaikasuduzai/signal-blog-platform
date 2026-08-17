// app/admin/page.js
// Admin Dashboard (PRD §9): stat tiles + a quick look at recent
// submissions. Queries prisma directly (same pattern as the Day 4 author
// dashboard) rather than round-tripping through /api/admin/stats.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./admin.module.css";

const STATUS_LABEL = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminDashboardPage() {
  const [
    totalBlogs,
    published,
    pending,
    rejected,
    totalAuthors,
    totalUsers,
    totalCategories,
    recentSubmissions,
  ] = await Promise.all([
    prisma.blog.count(),
    prisma.blog.count({ where: { status: "PUBLISHED" } }),
    prisma.blog.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.blog.count({ where: { status: "REJECTED" } }),
    prisma.user.count({ where: { role: "AUTHOR" } }),
    prisma.user.count(),
    prisma.category.count(),
    prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { category: true, author: { select: { name: true } } },
    }),
  ]);

  const tiles = [
    { label: "Total blogs", value: totalBlogs, accent: "" },
    { label: "Published", value: published, accent: styles.accentGreen },
    { label: "Pending review", value: pending, accent: styles.accentAmber },
    { label: "Rejected", value: rejected, accent: styles.accentRed },
    { label: "Total authors", value: totalAuthors, accent: "" },
    { label: "Total users", value: totalUsers, accent: "" },
    { label: "Categories", value: totalCategories, accent: "" },
  ];

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Admin panel</p>
          <h1 className={styles.title}>Dashboard</h1>
        </div>
        <Link href="/admin/blogs/new" className={styles.btn + " " + styles.btnPrimary}>
          + Add blog
        </Link>
      </div>

      <div className={styles.statsGrid}>
        {tiles.map((t) => (
          <div key={t.label} className={`${styles.statCard} ${t.accent}`}>
            <div className={styles.statLabel}>{t.label}</div>
            <div className={styles.statValue}>{t.value}</div>
          </div>
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Recent submissions</h2>
          <Link href="/admin/blogs" className={styles.btn + " " + styles.btnGhost + " " + styles.btnSm}>
            View all blogs
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className={styles.empty}>No blogs yet.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <div className={styles.titleCellText}>
                        <strong>{blog.title}</strong>
                      </div>
                    </td>
                    <td>{blog.author?.name}</td>
                    <td>{blog.category?.name}</td>
                    <td>
                      <span className={`${styles.badge} ${styles["badge" + blog.status]}`}>
                        {STATUS_LABEL[blog.status]}
                      </span>
                    </td>
                    <td>{formatDate(blog.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
