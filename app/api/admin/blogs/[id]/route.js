// app/api/admin/blogs/[id]/route.js
// Day 5 -- the admin's full control surface over a single blog: edit any
// field, change status (approve / reject / publish / unpublish / request
// changes), reassign category or author, or delete outright. This is
// deliberately separate from the author-owned PATCH in Day 4's
// /api/blogs/[id], which only lets an author touch their own drafts.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendNewPostNotification } from "@/lib/email";

const VALID_STATUSES = ["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "PUBLISHED"];

export async function GET(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const blog = await prisma.blog.findUnique({
    where: { id: params.id },
    include: { category: true, author: true },
  });
  if (!blog) return NextResponse.json({ error: "Blog not found." }, { status: 404 });

  return NextResponse.json({ blog });
}

// PATCH covers everything: full content edits AND the lighter-weight
// status-only actions (Approve / Reject / Publish / Unpublish / Request
// changes) all send here -- the client just sends the fields it's
// changing, so a status-only click doesn't need to resend the article.
export async function PATCH(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const existing = await prisma.blog.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Blog not found." }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = {};
  const fieldErrors = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) fieldErrors.title = "Title is required.";
    else data.title = title;
  }
  if (body.excerpt !== undefined) data.excerpt = String(body.excerpt).trim();
  if (body.content !== undefined) {
    const content = String(body.content).trim();
    data.content = content ? [{ type: "p", text: content }] : [];
  }
  if (body.featuredImage !== undefined) data.featuredImage = String(body.featuredImage).trim() || null;
  if (body.references !== undefined) {
    const raw = String(body.references).trim();
    data.references = raw
      ? raw
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [refTitle, url] = line.split("|").map((s) => s?.trim());
            return url ? { title: refTitle, url } : { title: line, url: null };
          })
      : [];
  }
  if (body.featured !== undefined) data.featured = Boolean(body.featured);
  if (body.popular !== undefined) data.popular = Boolean(body.popular);
  if (body.rejectionNote !== undefined) data.rejectionNote = String(body.rejectionNote).trim() || null;

  if (body.category) {
    const category = await prisma.category.findUnique({ where: { slug: body.category } });
    if (!category) fieldErrors.category = "Pick a valid category.";
    else data.categoryId = category.id;
  }

  if (body.authorId) {
    const author = await prisma.user.findUnique({ where: { id: body.authorId } });
    if (!author) fieldErrors.authorId = "Pick a valid author.";
    else data.authorId = author.id;
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      fieldErrors.status = "Unknown status.";
    } else {
      data.status = body.status;
      // Reject/Request-changes without a note is allowed but discouraged
      // on the client; here we just make sure a fresh approval clears any
      // stale rejection note from a previous round.
      if (body.status === "PUBLISHED" && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
      if (body.status !== "REJECTED" && body.rejectionNote === undefined) {
        data.rejectionNote = null;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors }, { status: 400 });
  }

  // A post only counts as "newly published" the first time it crosses
  // into PUBLISHED -- re-saving an already-published post (e.g. editing
  // a typo) must not re-notify every subscriber.
  const isNewlyPublished = data.status === "PUBLISHED" && !existing.publishedAt;

  const blog = await prisma.blog.update({
    where: { id: params.id },
    data,
    include: { category: true, author: true },
  });

  if (isNewlyPublished) {
    // Fire-and-forget from the request's point of view: email delivery
    // failures are logged inside sendNewPostNotification and must never
    // turn a successful publish into a 500 for the admin.
    sendNewPostNotification(blog).catch((err) =>
      console.error("[email] Unexpected error notifying subscribers:", err)
    );
  }

  return NextResponse.json({ blog });
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const existing = await prisma.blog.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Blog not found." }, { status: 404 });

  await prisma.blog.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
