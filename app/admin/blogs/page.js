// app/admin/blogs/page.js
// Blog Management (PRD §10): every blog, any status, any author, with
// search/filter/sort and full row actions. A plain GET <form> drives the
// filters so the page works without client JS -- only the row action
// buttons (approve/reject/publish/delete) need interactivity.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BlogRowActions from "@/components/admin/BlogRowActions";
import styles from "../admin.module.css";

const STATUS_LABEL = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
};
const VALID_STATUSES = Object.keys(STATUS_LABEL);

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminBlogsPage({ searchParams }) {
  const q = (searchParams?.q || "").trim();
  const status = VALID_STATUSES.includes(searchParams?.status) ? searchParams.status : "";
  const category = searchParams?.category || "";
  const sort = searchParams?.sort || "newest";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));
  const PAGE_SIZE_OPTIONS = ["12", "25", "50", "all"];
  const perPageParam = PAGE_SIZE_OPTIONS.includes(searchParams?.perPage) ? searchParams.perPage : "25";
  const showAll = perPageParam === "all";
  const pageSize = showAll ? undefined : parseInt(perPageParam, 10);

  const where = {};
  if (status) where.status = status;
  if (category) where.category = { slug: category };
  if (q) where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }];

  const orderBy =
    sort === "oldest" ? { createdAt: "asc" } : sort === "title" ? { title: "asc" } : { createdAt: "desc" };

  const [blogs, total, categories] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy,
      ...(showAll ? {} : { skip: (page - 1) * pageSize, take: pageSize }),
      include: { category: true, author: { select: { name: true } } },
    }),
    prisma.blog.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = showAll ? 1 : Math.max(1, Math.ceil(total / pageSize));

  function pageHref(n) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (perPageParam !== "25") params.set("perPage", perPageParam);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return `/admin/blogs${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Admin panel</p>
          <h1 className={styles.title}>Blog management</h1>
        </div>
        <Link href="/admin/blogs/new" className={`${styles.btn} ${styles.btnPrimary}`}>
          + Add blog
        </Link>
      </div>

      <div className={styles.panel}>
        <form className={styles.filterBar} method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search title or description…"
            className={styles.searchInput}
          />
          <select name="status" defaultValue={status} className={styles.select}>
            <option value="">All statuses</option>
            {VALID_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select name="category" defaultValue={category} className={styles.select}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={sort} className={styles.select}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
          <select name="perPage" defaultValue={perPageParam} className={styles.select}>
            <option value="12">12 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="all">Show all</option>
          </select>
          <button type="submit" className={`${styles.btn} ${styles.btnGhost}`}>
            Apply
          </button>
          {(q || status || category || sort !== "newest" || perPageParam !== "25") && (
            <Link href="/admin/blogs" className={`${styles.btn} ${styles.btnGhost}`}>
              Reset
            </Link>
          )}
        </form>

        <div className={styles.resultsBar}>
          <span>
            {total} blog{total === 1 ? "" : "s"} {(q || status || category) ? "match your filters" : "in total"}
            {!showAll && total > 0 ? ` — showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)}` : ""}
          </span>
        </div>

        {blogs.length === 0 ? (
          <div className={styles.empty}>No blogs match those filters.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <div className={styles.titleCell}>
                        {blog.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={blog.featuredImage} alt="" className={styles.thumb} />
                        ) : (
                          <div className={`${styles.thumb} ${styles.thumbEmpty}`} title="No featured image yet">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                              <rect x="3" y="4" width="18" height="16" rx="2" />
                              <circle cx="9" cy="10" r="1.6" />
                              <path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.12 0L4 20" />
                            </svg>
                          </div>
                        )}
                        <div className={styles.titleCellText}>
                          <strong>{blog.title}</strong>
                          <span>/blogs/{blog.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>{blog.author?.name}</td>
                    <td>{blog.category?.name}</td>
                    <td>
                      <span className={`${styles.badge} ${styles["badge" + blog.status]}`}>
                        {STATUS_LABEL[blog.status]}
                      </span>
                    </td>
                    <td>{formatDate(blog.createdAt)}</td>
                    <td>
                      <BlogRowActions blog={{ id: blog.id, title: blog.title, status: blog.status }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Link
              href={pageHref(Math.max(1, page - 1))}
              className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
              aria-disabled={page <= 1}
              style={page <= 1 ? { pointerEvents: "none", opacity: 0.5 } : undefined}
            >
              ← Prev
            </Link>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <Link
              href={pageHref(Math.min(totalPages, page + 1))}
              className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
              aria-disabled={page >= totalPages}
              style={page >= totalPages ? { pointerEvents: "none", opacity: 0.5 } : undefined}
            >
              Next →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
