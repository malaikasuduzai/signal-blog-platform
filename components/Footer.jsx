// components/Footer.jsx
"use client";

import Link from "next/link";
import { categories } from "@/lib/categories";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  const topCategories = categories.slice(0, 6);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark} aria-hidden="true" />
            Signal
          </Link>
          <p className={styles.tagline}>
            A blog about tech, code, and stuff worth reading.
          </p>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Explore</h3>
          <ul>
            <li><Link href="/blogs">All blogs</Link></li>
            <li><Link href="/search">Search</Link></li>
            <li><Link href="/categories">Categories</Link></li>
            <li><Link href="/register">Write for us</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Categories</h3>
          <ul>
            {topCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Newsletter</h3>
          <p className={styles.tagline}>Get new posts in your inbox.</p>
          <form className={styles.footerForm} onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="footer-email" className="visually-hidden">Email address</label>
            <input id="footer-email" type="email" placeholder="you@example.com" required />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {year} Signal. All rights reserved.</p>
      </div>
    </footer>
  );
}
