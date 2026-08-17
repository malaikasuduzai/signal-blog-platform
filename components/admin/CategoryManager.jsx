// components/admin/CategoryManager.jsx
// Day 5 -- Category Management (PRD §4): create, rename/recolor, and
// delete categories. A category can't be deleted while blogs still use
// it (enforced server-side too, in case of a race).

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../app/admin/admin.module.css";

const SWATCHES = ["#332E8C", "#8B3FA8", "#1D7A6E", "#C57E22", "#B23A3A", "#2A5DB0", "#946C3E", "#3E8E5B", "#C24E82", "#4C7A3E"];

export default function CategoryManager({ categories }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(SWATCHES[0]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", color: "" });
  const [busyId, setBusyId] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (data.fields && Object.values(data.fields)[0]) || "Couldn't create category.");
        return;
      }
      setName("");
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditValues({ name: cat.name, color: cat.color || SWATCHES[0] });
  }

  async function saveEdit(id) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Couldn't save changes.");
        return;
      }
      setEditingId(null);
      router.refresh();
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    setBusyId(cat.id);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Couldn't delete this category.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId("");
    }
  }

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Add a category</h2>
        </div>
        <form className={styles.panelBody} onSubmit={handleCreate} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          {error && <div className={styles.formError} style={{ flexBasis: "100%" }}>{error}</div>}
          <div className={styles.field} style={{ minWidth: 220 }}>
            <label htmlFor="catName">Category name</label>
            <input id="catName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DevOps" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="catColor">Accent color</label>
            <select id="catColor" value={color} onChange={(e) => setColor(e.target.value)} className={styles.select}>
              {SWATCHES.map((sw) => (
                <option key={sw} value={sw}>
                  {sw}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={creating}>
            {creating ? "Adding…" : "+ Add category"}
          </button>
        </form>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>All categories ({categories.length})</h2>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <div className={styles.categoryCard} key={cat.id}>
                {editingId === cat.id ? (
                  <>
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                      style={{ padding: 6, borderRadius: 6, border: "1px solid var(--color-border)", font: "inherit" }}
                    />
                    <select
                      value={editValues.color}
                      onChange={(e) => setEditValues((v) => ({ ...v, color: e.target.value }))}
                      className={styles.select}
                    >
                      {SWATCHES.map((sw) => (
                        <option key={sw} value={sw}>
                          {sw}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                        onClick={() => saveEdit(cat.id)}
                        disabled={busyId === cat.id}
                      >
                        Save
                      </button>
                      <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.categoryCardTop}>
                      <span className={styles.categoryName}>
                        <span className={styles.colorSwatch} style={{ background: cat.color || "#ccc" }} />
                        {cat.name}
                      </span>
                    </div>
                    <span className={styles.categoryCount}>{cat._count?.blogs ?? 0} blog(s)</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => startEdit(cat)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                        onClick={() => handleDelete(cat)}
                        disabled={busyId === cat.id}
                      >
                        {busyId === cat.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
