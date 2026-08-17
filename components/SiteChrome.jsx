// components/SiteChrome.jsx
// The public marketing Navbar/Footer belong on the public site, but
// /admin and /dashboard already render their own sidebar shell with its
// own navigation and log-out control. Without this check, both layouts
// stacked on top of each other -- a public nav bar (Home/Blogs/
// Categories/Admin/Log out) sitting above the admin sidebar's own nav,
// two different "Log out" controls, and the public footer (Privacy/
// Terms/RSS) showing up at the bottom of admin pages where it doesn't
// belong. Keeping this check client-side (usePathname) means it reacts
// to client-side navigation too, not just the initial server render.
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

function isAppShellRoute(pathname) {
  return pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
}

export default function SiteChrome({ user, children }) {
  const pathname = usePathname();

  if (isAppShellRoute(pathname)) {
    // These routes render their own full-page shell (sidebar + main),
    // so just pass children through untouched.
    return children;
  }

  return (
    <>
      <Navbar user={user} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
