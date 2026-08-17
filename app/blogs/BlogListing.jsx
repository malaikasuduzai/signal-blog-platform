"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import CategoryPill from "@/components/CategoryPill";
import FeaturedBlogs from "@/components/FeaturedBlogs";
import { categories } from "@/lib/categories";
import styles from "./BlogListing.module.css";

const PAGE_SIZE = 6;

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most popular" },
  { value: "az", label: "Title A–Z" },
];

export default function BlogListing({ posts }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, query, sort]);

  // The "Featured blogs" strip is a fixed, hand-picked set (editors'
  // picks) -- it isn't part of what gets reordered. Pin it only while
  // the listing is at its true default state (no search/category/sort
  // applied). The moment someone picks a different sort, that pinned
  // strip would make the reorder look like it did nothing, so we drop
  // it and show the single, fully-sorted grid instead.
  const showFeatured = activeCategory === "all" && !query.trim() && sort === "latest";
  const featuredPosts = useMemo(() => posts.filter((p) => p.featured), [posts]);
  const featuredSlugs = useMemo(
    () => new Set(featuredPosts.map((p) => p.slug)),
    [featuredPosts]
  );

  const filtered = useMemo(() => {
    let result = posts;

    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // When the featured strip is showing, don't repeat those same posts
    // in the grid right below it.
    if (showFeatured) {
      result = result.filter((p) => !featuredSlugs.has(p.slug));
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    if (sort === "popular") {
      sorted.sort((a, b) => {
        const diff = Number(Boolean(b.popular)) - Number(Boolean(a.popular));
        // Popular posts are grouped first; within each group, fall back
        // to newest-first so the order still means something instead of
        // leaving ties in arbitrary array order.
        return diff !== 0 ? diff : new Date(b.date) - new Date(a.date);
      });
    } else if (sort === "az") {
      sorted.sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" }));
    } else {
      // "latest" (and the default fallback)
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return sorted;
  }, [posts, activeCategory, query, sort, showFeatured, featuredSlugs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={`container ${styles.header}`}>
        <p className={styles.eyebrow}>All posts</p>
        <h1 className={styles.title}>All blogs</h1>

        <form
          className={styles.controls}
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.searchWrap}>
            <label htmlFor="blog-search" className="visually-hidden">Search blogs</label>
            <input
              id="blog-search"
              type="search"
              className={styles.search}
              placeholder="Search by title, topic, or author…"
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

          <label htmlFor="blog-sort" className="visually-hidden">Sort blogs</label>
          <select
            id="blog-sort"
            className={styles.sort}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </form>

        <section className={styles.filterSection} aria-label="Filter by category">
          <p className={styles.filterSectionLabel}>Filter by category</p>
          <div className={styles.filterRow}>
            <button
              type="button"
              className={`${styles.filterChip} ${activeCategory === "all" ? styles.filterChipActive : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setActiveCategory(c.slug)}
                className={styles.pillButton}
              >
                <CategoryPill slug={c.slug} size="md" asLink={false} active={activeCategory === c.slug} />
              </button>
            ))}
          </div>
        </section>
      </div>

      {showFeatured && (
        <div className="container">
          <FeaturedBlogs posts={featuredPosts} />
        </div>
      )}

      <div className={`container ${styles.results}`}>
        {currentPosts.length > 0 ? (
          <>
            <h2 className="visually-hidden">
              {query.trim() ? `Search results for "${query.trim()}"` : "All articles"}
            </h2>
            {!showFeatured && (
              <p className={styles.sortNote}>
                Sorted by <strong>{sortOptions.find((o) => o.value === sort)?.label}</strong> · showing{" "}
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
            )}
            <div className={styles.grid}>
              {currentPosts.map((post, i) => (
                <BlogCard key={post.slug} post={post} rank={(page - 1) * PAGE_SIZE + i + 1} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Blog pages">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
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
            <h2>No blogs match your filters</h2>
            <p>Try a different search term or clear the category filter.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory("all");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
