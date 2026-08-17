// app/admin/blogs/new/page.js

import { prisma } from "@/lib/prisma";
import AdminBlogForm from "@/components/admin/AdminBlogForm";
import styles from "../../admin.module.css";

export default async function NewBlogPage() {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
  ]);

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Blog management</p>
          <h1 className={styles.title}>Add a new blog</h1>
        </div>
      </div>
      <AdminBlogForm categories={categories} authors={authors} />
    </div>
  );
}
