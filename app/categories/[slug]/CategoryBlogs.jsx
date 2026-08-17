"use client";

import { useEffect, useMemo, useState } from "react";
import BlogCard from "@/components/BlogCard";
import styles from "@/app/blogs/BlogListing.module.css";

const PAGE_SIZE = 6;

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most popular" },
  { value: "az", label: "Title A–Z" },
];

export default function CategoryBlogs({ category, posts }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  const filtered = useMemo(() => {
    let result = posts.filter((p) => p.category === category);

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    if (sort === "latest") {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === "popular") {
      sorted.sort((a, b) => Number(b.popular) - Number(a.popular));
    } else if (sort === "az") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [category, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container">
      <form
        className={styles.controls}
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={styles.searchWrap}>
          <label htmlFor="cat-search" className="visually-hidden">Search within this category</label>
          <input
            id="cat-search"
            type="search"
            className={styles.search}
            placeholder="Search within this category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 16L12.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <label htmlFor="cat-sort" className="visually-hidden">Sort blogs</label>
        <select id="cat-sort" className={styles.sort} value={sort} onChange={(e) => setSort(e.target.value)}>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
          ))}
        </select>
      </form>

      {currentPosts.length > 0 ? (
        <>
          <h2 className="visually-hidden">
            {query.trim() ? `Search results for "${query.trim()}"` : "Category articles"}
          </h2>
          <div className={styles.grid}>
            {currentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Category pages">
              <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === page ? styles.pageActive : ""}
                    onClick={() => setPage(n)}
                    aria-current={n === page ? "page" : undefined}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <h2>No blogs match your search</h2>
          <p>Try a different search term, or browse the full category list.</p>
          <button type="button" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
