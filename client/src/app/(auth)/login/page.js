import AuthLayout from "@components/auth/AuthLayout";
import LoginForm from "@components/auth/LoginForm";

export const metadata = {
  title: "تسجيل الدخول | وجبة",
  description: "سجّل دخولك لحسابك بوجبة واطلب من مطاعمك المفضلة بغزة.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="سجّل دخولك"
      subtitle="أهلاً بك، سجّل دخولك واطلب من مطاعمك المفضلة."
    >
      <LoginForm />
    </AuthLayout>
  );
}
