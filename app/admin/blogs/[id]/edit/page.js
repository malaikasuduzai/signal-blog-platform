// app/admin/blogs/[id]/edit/page.js

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminBlogForm from "@/components/admin/AdminBlogForm";
import styles from "../../../admin.module.css";

export default async function EditBlogPage({ params }) {
  const [blog, categories, authors] = await Promise.all([
    prisma.blog.findUnique({ where: { id: params.id }, include: { category: true, author: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
  ]);

  if (!blog) notFound();

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Blog management</p>
          <h1 className={styles.title}>Edit blog</h1>
          <p className={styles.subtitle}>{blog.title}</p>
        </div>
      </div>
      <AdminBlogForm categories={categories} authors={authors} blog={blog} />
    </div>
  );
}
