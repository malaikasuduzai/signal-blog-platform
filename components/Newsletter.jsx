// components/Newsletter.jsx
"use client";

import Link from "next/link";
import styles from "./Newsletter.module.css";

export default function Newsletter() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Call to action</p>
          <h2 className={styles.title}>Want to write for us?</h2>
          <p className={styles.sub}>
            Make an account and submit your blog. If it gets approved by
            the admin, it goes live on the site.
          </p>
        </div>
        <Link href="/register" className={styles.primaryCta}>
          Create an account
        </Link>

        <div className={styles.divider} aria-hidden="true" />

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="cta-email" className="visually-hidden">Email address</label>
          <input id="cta-email" type="email" placeholder="you@example.com" required />
          <button type="submit">Subscribe</button>
        </form>
        <p className={styles.altAction}>Or just subscribe for new posts.</p>
      </div>
    </section>
  );
}
