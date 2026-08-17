// components/LoginForm.jsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./AuthForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [values, setValues] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong. Please try again.");
        return;
      }

      const destination = data.user?.role === "ADMIN" ? "/admin" : next;
      router.push(destination);
      router.refresh();
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Welcome back</p>
      <h1>Log in</h1>
      <p className={styles.sub}>Log in to submit blogs and track your review status.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {formError && <div className={styles.formError}>{formError}</div>}

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update("email")}
            required
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="password">Password</label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={update("password")}
            required
          />
        </div>

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className={styles.switch}>
        Don't have an account? <Link href="/register">Create one</Link>
      </p>
    </div>
  );
}
