// app/api/admin/blogs/route.js
// Day 5 -- admin-facing blog list (every status, every author) that
// powers both /admin/blogs (Blog Management) and /admin/pending
// (Pending Submission Management, via ?status=PENDING_REVIEW).
// The author-scoped /api/blogs route from Day 4 is untouched -- this is
// a separate, admin-only view over the same Blog table.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendNewPostNotification } from "@/lib/email";

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

const VALID_STATUSES = ["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "PUBLISHED"];

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const authorId = searchParams.get("author");
  const q = (searchParams.get("q") || "").trim();
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10)));

  const where = {};
  if (status && VALID_STATUSES.includes(status)) where.status = status;
  if (category) where.category = { slug: category };
  if (authorId) where.authorId = authorId;
  if (q) {
    // No `mode: "insensitive"` here -- that filter option is Postgres/Mongo
    // only in Prisma. MySQL's default collation (utf8mb4_general_ci) is
    // already case-insensitive, so a plain `contains` does the right thing.
    where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }];
  }

  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "title"
      ? { title: "asc" }
      : { createdAt: "desc" };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true, author: { select: { id: true, name: true, email: true, avatar: true } } },
    }),
    prisma.blog.count({ where }),
  ]);

  return NextResponse.json({
    blogs,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

// POST: admin directly adding a blog (PRD §10 "Add Blog"). Unlike the
// author-facing POST /api/blogs, an admin can create it already
// PUBLISHED, and can assign any author.
export async function POST(request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

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
  const authorId = body.authorId || session.sub;
  const status = VALID_STATUSES.includes(body.status) ? body.status : "PUBLISHED";
  const featured = Boolean(body.featured);
  const popular = Boolean(body.popular);

  const errors = {};
  if (!title) errors.title = "Title is required.";
  if (!excerpt) errors.excerpt = "A short description is required.";
  if (!content) errors.content = "Blog content is required.";
  if (!categorySlug) errors.category = "Pick a category.";
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: errors }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    return NextResponse.json(
      { error: "Unknown category.", fields: { category: "Pick a valid category." } },
      { status: 400 }
    );
  }

  const author = await prisma.user.findUnique({ where: { id: authorId } });
  if (!author) {
    return NextResponse.json(
      { error: "Unknown author.", fields: { authorId: "Pick a valid author." } },
      { status: 400 }
    );
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
      excerpt,
      content: [{ type: "p", text: content }],
      featuredImage: featuredImage || null,
      references,
      status,
      featured,
      popular,
      authorId: author.id,
      categoryId: category.id,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
    include: { category: true, author: true },
  });

  if (status === "PUBLISHED") {
    sendNewPostNotification(blog).catch((err) =>
      console.error("[email] Unexpected error notifying subscribers:", err)
    );
  }

  return NextResponse.json({ blog }, { status: 201 });
}
