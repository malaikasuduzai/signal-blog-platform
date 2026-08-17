// app/admin/categories/page.js

import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";
import styles from "../admin.module.css";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { blogs: true } } },
  });

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Admin panel</p>
          <h1 className={styles.title}>Categories</h1>
        </div>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
