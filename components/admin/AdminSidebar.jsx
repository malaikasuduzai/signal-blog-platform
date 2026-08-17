// components/admin/AdminSidebar.jsx
// Day 5 -- the Admin Panel's primary navigation. A client component only
// because it needs usePathname() to highlight the active section; the
// actual session/user data is passed down from the server layout.

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../../app/admin/admin.module.css";

const NAV = [
  {
    href: "/admin",
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
    href: "/admin/blogs",
    label: "Blog management",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <path d="M4 3.5h9L17 7v9.5a1 1 0 01-1 1H4a1 1 0 01-1-1v-12a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9h6M7 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/pending",
    label: "Pending review",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.6 2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    countKey: "pending",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <path d="M3 6.2L9.3 3a1.6 1.6 0 011.4 0L17 6.2v.1L10.7 9.5a1.6 1.6 0 01-1.4 0L3 6.3v-.1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 10l6.3 3.2a1.6 1.6 0 001.4 0L17 10M3 13.8l6.3 3.2a1.6 1.6 0 001.4 0L17 13.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Authors",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={styles.navIcon} aria-hidden="true">
        <circle cx="7.2" cy="6.5" r="2.7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 16.2c.6-3 2.4-4.5 4.7-4.5s4.1 1.5 4.7 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14.3" cy="7.2" r="2.1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12.6 11.9c1.7-.4 3.7.3 4.6 2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ user, pendingCount = 0 }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  // Below 900px admin.module.css hides the static sidebar entirely (it
  // doesn't fit alongside real dashboard content on a phone/tablet), so
  // this is the mobile replacement: a top bar with a menu button that
  // opens the same nav as a slide-in drawer. Above 900px these mobile-only
  // pieces stay display:none via CSS and the sidebar renders normally.
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
          <span className={styles.brandTag}>Admin panel</span>
        </span>
      </div>

      <nav className={styles.nav} aria-label="Admin">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
            >
              {item.icon}
              {item.label}
              {item.countKey === "pending" && pendingCount > 0 && (
                <span className={styles.navCount}>{pendingCount}</span>
              )}
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
          Admin panel
        </span>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
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
              aria-label="Close admin menu"
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
