import AuthLayout from "@components/auth/AuthLayout";
import RegisterForm from "@components/auth/RegisterForm";

export const metadata = {
  title: "إنشاء حساب | وجبة",
  description:
    "انضم لوجبة — زبون أو صاحب مطعم — وابدأ اطلب أو بيع من مطعمك بغزة.",
};

export default async function RegisterPage({ searchParams }) {
  const { next } = await searchParams;

  return (
    <AuthLayout
      title="أنشئ حسابك"
      subtitle="انضم لوجبة — زبون أو صاحب مطعم، كلكم أهل."
    >
      <RegisterForm next={next} />
    </AuthLayout>
  );
}
