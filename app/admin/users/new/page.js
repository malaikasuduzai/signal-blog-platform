import Link from "next/link";
import CreateAuthorForm from "@/components/admin/CreateAuthorForm";
import styles from "../../admin.module.css";

export const metadata = {
  title: "Add author · Admin Panel",
  robots: { index: false, follow: false },
};

export default function NewAuthorPage() {
  return (
    <div>
      <div className={styles.breadcrumbs}>
        <Link href="/admin/users">Authors</Link>
        <span aria-hidden="true">/</span>
        <span>Add author</span>
      </div>
      <CreateAuthorForm />
    </div>
  );
}
