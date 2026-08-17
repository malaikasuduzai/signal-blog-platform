// components/SubmitBlogForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SubmitBlogForm.module.css";

// Handles both creating a new blog and editing an existing draft.
// Pass `blog` (with an `id`) to edit in place; omit it to create new.
export default function SubmitBlogForm({ categories, blog }) {
  const router = useRouter();
  const isEdit = Boolean(blog?.id);

  const [values, setValues] = useState({
    title: blog?.title || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content?.[0]?.text || "",
    category: blog?.category?.slug || categories[0]?.slug || "",
    featuredImage: blog?.featuredImage || "",
    references: (blog?.references || [])
      .map((r) => (r.url ? `${r.title} | ${r.url}` : r.title))
      .join("\n"),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(""); // "" | "draft" | "review"

  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function save(status, intent) {
    setFormError("");
    setFieldErrors({});
    setSuccess("");
    setSubmitting(intent);

    try {
      const url = isEdit ? `/api/blogs/${blog.id}` : "/api/blogs";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, status }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong. Please try again.");
        setFieldErrors(data.fields || {});
        return;
      }

      setSuccess(
        status === "DRAFT" ? "Draft saved." : "Submitted for review! Redirecting…"
      );
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting("");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>{isEdit ? "Edit draft" : "New submission"}</p>
        <h1>{isEdit ? "Edit your draft" : "Submit a blog"}</h1>
      </div>

      <div className={styles.panel}>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            save("PENDING_REVIEW", "review");
          }}
        >
          {formError && <div className={styles.formError}>{formError}</div>}
          {success && <div className={styles.formSuccess}>{success}</div>}

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Basics</p>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="title">Blog title</label>
                <input id="title" type="text" value={values.title} onChange={update("title")} required />
                {fieldErrors.title && <span className={styles.fieldError}>{fieldErrors.title}</span>}
              </div>
            </div>

            <div className={styles.row} style={{ marginTop: 18 }}>
              <div className={styles.field}>
                <label htmlFor="excerpt">Short description</label>
                <textarea
                  id="excerpt"
                  rows={2}
                  value={values.excerpt}
                  onChange={update("excerpt")}
                  placeholder="One or two sentences for the blog card / listing page."
                />
                {fieldErrors.excerpt && <span className={styles.fieldError}>{fieldErrors.excerpt}</span>}
              </div>
            </div>

            <div className={`${styles.row} ${styles.twoCol}`} style={{ marginTop: 18 }}>
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
                <label htmlFor="featuredImage">
                  Featured image URL <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="featuredImage"
                  type="url"
                  value={values.featuredImage}
                  onChange={update("featuredImage")}
                  placeholder="https://…"
                />
                <span className={styles.hint}>Image upload comes later — a URL works for now.</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Content</p>

            <div className={`${styles.row} ${styles.contentField}`}>
              <div className={styles.field}>
                <label htmlFor="content">Blog content</label>
                <textarea
                  id="content"
                  rows={14}
                  value={values.content}
                  onChange={update("content")}
                  placeholder="Write the full article here."
                />
                {fieldErrors.content && <span className={styles.fieldError}>{fieldErrors.content}</span>}
              </div>
            </div>

            <div className={styles.row} style={{ marginTop: 18 }}>
              <div className={styles.field}>
                <label htmlFor="references">
                  References <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="references"
                  rows={3}
                  value={values.references}
                  onChange={update("references")}
                  placeholder={"One per line, as: Source name | https://example.com"}
                />
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.ghostBtn}
              disabled={submitting !== ""}
              onClick={() => save("DRAFT", "draft")}
            >
              {submitting === "draft" ? "Saving…" : "Save as draft"}
            </button>
            <button className={styles.primaryBtn} type="submit" disabled={submitting !== ""}>
              {submitting === "review" ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
