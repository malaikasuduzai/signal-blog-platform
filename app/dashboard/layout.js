// app/dashboard/layout.js
// middleware.js already guarantees a logged-in user reaches anything under
// /dashboard, so this just wraps every author page with the sidebar shell
// -- same shape as app/admin/layout.js.

import { getSessionUser } from "@/lib/auth";
import DashboardSidebar from "@/components/DashboardSidebar";
import styles from "./dashboard.module.css";

export const metadata = { title: "Author Dashboard — Signal", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }) {
  const session = await getSessionUser();

  return (
    <div className={styles.shell}>
      <DashboardSidebar user={session} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
