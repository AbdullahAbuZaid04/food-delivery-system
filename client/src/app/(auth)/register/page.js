import AuthLayout from "@components/auth/AuthLayout";
import RegisterForm from "@components/auth/RegisterForm";

export const metadata = {
  title: "وجبة | إنشاء حساب",
  description:
    "انضم لوجبة — زبون أو صاحب مطعم أو سائق توصيل — وابدأ اطلب أو بيع أو وضّي طلبات بغزة.",
};

export default async function RegisterPage({ searchParams }) {
  const { next } = await searchParams;

  return (
    <AuthLayout
      title="أنشئ حسابك"
      subtitle="انضم لوجبة — زبون أو صاحب مطعم أو سائق توصيل، كلكم أهل."
    >
      <RegisterForm next={next} />
    </AuthLayout>
  );
}
