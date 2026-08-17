// app/api/admin/categories/[id]/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const existing = await prisma.category.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Category not found." }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: { name: "Category name is required." } }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data: { name, color: (body.color || "").trim() || null },
  });

  return NextResponse.json({ category });
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const existing = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { blogs: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Category not found." }, { status: 404 });

  if (existing._count.blogs > 0) {
    return NextResponse.json(
      { error: `Can't delete "${existing.name}" -- ${existing._count.blogs} blog(s) still use it. Reassign them first.` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
