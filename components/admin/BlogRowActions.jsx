// components/admin/BlogRowActions.jsx
// Day 5 -- the action buttons on each row of Blog Management / Pending
// Review. Context-sensitive: which buttons show depends on the blog's
// current status, matching the status machine in the PRD (§8, §10).

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../../app/admin/admin.module.css";

export default function BlogRowActions({ blog, compact = false }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function patch(data, key) {
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error || "Something went wrong.");
        return;
      }
      router.refresh();
    } finally {
      setBusy("");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${blog.title}"? This can't be undone.`)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error || "Couldn't delete this blog.");
        return;
      }
      router.refresh();
    } finally {
      setBusy("");
    }
  }

  async function handleReject() {
    const note = prompt("Optional note for the author on why this was rejected:") || "";
    patch({ status: "REJECTED", rejectionNote: note }, "reject");
  }

  return (
    <div className={styles.rowActions}>
      <Link
        href={`/admin/blogs/${blog.id}/edit`}
        className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
      >
        Edit
      </Link>

      {blog.status === "PENDING_REVIEW" && (
        <>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
            disabled={busy !== ""}
            onClick={() => patch({ status: "APPROVED" }, "approve")}
          >
            {busy === "approve" ? "Approving…" : "Approve"}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
            disabled={busy !== ""}
            onClick={handleReject}
          >
            {busy === "reject" ? "Rejecting…" : "Reject"}
          </button>
        </>
      )}

      {blog.status === "APPROVED" && (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
          disabled={busy !== ""}
          onClick={() => patch({ status: "PUBLISHED" }, "publish")}
        >
          {busy === "publish" ? "Publishing…" : "Publish"}
        </button>
      )}

      {blog.status === "PUBLISHED" && !compact && (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnAmber} ${styles.btnSm}`}
          disabled={busy !== ""}
          onClick={() => patch({ status: "APPROVED" }, "unpublish")}
        >
          {busy === "unpublish" ? "Unpublishing…" : "Unpublish"}
        </button>
      )}

      {blog.status === "REJECTED" && !compact && (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
          disabled={busy !== ""}
          onClick={() => patch({ status: "APPROVED" }, "approve")}
        >
          {busy === "approve" ? "Approving…" : "Approve"}
        </button>
      )}

      <button
        type="button"
        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
        disabled={busy !== ""}
        onClick={handleDelete}
      >
        {busy === "delete" ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
