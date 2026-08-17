// components/admin/ReviewActions.jsx
// Day 5 -- the Approve / Reject / Request Changes controls on the full
// pending-blog review page (PRD §8). Reject and Request Changes both
// attach a note the author sees on their dashboard; the only difference
// is the resulting status (REJECTED vs. sending back to DRAFT so they
// can revise and resubmit).

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../app/admin/admin.module.css";

export default function ReviewActions({ blogId }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function act(status, key) {
    setError("");
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionNote: note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push("/admin/pending");
      router.refresh();
    } finally {
      setBusy("");
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Decision</h2>
      </div>
      <div className={styles.panelBody} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {error && <div className={styles.formError}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="note">Note to author (optional, shown on reject / request changes)</label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Please add a source for the statistics in paragraph 3."
          />
        </div>

        <button
          type="button"
          className={`${styles.btn} ${styles.btnSuccess}`}
          disabled={busy !== ""}
          onClick={() => act("PUBLISHED", "approve")}
        >
          {busy === "approve" ? "Approving…" : "✓ Approve & publish"}
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnAmber}`}
          disabled={busy !== ""}
          onClick={() => act("DRAFT", "changes")}
        >
          {busy === "changes" ? "Sending back…" : "↩ Request changes"}
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnDanger}`}
          disabled={busy !== ""}
          onClick={() => act("REJECTED", "reject")}
        >
          {busy === "reject" ? "Rejecting…" : "✕ Reject"}
        </button>
      </div>
    </div>
  );
}
