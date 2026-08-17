// app/dashboard/edit/[id]/page.js
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import SubmitBlogForm from "@/components/SubmitBlogForm";

export const metadata = { title: "Edit draft — Signal" };

export default async function EditDraftPage({ params }) {
  const session = await getSessionUser();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const blog = await prisma.blog.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  // Not found, not yours, or no longer a draft (already submitted/reviewed)
  // -- editing in place only makes sense before it enters the review queue.
  if (!blog || blog.authorId !== session.sub || blog.status !== "DRAFT") {
    notFound();
  }

  return <SubmitBlogForm categories={categories} blog={blog} />;
}
