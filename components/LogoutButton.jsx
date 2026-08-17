// components/LogoutButton.jsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ className }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <button type="button" className={className} onClick={handleLogout} disabled={loading}>
      {loading ? "Logging out…" : "Log out"}
    </button>
  );
}
