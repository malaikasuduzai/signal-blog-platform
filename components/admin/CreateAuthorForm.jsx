"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../app/admin/admin.module.css";

const initialForm = { name: "", email: "", password: "", bio: "" };

export default function CreateAuthorForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Could not create this author.");
        return;
      }
      router.push(`/admin/users/${data.author.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.authorForm} onSubmit={handleSubmit}>
      <div className={styles.formIntro}>
        <div>
          <p className={styles.eyebrow}>New contributor</p>
          <h2>Create an author profile</h2>
          <p>Give the contributor a clear identity before assigning their first article.</p>
        </div>
        <span className={styles.formStep}>01 / 01</span>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="author-name">Full name</label>
          <input id="author-name" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Nadia Rahman" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="author-email">Work email</label>
          <input id="author-email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="nadia@signal.local" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="author-password">Temporary password</label>
          <input id="author-password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 8 characters" minLength={8} required />
          <span className={styles.hint}>Share this securely and ask the author to change it after their first login.</span>
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor="author-bio">Short bio <span className={styles.optionalLabel}>Optional · 320 characters</span></label>
          <textarea id="author-bio" value={form.bio} onChange={(event) => update("bio", event.target.value)} placeholder="What does this author bring to the publication?" maxLength={320} rows={4} />
          <span className={styles.characterCount}>{form.bio.length} / 320</span>
        </div>
        {error && <p className={styles.formError}>{error}</p>}
      </div>

      <div className={styles.formFooter}>
        <Link href="/admin/users" className={`${styles.btn} ${styles.btnGhost}`}>Cancel</Link>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy}>
          {busy ? "Creating author…" : "Create author"}
        </button>
      </div>
    </form>
  );
}
