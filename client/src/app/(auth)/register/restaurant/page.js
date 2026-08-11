import AuthLayout from "@components/auth/AuthLayout";
import RestaurantSignupForm from "@components/auth/RestaurantSignupForm";

export const metadata = {
  title: "وجبة | سجّل مطعمك",
  description:
    "سجّل مطعمك على وجبة وابدأ توصيل طلباتك للزبائن في غزة خلال دقائق.",
};

export default function RestaurantRegisterPage() {
  return (
    <AuthLayout
      title="سجّل مطعمك"
      subtitle="خطوتين بس: حسابك، وبيانات المطعم — وبعدها مطعمك جاهز يستقبل الطلبات."
    >
      <RestaurantSignupForm />
    </AuthLayout>
  );
}
