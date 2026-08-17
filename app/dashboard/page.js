// app/dashboard/page.js
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import styles from "./dashboard.module.css";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

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

export default async function DashboardPage() {
  const session = await getSessionUser();

  const [counts, recent] = await Promise.all([
    prisma.blog.groupBy({
      by: ["status"],
      where: { authorId: session.sub },
      _count: true,
    }),
    prisma.blog.findMany({
      where: { authorId: session.sub },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
  ]);

  const countFor = (status) => counts.find((c) => c.status === status)?._count || 0;

  const stats = [
    { label: "Drafts", value: countFor("DRAFT") },
    { label: "Pending review", value: countFor("PENDING_REVIEW") },
    { label: "Published", value: countFor("PUBLISHED") },
    { label: "Rejected", value: countFor("REJECTED") },
  ];

  return (
    <div>
      <div className={styles.overviewHead}>
        <div>
          <p className={styles.eyebrow}>Author panel</p>
          <h1 className={styles.greetingName}>{session?.name}</h1>
        </div>
        <Link href="/dashboard/submit" className={styles.primaryBtn}>
          + New blog
        </Link>
      </div>

      <div className={styles.statGrid}>
        {stats.map((s) => (
          <div className={styles.statCard} key={s.label}>
            <p className={styles.statNumber}>{s.value}</p>
            <p className={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <h2 className={styles.activityTitle}>Recent activity</h2>

          {recent.length === 0 ? (
            <div className={styles.activityEmpty}>
              <p>
                No blogs yet. <Link href="/dashboard/submit">Create your first one to get started.</Link>
              </p>
            </div>
          ) : (
            <div className={styles.activityList}>
              {recent.map((blog) => (
                <div className={styles.activityRow} key={blog.id}>
                  <div className={styles.activityMain}>
                    <h3>{blog.title}</h3>
                    <p className={styles.activityMeta}>
                      {blog.category.name} · {formatDate(blog.createdAt)}
                    </p>
                  </div>
                  <span className={`${styles.status} ${styles["status" + blog.status]}`}>
                    {STATUS_LABEL[blog.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
