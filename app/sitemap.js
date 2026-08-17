// app/sitemap.js
// Next.js reads this at /sitemap.xml automatically -- no separate route
// file needed. Per PRD §16 (SEO Requirements): a sitemap covering every
// public, indexable page. Auth/dashboard/admin routes are deliberately
// left out (they're already marked noindex on their own metadata).
import { getAllPublishedPosts } from "@/lib/posts";
import { categories } from "@/lib/categories";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const posts = await getAllPublishedPosts();

  const staticRoutes = ["", "/blogs", "/categories"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${siteUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const postRoutes = posts.map((post) => ({
    url: `${siteUrl}/blogs/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
