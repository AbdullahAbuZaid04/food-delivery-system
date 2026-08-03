// src/app/(customer)/account/page.js
// "حسابي" — البطاقة الشخصية والعناوين المحفوظة. صفحة Server component، وكل
// التفاعل (تعديل/حذف) جوه المكوّنات "use client" الفرعية. البيانات mock من
// @lib/mock/user.js — بدون API حقيقي.
import AppHeader from "@components/customer/AppHeader";
import BottomNav from "@components/customer/BottomNav";
import ProfileHeader from "@components/account/ProfileHeader";
import SavedAddressesList from "@components/account/SavedAddressesList";
import { MOCK_USER } from "@lib/mock/user";

const MOCK_USER_NAME = `${MOCK_USER.firstName} ${MOCK_USER.lastName}`.trim();

export const metadata = {
  title: "وجبة | حسابي",
  description:
    "بياناتك الشخصية وعناوينك المحفوظة على وجبة — كلها بمكان وحدة.",
};

export default function AccountPage() {
  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={MOCK_USER_NAME} showSearch={false} />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-20 md:pb-0">
        <header>
          <h1 className="font-display font-black text-[clamp(24px,3vw,32px)] text-cocoa">
            حسابي
          </h1>
          <p className="mt-1 text-cocoa-soft text-[14px]">
            بياناتك وعناوينك المحفوظة — كلها بمكان وحدة.
          </p>
        </header>

        <div className="mt-6 md:mt-8 space-y-6">
          <ProfileHeader user={MOCK_USER} />
          <SavedAddressesList addresses={MOCK_USER.addresses} />
        </div>
      </main>

      <BottomNav activeKey="account" />
    </div>
  );
}
