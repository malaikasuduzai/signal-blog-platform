// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signSession,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const confirmPassword = body.confirmPassword || "";

  const fieldErrors = {};
  if (!name) fieldErrors.name = "Name is required.";
  if (!email) fieldErrors.email = "Email is required.";
  if (!password) fieldErrors.password = "Password is required.";
  if (password && password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }
  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Please confirm your password.";
  } else if (password && confirmPassword !== password) {
    fieldErrors.confirmPassword = "Passwords don't match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", fields: fieldErrors },
      { status: 400 }
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address.", fields: { email: "Enter a valid email address." } },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  // Everyone who registers through the public site becomes an AUTHOR --
  // they can submit blogs, which then wait for admin review. Real ADMIN
  // accounts are provisioned directly in the DB (see prisma/seed.js), not
  // through public registration.
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: "AUTHOR",
    },
  });

  const token = await signSession({
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  cookies().set(SESSION_COOKIE_NAME, token, sessionCookieOptions());

  return NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    { status: 201 }
  );
}
