// app/api/admin/users/[id]/route.js
// Day 5 -- block/unblock a user and view their full submission history
// (PRD §11: "Block/Deactivate Users", "View Author Submission History").

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      isActive: true,
      createdAt: true,
      blogs: {
        orderBy: { createdAt: "desc" },
        include: { category: true },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PATCH(request, { params }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  if (params.id === session.sub) {
    return NextResponse.json({ error: "You can't change your own account here." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "User not found." }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = {};
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (body.role && ["ADMIN", "AUTHOR", "USER"].includes(body.role)) data.role = body.role;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json({ user });
}

// DELETE -- permanently remove an account. Blog.author has onDelete:
// Cascade at the DB level, so deleting a user with existing posts would
// silently wipe every article they wrote. To avoid that, a user with
// any blogs can only be deleted alongside a reassignAuthorId: their
// posts are handed to that author first, *then* the now-empty account
// is removed. A user with zero blogs deletes straight away.
export async function DELETE(request, { params }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  if (params.id === session.sub) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id: params.id },
    include: { _count: { select: { blogs: true } } },
  });
  if (!existing) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (existing.role === "ADMIN") {
    return NextResponse.json({ error: "Admin accounts can't be deleted here." }, { status: 400 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    // no body sent -- fine for a user with zero blogs
  }

  if (existing._count.blogs > 0) {
    const reassignAuthorId = body?.reassignAuthorId;
    if (!reassignAuthorId) {
      return NextResponse.json(
        { error: `${existing.name} has ${existing._count.blogs} blog(s). Choose an author to reassign them to before deleting.` },
        { status: 400 }
      );
    }
    if (reassignAuthorId === params.id) {
      return NextResponse.json({ error: "Reassign target can't be the same account." }, { status: 400 });
    }
    const target = await prisma.user.findUnique({ where: { id: reassignAuthorId } });
    if (!target) return NextResponse.json({ error: "Reassignment target not found." }, { status: 404 });

    await prisma.blog.updateMany({
      where: { authorId: params.id },
      data: { authorId: reassignAuthorId },
    });
  }

  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
