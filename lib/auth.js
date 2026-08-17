// lib/auth.js
// Auth helpers shared by API routes, server components, and middleware.
//
// Using `jose` (not `jsonwebtoken`) for the JWT itself because Next.js
// middleware runs on the Edge runtime, which doesn't have Node's `crypto`
// module -- jose works in both Edge and Node, so the same verify function
// runs everywhere. bcrypt hashing only ever happens in normal API routes
// (Node runtime), never in middleware.

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "signal_session";
const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Add it to your .env file (see .env.example)."
    );
  }
  return encoder.encode(secret);
}

// ---- passwords ----

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ---- JWT ----

// payload: { sub: userId, role, name, email }
export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days, matches token expiry
  };
}

// Server Components / Route Handlers only (reads next/headers cookies()).
// Returns the decoded token payload, or null if not logged in.
export async function getSessionUser() {
  const { cookies } = await import("next/headers");
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

// Day 5 -- every /api/admin/* route needs this same "logged in AND an
// admin" check. middleware.js already keeps non-admins out of /admin
// pages, but API routes are hit directly, so they re-check here too.
// Returns the session payload on success, or throws a Response-shaped
// error the route can return directly: `const s = await requireAdmin(); if (s.error) return s.error;`
export async function requireAdmin() {
  const { NextResponse } = await import("next/server");
  const session = await getSessionUser();
  if (!session) {
    return { error: NextResponse.json({ error: "You must be logged in." }, { status: 401 }) };
  }
  if (session.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Admins only." }, { status: 403 }) };
  }
  return { session };
}
