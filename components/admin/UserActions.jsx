// components/admin/UserActions.jsx
// Day 5 -- Block/Deactivate Users (PRD §11). A blocked user's existing
// session stays valid until it expires (see middleware.js's comment),
// but new logins and API auth checks that matter respect isActive.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../app/admin/admin.module.css";

export default function UserActions({ user }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleActive() {
    const action = user.isActive ? "block" : "unblock";
    if (user.isActive && !confirm(`Block ${user.name}? They won't be able to log in.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || `Couldn't ${action} this user.`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${styles.btnSm} ${user.isActive ? styles.btnDanger : styles.btnSuccess}`}
      onClick={toggleActive}
      disabled={busy}
    >
      {busy ? "…" : user.isActive ? "Block" : "Unblock"}
    </button>
  );
}
