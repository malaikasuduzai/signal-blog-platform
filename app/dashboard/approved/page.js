// app/dashboard/approved/page.js
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import AuthorBlogList from "@/components/AuthorBlogList";
import styles from "../dashboard.module.css";

export const metadata = { title: "Approved", robots: { index: false, follow: false } };

export default async function ApprovedPage() {
  const session = await getSessionUser();
  const blogs = await prisma.blog.findMany({
    where: { authorId: session.sub, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className={styles.listHead}>
        <div>
          <p className={styles.eyebrow}>Author panel</p>
          <h1>Approved</h1>
        </div>
      </div>
      <AuthorBlogList blogs={blogs} emptyText="No approved blogs yet." />
    </div>
  );
}
