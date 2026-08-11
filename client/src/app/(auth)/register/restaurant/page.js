import AuthLayout from "@components/auth/AuthLayout";
import RestaurantSignupForm from "@components/auth/RestaurantSignupForm";

export const metadata = {
  title: "وجبة | سجّل مطعمك",
  description:
    "سجّل مطعمك على وجبة — بيجري مراجعة سريعة من الأدمن وبعدها ابدأ توصيل طلباتك للزبائن في غزة.",
};

export default function RestaurantRegisterPage() {
  return (
    <AuthLayout
      title="سجّل مطعمك"
      subtitle="خطوتين بس: حسابك، وبيانات المطعم — وبعدها بيجري مراجعته من الأدمن وبنوّصلك لما يشتغل."
    >
      <RestaurantSignupForm />
    </AuthLayout>
  );
}
