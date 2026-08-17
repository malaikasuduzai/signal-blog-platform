// app/api/admin/categories/route.js
// Day 5 -- Category Management (PRD §4: admin can create/update/delete
// categories from the Admin Panel).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { blogs: true } } },
  });

  return NextResponse.json({ categories });
}

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const color = (body.color || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: { name: "Category name is required." } }, { status: 400 });
  }

  const baseSlug = slugify(name) || "category";
  let slug = baseSlug;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.category.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }

  const category = await prisma.category.create({
    data: { name, slug, color: color || null },
  });

  return NextResponse.json({ category }, { status: 201 });
}
