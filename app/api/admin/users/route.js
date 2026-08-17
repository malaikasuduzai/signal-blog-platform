// User/Author Management API.
// GET powers the management view; POST adds a new author from the dashboard.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const q = (searchParams.get("q") || "").trim();

  const where = {};
  if (role && ["ADMIN", "AUTHOR", "USER"].includes(role)) where.role = role;
  if (q) {
    where.OR = [{ name: { contains: q } }, { email: { contains: q } }];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      isActive: true,
      createdAt: true,
      _count: { select: { blogs: true } },
    },
  });

  return NextResponse.json({ users });
}

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const avatar = String(body.avatar || "").trim() || null;
  const bio = String(body.bio || "").trim() || null;

  if (name.length < 2) {
    return NextResponse.json({ error: "Enter the author's full name." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Use a password with at least 8 characters." }, { status: 400 });
  }
  if (bio && bio.length > 320) {
    return NextResponse.json({ error: "Keep the author bio under 320 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const author = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: "AUTHOR",
      avatar,
      bio,
      isActive: true,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ author }, { status: 201 });
}
