// app/dashboard/rejected/page.js
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import AuthorBlogList from "@/components/AuthorBlogList";
import styles from "../dashboard.module.css";

export const metadata = { title: "Rejected", robots: { index: false, follow: false } };

export default async function RejectedPage() {
  const session = await getSessionUser();
  const blogs = await prisma.blog.findMany({
    where: { authorId: session.sub, status: "REJECTED" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className={styles.listHead}>
        <div>
          <p className={styles.eyebrow}>Author panel</p>
          <h1>Rejected</h1>
        </div>
      </div>
      <AuthorBlogList blogs={blogs} emptyText="No rejected blogs — nice." />
    </div>
  );
}
