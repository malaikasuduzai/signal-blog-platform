// app/dashboard/my-blogs/page.js
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import AuthorBlogList from "@/components/AuthorBlogList";
import styles from "../dashboard.module.css";

export const metadata = { title: "My Blogs", robots: { index: false, follow: false } };

export default async function MyBlogsPage() {
  const session = await getSessionUser();
  const blogs = await prisma.blog.findMany({
    where: { authorId: session.sub },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className={styles.listHead}>
        <div>
          <p className={styles.eyebrow}>Author panel</p>
          <h1>My Blogs</h1>
        </div>
        <Link href="/dashboard/submit" className={styles.primaryBtn}>
          + New blog
        </Link>
      </div>
      <AuthorBlogList
        blogs={blogs}
        emptyText="You haven't submitted any blogs yet."
        emptyCta={{ href: "/dashboard/submit", label: "Submit your first one" }}
      />
    </div>
  );
}
