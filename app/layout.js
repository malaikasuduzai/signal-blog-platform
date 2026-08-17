// app/layout.js
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getSessionUser } from "@/lib/auth";

// Real Google Fonts, loaded and self-hosted by Next at build time (no
// runtime request to fonts.googleapis.com, no layout shift). Exposed as
// CSS variables so globals.css can lead with them and fall back to the
// original system-font stack if a subset ever fails to load.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  // Next ships a bundled metrics database it uses to auto-generate a
  // size-matched fallback font (reduces layout shift). It doesn't have
  // an entry for every font, which is what triggers "Failed to find
  // font override values ... Skipping generating a fallback font" --
  // harmless, but noisy. Turning the lookup off and giving our own
  // fallback stack removes the warning entirely.
  adjustFontFallback: false,
  fallback: ["Georgia", "Cambria", "Times New Roman", "serif"],
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

// Falls back to localhost in dev; set NEXT_PUBLIC_SITE_URL in production
// (Vercel: Project Settings -> Environment Variables) so canonical URLs,
// sitemap.xml, and Open Graph image/URLs resolve to the real domain
// instead of a relative path.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Signal — Clear thinking on technology and the work behind it",
    template: "%s — Signal",
  },
  description:
    "Signal is an independent technology publication for clear thinking on web development, AI, cybersecurity, and the work behind modern products.",
  openGraph: {
    siteName: "Signal",
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Signal — Clear thinking on technology and the work behind it",
    description:
      "Practical essays on technology, product craft, and the systems that help good work move forward.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Signal — Clear thinking on technology and the work behind it",
    description:
      "Practical essays on technology, product craft, and the systems that help good work move forward.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const session = await getSessionUser();
  const user = session
    ? { name: session.name, email: session.email, role: session.role }
    : null;

  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable}`}>
      <body>
        <SiteChrome user={user}>{children}</SiteChrome>
      </body>
    </html>
  );
}
