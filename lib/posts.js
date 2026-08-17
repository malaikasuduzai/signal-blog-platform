// lib/posts.js
// Server-only data access for blog posts. This replaces the static mock
// array that used to live in lib/data.js -- reads now go through Prisma,
// so the public site and the admin panel finally read the same database
// instead of two disconnected sources.
//
// IMPORTANT: this file imports "@/lib/prisma" and must only ever be
// imported from Server Components or route handlers -- never from a
// "use client" file. Category display data (slug/name/color) is kept
// separately in lib/categories.js specifically so it stays client-safe;
// pull that in for anything CategoryPill-shaped.

import { cache } from "react";
import { prisma } from "./prisma";
import { previewPosts, getPreviewPost } from "./preview-posts";

// Mirrors the exact reading-time heuristic the old lib/data.js used
// (average ~200 words per minute, 3 min floor so short posts don't look
// like a typo), just re-applied at read time instead of once at import.
function computeReadingTime(content) {
  let wordCount = 0;
  for (const block of content || []) {
    if (block.type === "p" || block.type === "quote") {
      wordCount += (block.text || "").split(" ").length;
    }
  }
  let readingTime = Math.round(wordCount / 200);
  if (readingTime < 3) readingTime = 3;
  return readingTime;
}

// Normalizes a Prisma Blog row into the same shape every component in
// app/ and components/ already expects (post.category as a slug string,
// post.author as {name, bio}, post.date as an ISO string, etc. Avatars
// render as initials via components/AuthorAvatar.jsx, so no photo URL
// is included here.)
// -- so BlogCard, Hero, ArticleBody and friends needed zero changes.
function isPublicAuthor(name) {
  return (name || "").trim().toLowerCase() !== "malaika shabir";
}

function mapBlog(blog) {
  return {
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    category: blog.category.slug,
    author: {
      name: blog.author.name,
      bio: blog.author.bio || "",
    },
    date: (blog.publishedAt || blog.createdAt).toISOString(),
    // Falls back to a deterministic per-post placeholder photo if an
    // author submitted a blog with no featured image -- keeps every
    // card/hero render safe instead of passing a null src to next/image.
    image: blog.featuredImage || `https://picsum.photos/seed/${blog.slug}/1400/900`,
    featured: blog.featured,
    popular: blog.popular,
    tags: blog.tags || [],
    references: blog.references || [],
    content: blog.content || [],
    readingTime: computeReadingTime(blog.content),
  };
}

const include = {
  category: true,
  author: { select: { name: true, bio: true } },
};

// The one query most pages build on: every published post, newest first.
// Filtering/sorting for the listing pages happens client-side on this
// array (same as the old static-data version), so this is the single
// place that decides what "published" means.
//
// Wrapped in React's cache() -- Day 6 performance pass. A single page
// render can legitimately call this more than once (the homepage calls
// it directly and again through CategoryGrid; a blog details page calls
// it again through getRelatedPosts and getAdjacentPosts). Without this,
// each of those calls re-ran the same findMany against every published
// post's full content -- now a much bigger payload since posts run
// 2,000-3,000 words each. cache() dedupes repeat calls within the same
// request so the query actually runs once per page render, not three or
// four times, while still refetching fresh on every new request (this
// is request memoization, not a persistent cache).
export const getAllPublishedPosts = cache(async function getAllPublishedPosts() {
  if (!process.env.DATABASE_URL) return previewPosts.filter((post) => isPublicAuthor(post.author.name));

  const blogs = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include,
  });
  return blogs.map(mapBlog).filter((post) => isPublicAuthor(post.author.name));
});

// Also cache()d: generateMetadata(params) and the page component both
// call getPost() with the same slug on every blog details page render.
export const getPost = cache(async function getPost(slug) {
  if (!process.env.DATABASE_URL) {
    const previewPost = getPreviewPost(slug);
    return previewPost && isPublicAuthor(previewPost.author.name) ? previewPost : null;
  }

  const blog = await prisma.blog.findFirst({
    where: { slug, status: "PUBLISHED" },
    include,
  });
  if (!blog || !isPublicAuthor(blog.author.name)) return null;
  return mapBlog(blog);
});

export async function getFeaturedPosts() {
  const posts = await getAllPublishedPosts();
  return posts.filter((p) => p.featured);
}

export async function getPopularPosts() {
  const posts = await getAllPublishedPosts();
  return posts.filter((p) => p.popular);
}

export async function getLatestPosts(limit = 6) {
  const posts = await getAllPublishedPosts(); // already sorted newest-first
  return posts.slice(0, limit);
}

// Same-category first, then backfilled with the latest posts -- ported
// as-is from the old lib/data.js logic, just running against a fetched
// array instead of the static one.
export async function getRelatedPosts(post, limit = 3) {
  const posts = await getAllPublishedPosts();
  const sameCategory = posts.filter(
    (p) => p.category === post.category && p.slug !== post.slug
  );
  const related = sameCategory.slice(0, limit);

  if (related.length < limit) {
    for (const p of posts) {
      if (related.length >= limit) break;
      if (p.slug === post.slug) continue;
      if (related.find((r) => r.slug === p.slug)) continue;
      related.push(p);
    }
  }

  return related;
}

// Chronological (oldest -> newest) prev/next navigation between published posts.
export async function getAdjacentPosts(slug) {
  const posts = await getAllPublishedPosts();
  const sorted = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
  const index = sorted.findIndex((p) => p.slug === slug);
  return {
    prev: index > 0 ? sorted[index - 1] : null,
    next: index !== -1 && index < sorted.length - 1 ? sorted[index + 1] : null,
  };
}

// Published-post count per category slug, for CategoryGrid's "N articles" tiles.
export async function getCategoryPostCounts() {
  const posts = await getAllPublishedPosts();
  const counts = {};
  for (const p of posts) {
    counts[p.category] = (counts[p.category] || 0) + 1;
  }
  return counts;
}
