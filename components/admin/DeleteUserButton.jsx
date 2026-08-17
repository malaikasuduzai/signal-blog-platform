// components/admin/DeleteUserButton.jsx
// Delete/reassign an author account. If they have blog(s), an inline
// picker asks which remaining author should take those posts over --
// the API refuses the delete otherwise, since Blog.author cascades on
// delete and would otherwise silently wipe their articles.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../app/admin/admin.module.css";

export default function DeleteUserButton({ user, blogsCount, otherAuthors }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reassignTo, setReassignTo] = useState(otherAuthors[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function doDelete(body) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Couldn't delete this account.");
        return;
      }
      router.push("/admin/users");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function handleClick() {
    if (blogsCount === 0) {
      if (confirm(`Permanently delete ${user.name}? This can't be undone.`)) doDelete();
      return;
    }
    setOpen(true);
  }

  if (open) {
    return (
      <div className={styles.reassignBox}>
        <p>
          {user.name} has {blogsCount} blog{blogsCount === 1 ? "" : "s"}. Reassign them to:
        </p>
        <div className={styles.reassignRow}>
          <select
            value={reassignTo}
            onChange={(e) => setReassignTo(e.target.value)}
            className={styles.select}
            disabled={busy || otherAuthors.length === 0}
          >
            {otherAuthors.length === 0 ? (
              <option value="">No other authors available</option>
            ) : (
              otherAuthors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
            disabled={busy || !reassignTo}
            onClick={() => doDelete({ reassignAuthorId: reassignTo })}
          >
            {busy ? "…" : "Reassign & delete"}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </div>
        {err && <p className={styles.fieldError}>{err}</p>}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
        onClick={handleClick}
        disabled={busy}
      >
        {busy ? "…" : "Delete"}
      </button>
      {err && <p className={styles.fieldError}>{err}</p>}
    </>
  );
}
