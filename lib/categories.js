// lib/categories.js
// Static category taxonomy (slug, name, color). Kept as a plain,
// client-safe module -- separate from lib/posts.js -- so components like
// CategoryPill and CategoryGrid can import it directly from a "use client"
// file without pulling Prisma (server-only) into the browser bundle.
//
// The database's Category table is seeded from this exact list (see
// prisma/seed.js), so slugs always line up between the two.

export const categories = [
  { slug: "technology", name: "Technology", color: "#332E8C" },
  { slug: "artificial-intelligence", name: "Artificial Intelligence", color: "#8B3FA8" },
  { slug: "web-development", name: "Web Development", color: "#1D7A6E" },
  { slug: "programming", name: "Programming", color: "#C57E22" },
  { slug: "cybersecurity", name: "Cybersecurity", color: "#B23A3A" },
  { slug: "software-engineering", name: "Software Engineering", color: "#2A5DB0" },
  { slug: "business", name: "Business", color: "#946C3E" },
  { slug: "education", name: "Education", color: "#3E8E5B" },
  { slug: "digital-marketing", name: "Digital Marketing", color: "#C24E82" },
  { slug: "productivity", name: "Productivity", color: "#4C7A3E" },
];

export function getCategory(slug) {
  return categories.find((c) => c.slug === slug);
}
