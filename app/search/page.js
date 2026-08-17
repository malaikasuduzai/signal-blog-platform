// app/search/page.js
import { Suspense } from "react";
import BlogListing from "@/app/blogs/BlogListing";
import { getAllPublishedPosts } from "@/lib/posts";

export const metadata = {
  title: "Search",
  description: "Search Signal's full archive of articles by title, topic, or author.",
  alternates: { canonical: "/search" },
  // A search results page has no fixed content of its own -- keep it out
  // of the index (avoids duplicate-content signals against /blogs) while
  // still letting crawlers follow links from it.
  robots: { index: false, follow: true },
};

export default async function SearchPage() {
  const posts = await getAllPublishedPosts();
  return (
    <Suspense fallback={null}>
      <BlogListing posts={posts} />
    </Suspense>
  );
}
