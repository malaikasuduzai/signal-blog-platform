// app/dashboard/submit/page.js
import { prisma } from "@/lib/prisma";
import SubmitBlogForm from "@/components/SubmitBlogForm";

export const metadata = { title: "Submit a blog", robots: { index: false, follow: false } };

export default async function SubmitBlogPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return <SubmitBlogForm categories={categories} />;
}
