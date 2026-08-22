import AuthLayout from "@components/auth/AuthLayout";
import DriverSignupForm from "@components/auth/DriverSignupForm";

export const metadata = {
  title: "وجبة | سجّل كسائق توصيل",
  description:
    "انضم لفريق توصيل وجبة — سجّل حسابك كسائق، وبعد موافقة الأدمن ابدأ بتوصيل الطلبات للمطاعم في قطاع غزة.",
};

export default function DriverRegisterPage() {
  return (
    <AuthLayout
      title="سجّل كسائق توصيل"
      subtitle="خطوة وحدة بس: حسابك — طلب انضمامك رح يوصل الأدمن للمراجعة، وأول ما يقبل بنوّصلك لما المطاعم تعلّقلك طلبات التوصيل."
    >
      <DriverSignupForm />
    </AuthLayout>
  );
}
