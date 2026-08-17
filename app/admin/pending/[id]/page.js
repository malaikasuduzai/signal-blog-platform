// app/admin/pending/[id]/page.js
// The full-article review view: complete blog, featured image, author
// info, references, alongside the Approve/Reject/Request-changes panel.

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewActions from "@/components/admin/ReviewActions";
import styles from "../../admin.module.css";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ReviewBlogPage({ params }) {
  const blog = await prisma.blog.findUnique({
    where: { id: params.id },
    include: { category: true, author: true },
  });

  if (!blog) notFound();

  const bodyText = Array.isArray(blog.content)
    ? blog.content.map((block) => block.text).filter(Boolean).join("\n\n")
    : "";
  const references = Array.isArray(blog.references) ? blog.references : [];

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Pending review</p>
          <h1 className={styles.title}>{blog.title}</h1>
          <p className={styles.subtitle}>
            Submitted {formatDate(blog.createdAt)} by {blog.author?.name}
          </p>
        </div>
        <span className={`${styles.badge} ${styles.badgePENDING_REVIEW}`}>Pending review</span>
      </div>

      <div className={styles.reviewLayout}>
        <div className={styles.articlePreview}>
          {blog.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={blog.featuredImage} alt="" />
          )}
          <p className={styles.hint} style={{ marginBottom: 8 }}>{blog.category?.name}</p>
          <h1>{blog.title}</h1>
          <p style={{ fontWeight: 600 }}>{blog.excerpt}</p>
          {bodyText
            .split("\n\n")
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}

          {references.length > 0 && (
            <>
              <h2 style={{ fontSize: "1.05rem", marginTop: 20, marginBottom: 10 }}>References</h2>
              <ul style={{ listStyle: "disc", paddingLeft: 20 }}>
                {references.map((ref, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {ref.url ? (
                      <a href={ref.url} target="_blank" rel="noreferrer" style={{ color: "var(--color-indigo)", fontWeight: 600 }}>
                        {ref.title || ref.url}
                      </a>
                    ) : (
                      ref.title
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className={styles.reviewSide}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Author</h2>
            </div>
            <div className={styles.panelBody}>
              <dl className={styles.metaList}>
                <div>
                  <dt>Name</dt>
                  <dd>{blog.author?.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{blog.author?.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{blog.author?.role}</dd>
                </div>
                <div>
                  <dt>Account status</dt>
                  <dd>{blog.author?.isActive ? "Active" : "Blocked"}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Submission details</h2>
            </div>
            <div className={styles.panelBody}>
              <dl className={styles.metaList}>
                <div>
                  <dt>Category</dt>
                  <dd>{blog.category?.name}</dd>
                </div>
                <div>
                  <dt>Featured image</dt>
                  <dd>{blog.featuredImage ? "Provided" : "None"}</dd>
                </div>
                <div>
                  <dt>References</dt>
                  <dd>{references.length} listed</dd>
                </div>
                <div>
                  <dt>Word count</dt>
                  <dd>{bodyText.split(/\s+/).filter(Boolean).length} words</dd>
                </div>
              </dl>
            </div>
          </div>

          <ReviewActions blogId={blog.id} />
        </div>
      </div>
    </div>
  );
}
