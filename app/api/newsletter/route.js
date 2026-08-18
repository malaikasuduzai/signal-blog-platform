// app/api/newsletter/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      // Treat re-subscribing with the same address as a success, not an error.
      return NextResponse.json({ message: "You're already subscribed." }, { status: 200 });
    }

    await prisma.newsletterSubscriber.create({ data: { email } });
    return NextResponse.json({ message: "Subscribed! Thanks for joining." }, { status: 201 });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);

    // Prisma error P2021 = table doesn't exist yet (migration not run).
    if (err.code === "P2021") {
      return NextResponse.json(
        {
          error:
            "Newsletter isn't set up yet on the server (missing database table). Run `npx prisma migrate dev` and try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
