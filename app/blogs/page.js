// app/blog/page.js
import { Suspense } from "react";
import BlogListing from "./BlogListing";
import { getAllPublishedPosts } from "@/lib/posts";

export const metadata = {
  title: "All Blogs",
  description: "Browse, search, and filter every published article on Signal.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "All Blogs — Signal",
    description: "Browse, search, and filter every published article on Signal.",
    url: "/blogs",
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await getAllPublishedPosts();
  return (
    <Suspense fallback={null}>
      <BlogListing posts={posts} />
    </Suspense>
  );
}
