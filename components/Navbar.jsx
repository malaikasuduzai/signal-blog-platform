// components/Navbar.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
  { href: "/categories", label: "Categories" },
];

// A link is "active" for an exact match on "/", otherwise for any path
// that starts with it (so /blogs/my-post still highlights "Blogs").
function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const accountHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";
  const accountLabel = user?.role === "ADMIN" ? "Admin" : "Dashboard";

  // Small elevation cue once the page scrolls under the sticky bar --
  // keeps it feeling like a real app chrome instead of a flat strip.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          <span className={styles.logoMark} aria-hidden="true" />
          Signal
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <Link href="/search" className={styles.searchIcon} aria-label="Search blogs">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 16L12.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>
          {user ? (
            <>
              <Link href={accountHref} className={styles.loginLink}>
                {accountLabel}
              </Link>
              <LogoutButton className={styles.loginLink} />
            </>
          ) : (
            <Link href="/login" className={styles.loginLink}>
              Login
            </Link>
          )}
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="visually-hidden">Toggle menu</span>
            <span className={`${styles.bun} ${open ? styles.bunOpen : ""}`} />
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ""}`}
        aria-label="Mobile"
      >
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
        <Link href="/search" className={styles.mobileLink} onClick={() => setOpen(false)}>
          Search
        </Link>
        {user ? (
          <>
            <Link href={accountHref} className={styles.mobileCta} onClick={() => setOpen(false)}>
              {accountLabel}
            </Link>
            <LogoutButton className={styles.mobileLink} />
          </>
        ) : (
          <Link href="/login" className={styles.mobileCta} onClick={() => setOpen(false)}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
