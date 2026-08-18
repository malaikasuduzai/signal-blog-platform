// lib/email.js
// Sends "new post published" notifications to newsletter subscribers via
// Resend (https://resend.com). Kept separate from lib/prisma.js and the
// API routes so the send logic, template, and batching strategy live in
// one place.

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Signal <onboarding@resend.dev>";

// Lazily constructed -- avoids throwing at import time in environments
// (like `next build`) where RESEND_API_KEY isn't set yet, e.g. CI.
let loggedKeyStatus = false;
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!loggedKeyStatus) {
    loggedKeyStatus = true;
    console.log(
      apiKey
        ? `[email] RESEND_API_KEY loaded (starts with "${apiKey.slice(0, 6)}...")`
        : "[email] RESEND_API_KEY is NOT set -- newsletter notifications will be skipped"
    );
  }
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailHtml({ blog, unsubscribeUrl }) {
  const postUrl = `${siteUrl}/blogs/${blog.slug}`;
  const title = escapeHtml(blog.title);
  const excerpt = escapeHtml(blog.excerpt || "");
  const categoryName = escapeHtml(blog.category?.name || "");
  const authorName = escapeHtml(blog.author?.name || "");
  const image = blog.featuredImage;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#efeee8;font-family:Georgia,Cambria,'Times New Roman',serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efeee8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#f7f7f4;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#111111;padding:24px 32px;">
                <span style="font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:20px;color:#f7f7f4;letter-spacing:-0.02em;">Signal</span>
              </td>
            </tr>
            ${
              image
                ? `<tr><td><img src="${image}" alt="" width="560" style="width:100%;height:auto;display:block;" /></td></tr>`
                : ""
            }
            <tr>
              <td style="padding:32px;">
                <p style="font-family:Arial,Helvetica,sans-serif;text-transform:uppercase;letter-spacing:0.08em;font-size:12px;font-weight:700;color:#8a7a5c;margin:0 0 12px;">
                  ${categoryName ? `New in ${categoryName}` : "New post published"}
                </p>
                <h1 style="font-size:26px;line-height:1.3;margin:0 0 16px;color:#1a1a1a;">
                  ${title}
                </h1>
                ${
                  excerpt
                    ? `<p style="font-size:16px;line-height:1.6;color:#3a3a3a;margin:0 0 24px;">${excerpt}</p>`
                    : ""
                }
                ${
                  authorName
                    ? `<p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6a6a6a;margin:0 0 24px;">By ${authorName}</p>`
                    : ""
                }
                <a href="${postUrl}" style="display:inline-block;background:#e39b3c;color:#111111;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:999px;">
                  Read the article
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid rgba(0,0,0,0.08);">
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8a8a;margin:0;">
                  You're receiving this because you subscribed to Signal's newsletter.
                  <a href="${unsubscribeUrl}" style="color:#6a6a6a;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildEmailText({ blog, unsubscribeUrl }) {
  const postUrl = `${siteUrl}/blogs/${blog.slug}`;
  return [
    blog.title,
    "",
    blog.excerpt || "",
    "",
    `Read it here: ${postUrl}`,
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");
}

// Sends the "new post" notification to every subscriber. Designed to be
// called right after a blog transitions to PUBLISHED -- see
// app/api/admin/blogs/[id]/route.js.
//
// Failures are caught and logged rather than thrown: a subscriber's
// bounced address or a transient email-provider error should never roll
// back the publish action or 500 the admin's request.
export async function sendNewPostNotification(blog) {
  const resend = getResendClient();
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set -- skipping newsletter notification for:",
      blog.slug
    );
    return { sent: 0, failed: 0, skipped: true };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    select: { email: true, unsubscribeToken: true },
  });

  if (subscribers.length === 0) {
    return { sent: 0, failed: 0, skipped: false };
  }

  // Resend's batch endpoint accepts up to 100 emails per call, each with
  // its own payload -- lets every subscriber get a personalized
  // unsubscribe link in a single request instead of one call per person.
  const BATCH_SIZE = 100;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const chunk = subscribers.slice(i, i + BATCH_SIZE);

    const payload = chunk.map((sub) => {
      const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}`;
      return {
        from: FROM_ADDRESS,
        to: sub.email,
        subject: `New on Signal: ${blog.title}`,
        html: buildEmailHtml({ blog, unsubscribeUrl }),
        text: buildEmailText({ blog, unsubscribeUrl }),
      };
    });

    try {
      const { data, error } = await resend.batch.send(payload);
      if (error) {
        console.error("[email] Resend batch error:", error);
        failed += chunk.length;
      } else {
        sent += data?.data?.length ?? chunk.length;
      }
    } catch (err) {
      console.error("[email] Failed to send notification batch:", err);
      failed += chunk.length;
    }
  }

  console.log(
    `[email] Notified subscribers for "${blog.slug}": sent=${sent} failed=${failed} total=${subscribers.length}`
  );

  return { sent, failed, skipped: false };
}
