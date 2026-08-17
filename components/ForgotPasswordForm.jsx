// components/ForgotPasswordForm.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./AuthForm.module.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>Check your email</p>
        <h1>Reset link sent</h1>
        <p className={styles.sub}>
          If an account exists for <strong>{email}</strong>, we've sent a link
          to reset your password. It expires in 1 hour.
        </p>

        {devResetUrl && (
          <div className={styles.formSuccess}>
            No email service is wired up yet in this build, so here's the
            link directly:{" "}
            <Link href={devResetUrl.replace(/^.*\/reset-password/, "/reset-password")}>
              Open reset link
            </Link>
          </div>
        )}

        <p className={styles.switch}>
          <Link href="/login">Back to log in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Reset your password</p>
      <h1>Forgot password</h1>
      <p className={styles.sub}>
        Enter the email on your account and we'll send you a link to reset
        your password.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {formError && <div className={styles.formError}>{formError}</div>}

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className={styles.switch}>
        <Link href="/login">Back to log in</Link>
      </p>
    </div>
  );
}
