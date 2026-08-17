// app/dashboard/pending/page.js
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import AuthorBlogList from "@/components/AuthorBlogList";
import styles from "../dashboard.module.css";

export const metadata = { title: "Pending review", robots: { index: false, follow: false } };

export default async function PendingPage() {
  const session = await getSessionUser();
  const blogs = await prisma.blog.findMany({
    where: { authorId: session.sub, status: "PENDING_REVIEW" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className={styles.listHead}>
        <div>
          <p className={styles.eyebrow}>Author panel</p>
          <h1>Pending review</h1>
        </div>
      </div>
      <AuthorBlogList blogs={blogs} emptyText="Nothing waiting on review right now." />
    </div>
  );
}
