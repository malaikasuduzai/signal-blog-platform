// app/api/admin/stats/route.js
// Day 5 -- powers the Admin Dashboard's stat tiles + recent submissions
// list (PRD §9). Everything here is a read, so one route keeps it simple
// rather than spreading a stats call per tile across the client.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [
    totalBlogs,
    published,
    pending,
    rejected,
    drafts,
    totalAuthors,
    totalUsers,
    totalCategories,
    recentSubmissions,
  ] = await Promise.all([
    prisma.blog.count(),
    prisma.blog.count({ where: { status: "PUBLISHED" } }),
    prisma.blog.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.blog.count({ where: { status: "REJECTED" } }),
    prisma.blog.count({ where: { status: "DRAFT" } }),
    prisma.user.count({ where: { role: "AUTHOR" } }),
    prisma.user.count(),
    prisma.category.count(),
    prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { category: true, author: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalBlogs,
      published,
      pending,
      rejected,
      drafts,
      totalAuthors,
      totalUsers,
      totalCategories,
    },
    recentSubmissions,
  });
}
