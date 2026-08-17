// components/ResetPasswordForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./AuthForm.module.css";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...values }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>All set</p>
        <h1>Password updated</h1>
        <div className={styles.formSuccess}>
          Your password has been changed. Taking you to log in…
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Reset your password</p>
      <h1>Choose a new password</h1>
      <p className={styles.sub}>Make it at least 8 characters.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {formError && <div className={styles.formError}>{formError}</div>}

        <div className={styles.field}>
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={update("password")}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={update("confirmPassword")}
            required
          />
        </div>

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>

      <p className={styles.switch}>
        <Link href="/login">Back to log in</Link>
      </p>
    </div>
  );
}
