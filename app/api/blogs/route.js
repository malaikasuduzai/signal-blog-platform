// app/api/blogs/route.js
// Day 4 scope: authors submitting blogs, and an author viewing their own
// submissions + status. Admin-side approve/reject/publish actions on this
// same Blog model are built out in Day 5.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(title) {
  const base = slugify(title) || "post";
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.blog.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

// GET: the logged-in author's own submissions (any status), for the
// Author Dashboard's "My Submissions" list.
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const blogs = await prisma.blog.findMany({
    where: { authorId: session.sub },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return NextResponse.json({ blogs });
}

// POST: submit a new blog. Always lands as PENDING_REVIEW -- authors
// can't self-publish, per the PRD's Author -> Pending Review -> Admin
// Review -> Approval/Rejection -> Publication workflow.
export async function POST(request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
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

  // Authors can only ever create a blog as DRAFT or PENDING_REVIEW --
  // APPROVED/REJECTED/PUBLISHED are admin-only transitions (Day 5).
  const requestedStatus = body.status === "DRAFT" ? "DRAFT" : "PENDING_REVIEW";

  const errors = {};
  if (!title) errors.title = "Title is required.";

  // A draft just needs a title so you can save your place and come back --
  // everything else is only required once you actually submit for review.
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
  }
  if (requestedStatus === "PENDING_REVIEW" && !category) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", fields: { category: "Pick a category." } },
      { status: 400 }
    );
  }

  // A draft with no category yet falls back to the first category so the
  // required DB relation is satisfied -- the author can change it before
  // submitting for review.
  if (!category) {
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

  const slug = await uniqueSlug(title);

  const blog = await prisma.blog.create({
    data: {
      slug,
      title,
      excerpt: excerpt || "",
      // Stored as a single paragraph block for now -- the richer
      // heading/image structured-block format (see lib/data.js) is a
      // Day 5/6 editor upgrade; submissions are plain text at intake.
      content: content ? [{ type: "p", text: content }] : [],
      featuredImage: featuredImage || null,
      references,
      status: requestedStatus,
      authorId: session.sub,
      categoryId: category.id,
    },
  });

  return NextResponse.json({ blog }, { status: 201 });
}
