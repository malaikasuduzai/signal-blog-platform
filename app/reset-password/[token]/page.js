// app/reset-password/[token]/page.js
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default function ResetPasswordPage({ params }) {
  return <ResetPasswordForm token={params.token} />;
}
