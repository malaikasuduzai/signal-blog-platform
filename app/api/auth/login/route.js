// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
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

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  // Same error message for "no such user" and "wrong password" -- don't
  // leak which one it was, that just helps someone enumerate accounts.
  const invalid = () =>
    NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return invalid();

  const ok = await verifyPassword(password, user.password);
  if (!ok) return invalid();

  if (!user.isActive) {
    return NextResponse.json(
      { error: "This account has been deactivated. Contact the site admin." },
      { status: 403 }
    );
  }

  const token = await signSession({
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  cookies().set(SESSION_COOKIE_NAME, token, sessionCookieOptions());

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
