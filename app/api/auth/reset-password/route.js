// app/api/auth/reset-password/route.js
import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const token = (body.token || "").trim();
  const password = body.password || "";
  const confirmPassword = body.confirmPassword || "";

  if (!token) {
    return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords don't match." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { resetTokenHash: hashToken(token) },
  });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      resetTokenHash: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({ message: "Password updated. You can log in now." });
}
