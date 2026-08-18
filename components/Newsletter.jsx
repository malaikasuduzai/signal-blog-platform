// components/Newsletter.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Newsletter.module.css";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  async function handleSubscribe(e) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Subscribed!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }
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

        <form className={styles.form} onSubmit={handleSubscribe}>
          <label htmlFor="cta-email" className="visually-hidden">Email address</label>
          <input
            id="cta-email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        {message && (
          <p className={styles.formMessage} data-status={status} role="status">
            {message}
          </p>
        )}
        <p className={styles.altAction}>Or just subscribe for new posts.</p>
      </div>
    </section>
  );
}
