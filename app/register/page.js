// app/register/page.js
import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Create an account", robots: { index: false, follow: true } };

export default function RegisterPage() {
  return <RegisterForm />;
}
