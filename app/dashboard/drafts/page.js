// app/dashboard/drafts/page.js
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import AuthorBlogList from "@/components/AuthorBlogList";
import styles from "../dashboard.module.css";

export const metadata = { title: "Drafts", robots: { index: false, follow: false } };

export default async function DraftsPage() {
  const session = await getSessionUser();
  const blogs = await prisma.blog.findMany({
    where: { authorId: session.sub, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className={styles.listHead}>
        <div>
          <p className={styles.eyebrow}>Author panel</p>
          <h1>Drafts</h1>
        </div>
        <Link href="/dashboard/submit" className={styles.primaryBtn}>
          + New blog
        </Link>
      </div>
      <AuthorBlogList
        blogs={blogs}
        emptyText="No drafts right now."
        emptyCta={{ href: "/dashboard/submit", label: "Start a new blog" }}
      />
    </div>
  );
}
