// app/api/newsletter/unsubscribe/route.js
// One-click unsubscribe link, opened directly from the notification
// email -- so this returns a small standalone HTML page rather than
// JSON, since there's no client-side app to hand the response to.

import { prisma } from "@/lib/prisma";

function page({ title, message }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — Signal</title>
  </head>
  <body style="margin:0;padding:0;background:#efeee8;font-family:Georgia,Cambria,'Times New Roman',serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
      <tr>
        <td align="center" style="padding:80px 16px;">
          <table role="presentation" width="100%" style="max-width:440px;background:#f7f7f4;border-radius:12px;padding:40px 32px;text-align:center;">
            <tr>
              <td>
                <p style="font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:18px;margin:0 0 24px;">Signal</p>
                <h1 style="font-size:22px;margin:0 0 12px;">${title}</h1>
                <p style="font-size:15px;line-height:1.6;color:#4a4a4a;margin:0 0 24px;">${message}</p>
                <a href="/" style="display:inline-block;background:#e39b3c;color:#111111;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:999px;">
                  Back to Signal
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = (searchParams.get("token") || "").trim();

  if (!token) {
    return new Response(
      page({ title: "Invalid link", message: "This unsubscribe link is missing its token." }),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  });

  if (!subscriber) {
    // Already unsubscribed or an invalid token -- either way, from the
    // visitor's point of view the outcome they want (not on the list)
    // is already true, so treat it as a success rather than an error.
    return new Response(
      page({
        title: "You're unsubscribed",
        message: "This address is not on our newsletter list.",
      }),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }

  await prisma.newsletterSubscriber.delete({ where: { id: subscriber.id } });

  return new Response(
    page({
      title: "You're unsubscribed",
      message: `${subscriber.email} won't receive any more newsletter emails from Signal.`,
    }),
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}
