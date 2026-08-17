// app/admin/users/[id]/page.js
// View Author Submission History (PRD §11) -- everything one user has
// ever submitted, alongside their account status.

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UserActions from "@/components/admin/UserActions";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import styles from "../../admin.module.css";

const STATUS_LABEL = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
};
const ROLE_LABEL = { ADMIN: "Admin", AUTHOR: "Author", USER: "Visitor" };

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminUserDetailPage({ params }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      blogs: { orderBy: { createdAt: "desc" }, include: { category: true } },
    },
  });

  if (!user) notFound();

  const otherAuthors =
    user.role !== "ADMIN"
      ? await prisma.user.findMany({
          where: { role: { not: "ADMIN" }, id: { not: user.id } },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [];

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>
            <Link href="/admin/users">Authors</Link> / {user.name}
          </p>
          <h1 className={styles.title}>{user.name}</h1>
          <p className={styles.subtitle}>{user.email}</p>
        </div>
        {user.role !== "ADMIN" && (
          <div className={styles.rowActions}>
            <UserActions user={user} />
            <DeleteUserButton user={user} blogsCount={user.blogs.length} otherAuthors={otherAuthors} />
          </div>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Role</div>
          <div className={styles.statValue} style={{ fontSize: "1.2rem" }}>{ROLE_LABEL[user.role]}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Account status</div>
          <div className={styles.statValue} style={{ fontSize: "1.2rem" }}>{user.isActive ? "Active" : "Blocked"}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Joined</div>
          <div className={styles.statValue} style={{ fontSize: "1.2rem" }}>{formatDate(user.createdAt)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total submissions</div>
          <div className={styles.statValue}>{user.blogs.length}</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Submission history</h2>
        </div>
        {user.blogs.length === 0 ? (
          <div className={styles.empty}>This account hasn't submitted any blogs yet.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {user.blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <strong style={{ fontFamily: "var(--font-sans)" }}>{blog.title}</strong>
                    </td>
                    <td>{blog.category?.name}</td>
                    <td>
                      <span className={`${styles.badge} ${styles["badge" + blog.status]}`}>{STATUS_LABEL[blog.status]}</span>
                    </td>
                    <td>{formatDate(blog.createdAt)}</td>
                    <td>
                      <Link href={`/admin/blogs/${blog.id}/edit`} className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>
                        Edit
                      </Link>
                    </td>
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
