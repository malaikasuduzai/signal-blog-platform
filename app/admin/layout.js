// app/admin/layout.js
// middleware.js already keeps non-admins out of everything under /admin,
// so this just wraps every admin page with the sidebar shell.

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "./admin.module.css";

export const metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const session = await getSessionUser();
  const pendingCount = await prisma.blog.count({ where: { status: "PENDING_REVIEW" } });

  return (
    <div className={styles.shell}>
      <AdminSidebar user={session} pendingCount={pendingCount} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
