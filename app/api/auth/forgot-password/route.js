// app/api/auth/forgot-password/route.js
import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

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

  const email = (body.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Always respond the same way whether or not the account exists --
  // otherwise this endpoint becomes a way to enumerate registered emails.
  const genericResponse = NextResponse.json({
    message: "If an account exists for that email, a reset link has been sent.",
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return genericResponse;

  const rawToken = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash: hashToken(rawToken),
      resetTokenExpiry: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${new URL(request.url).origin}/reset-password/${rawToken}`;

  // NOTE: there's no email service wired up yet, so the link can't actually
  // be emailed. It's logged server-side and echoed back in the response
  // (devResetUrl) so the flow is testable end-to-end during development.
  // Before shipping this for real, swap the block below for an email send
  // and delete the devResetUrl field from the response.
  console.log(`[forgot-password] reset link for ${email}: ${resetUrl}`);

  return NextResponse.json({
    message: "If an account exists for that email, a reset link has been sent.",
    devResetUrl: resetUrl,
  });
}
