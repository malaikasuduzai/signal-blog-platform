// components/DashboardSidebar.jsx
// Author panel's primary navigation -- mirrors components/admin/AdminSidebar.jsx
// (same gradient shell, mobile drawer pattern, sidebar foot) so the two
// panels feel like the same product instead of two different apps.

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../app/dashboard/dashboard.module.css";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/dashboard/my-blogs",
    label: "My Blogs",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <path d="M4 3.5h9L17 7v9.5a1 1 0 01-1 1H4a1 1 0 01-1-1v-12a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9h6M7 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/submit",
    label: "Create Blog",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/drafts",
    label: "Drafts",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <path d="M5 3.5h7.5L16 7v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1v-12a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.4 2" />
      </svg>
    ),
  },
  {
    href: "/dashboard/pending",
    label: "Pending",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.6 2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/approved",
    label: "Approved",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.8 10.2l2.1 2.1 4.3-4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/rejected",
    label: "Rejected",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.8 7.8l4.4 4.4M12.2 7.8l-4.4 4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function DashboardSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);

  const initial = (user?.name || "A").trim().charAt(0).toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  const sidebarContent = (
    <>
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true" />
        <span>
          Signal
          <span className={styles.brandTag}>Author panel</span>
        </span>
      </div>

      <nav className={styles.nav} aria-label="Author dashboard">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarDivider} />

      <div className={styles.sidebarFoot}>
        <div className={styles.sidebarUser}>
          <span className={styles.sidebarUserAvatar}>{initial}</span>
          <div>
            <div className={styles.sidebarUserName}>{user?.name}</div>
            <div className={styles.sidebarUserRole}>{user?.email}</div>
          </div>
        </div>
        <Link href="/" className={styles.viewSiteLink}>
          ↗ View live site
        </Link>
        <button type="button" className={styles.sidebarLogout} onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className={styles.mobileBar}>
        <span className={styles.mobileBrand}>
          <span className={styles.brandMark} aria-hidden="true" />
          Author panel
        </span>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setOpen(true)}
          aria-label="Open author menu"
          aria-expanded={open}
        >
          <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <aside className={styles.sidebar}>{sidebarContent}</aside>

      {open && (
        <div className={styles.mobileDrawerBackdrop} onClick={() => setOpen(false)}>
          <aside
            className={`${styles.sidebar} ${styles.mobileDrawer}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.mobileDrawerClose}
              onClick={() => setOpen(false)}
              aria-label="Close author menu"
            >
              ✕
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
