// app/login/page.js
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Login", robots: { index: false, follow: true } };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
