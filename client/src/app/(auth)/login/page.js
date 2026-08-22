import AuthLayout from "@components/auth/AuthLayout";
import LoginForm from "@components/auth/LoginForm";

export const metadata = {
  title: "وجبة | تسجيل الدخول",
  description: "سجّل دخولك لحسابك بوجبة واطلب من مطاعمك المفضلة بغزة.",
};

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;

  return (
    <AuthLayout
      title="سجّل دخولك"
      subtitle="أهلاً بك، سجّل دخولك واطلب من مطاعمك المفضلة."
    >
      <LoginForm next={next} />
    </AuthLayout>
  );
}
