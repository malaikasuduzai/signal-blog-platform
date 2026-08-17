// components/admin/AdminBlogForm.jsx
// Day 5 -- the admin's full-control blog editor: unlike the author-facing
// SubmitBlogForm (Day 4), this can reassign author/category, set any
// status directly, and toggle Featured/Popular placement.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../app/admin/admin.module.css";

const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PUBLISHED", label: "Published" },
];

export default function AdminBlogForm({ categories, authors, blog }) {
  const router = useRouter();
  const isEdit = Boolean(blog?.id);

  const [values, setValues] = useState({
    title: blog?.title || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content?.[0]?.text || "",
    category: blog?.category?.slug || categories[0]?.slug || "",
    authorId: blog?.authorId || authors[0]?.id || "",
    featuredImage: blog?.featuredImage || "",
    references: (blog?.references || [])
      .map((r) => (r.url ? `${r.title} | ${r.url}` : r.title))
      .join("\n"),
    status: blog?.status || "PENDING_REVIEW",
    featured: blog?.featured || false,
    popular: blog?.popular || false,
    rejectionNote: blog?.rejectionNote || "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field) {
    return (e) => {
      const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setValues((v) => ({ ...v, [field]: val }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSuccess("");
    setSaving(true);

    try {
      const url = isEdit ? `/api/admin/blogs/${blog.id}` : "/api/admin/blogs";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong. Please try again.");
        setFieldErrors(data.fields || {});
        return;
      }

      setSuccess(isEdit ? "Saved." : "Blog created.");
      setTimeout(() => {
        router.push("/admin/blogs");
        router.refresh();
      }, 600);
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <div className={styles.panelBody}>
        <div className={styles.formGrid}>
          {formError && <div className={styles.formError}>{formError}</div>}
          {success && <div className={styles.formSuccess}>{success}</div>}

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="title">Blog title</label>
            <input id="title" type="text" value={values.title} onChange={update("title")} required />
            {fieldErrors.title && <span className={styles.fieldError}>{fieldErrors.title}</span>}
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="excerpt">Short description</label>
            <textarea id="excerpt" rows={2} value={values.excerpt} onChange={update("excerpt")} />
            {fieldErrors.excerpt && <span className={styles.fieldError}>{fieldErrors.excerpt}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="category">Category</label>
            <select id="category" value={values.category} onChange={update("category")}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.category && <span className={styles.fieldError}>{fieldErrors.category}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="authorId">Author</label>
            <select id="authorId" value={values.authorId} onChange={update("authorId")}>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>
            {fieldErrors.authorId && <span className={styles.fieldError}>{fieldErrors.authorId}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="status">Status</label>
            <select id="status" value={values.status} onChange={update("status")}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="featuredImage">Featured image URL</label>
            <input id="featuredImage" type="url" value={values.featuredImage} onChange={update("featuredImage")} placeholder="https://…" />
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="content">Blog content</label>
            <textarea id="content" rows={14} value={values.content} onChange={update("content")} placeholder="Write the full article here." />
            {fieldErrors.content && <span className={styles.fieldError}>{fieldErrors.content}</span>}
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="references">References (optional)</label>
            <textarea
              id="references"
              rows={3}
              value={values.references}
              onChange={update("references")}
              placeholder={"One per line, as: Source name | https://example.com"}
            />
          </div>

          {values.status === "REJECTED" && (
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="rejectionNote">Rejection note (shown to the author)</label>
              <textarea id="rejectionNote" rows={2} value={values.rejectionNote} onChange={update("rejectionNote")} />
            </div>
          )}

          <div className={`${styles.field} ${styles.fieldFull}`} style={{ flexDirection: "row", gap: 24 }}>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={values.featured} onChange={update("featured")} />
              Featured on homepage
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={values.popular} onChange={update("popular")} />
              Mark as popular
            </label>
          </div>
        </div>
      </div>

      <div className={styles.panelHeader} style={{ borderTop: "1px solid var(--color-border)", borderBottom: "none" }}>
        <span className={styles.hint}>
          {isEdit ? "Changes save immediately to the live database." : "New blogs are created directly -- no review needed for admin-authored posts."}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => router.push("/admin/blogs")}>
            Cancel
          </button>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create blog"}
          </button>
        </div>
      </div>
    </form>
  );
}
