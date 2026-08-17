// components/RegisterForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./AuthForm.module.css";

export default function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    if (values.password !== values.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords don't match." });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong. Please try again.");
        setFieldErrors(data.fields || {});
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Author account</p>
      <h1>Create an account</h1>
      <p className={styles.sub}>
        Register to submit blogs for review. Every account starts as an
        author -- submissions go to the admin queue before they're published.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {formError && <div className={styles.formError}>{formError}</div>}

        <div className={styles.field}>
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={update("name")}
            required
          />
          {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
        </div>

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
          {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={update("password")}
            minLength={8}
            required
          />
          <span className={styles.hint}>At least 8 characters.</span>
          {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={update("confirmPassword")}
            minLength={8}
            required
          />
          {fieldErrors.confirmPassword && (
            <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>
          )}
        </div>

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className={styles.switch}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
