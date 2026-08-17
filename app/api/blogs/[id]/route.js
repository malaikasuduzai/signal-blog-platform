// app/api/blogs/[id]/route.js
// Author-owned single-blog operations: view a draft to edit it, save edits,
// move a draft to Pending Review, or delete an unsubmitted draft.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

async function loadOwnedBlog(id, userId) {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog || blog.authorId !== userId) return null;
  return blog;
}

export async function GET(request, { params }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const blog = await loadOwnedBlog(params.id, session.sub);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  return NextResponse.json({ blog });
}

export async function PATCH(request, { params }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const blog = await loadOwnedBlog(params.id, session.sub);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  // Once a blog has moved past DRAFT into the review pipeline, an author
  // editing it in place would undercut the point of admin review -- so
  // only drafts are editable here. (An admin's own edit/reject-with-notes
  // flow is separate, built Day 5.)
  if (blog.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only drafts can be edited. This blog is already in the review pipeline." },
      { status: 409 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = (body.title || "").trim();
  const excerpt = (body.excerpt || "").trim();
  const content = (body.content || "").trim();
  const categorySlug = body.category || "";
  const featuredImage = (body.featuredImage || "").trim();
  const referencesRaw = (body.references || "").trim();
  const requestedStatus = body.status === "PENDING_REVIEW" ? "PENDING_REVIEW" : "DRAFT";

  const errors = {};
  if (!title) errors.title = "Title is required.";
  if (requestedStatus === "PENDING_REVIEW") {
    if (!excerpt) errors.excerpt = "A short description is required.";
    if (!content || content.length < 200) {
      errors.content = "Blog content is required (aim for a full article, not a stub).";
    }
    if (!categorySlug) errors.category = "Pick a category.";
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: errors }, { status: 400 });
  }

  let category = null;
  if (categorySlug) {
    category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      return NextResponse.json(
        { error: "Unknown category.", fields: { category: "Pick a valid category." } },
        { status: 400 }
      );
    }
  } else {
    category = await prisma.category.findFirst({ orderBy: { name: "asc" } });
  }

  const references = referencesRaw
    ? referencesRaw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [refTitle, url] = line.split("|").map((s) => s?.trim());
          return url ? { title: refTitle, url } : { title: line, url: null };
        })
    : [];

  const updated = await prisma.blog.update({
    where: { id: blog.id },
    data: {
      title,
      excerpt: excerpt || "",
      content: content ? [{ type: "p", text: content }] : [],
      featuredImage: featuredImage || null,
      references,
      status: requestedStatus,
      categoryId: category.id,
    },
  });

  return NextResponse.json({ blog: updated });
}

export async function DELETE(request, { params }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const blog = await loadOwnedBlog(params.id, session.sub);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }
  if (blog.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only drafts can be deleted. Once submitted, ask an admin." },
      { status: 409 }
    );
  }

  await prisma.blog.delete({ where: { id: blog.id } });
  return NextResponse.json({ ok: true });
}
