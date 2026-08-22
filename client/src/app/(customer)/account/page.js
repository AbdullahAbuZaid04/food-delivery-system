"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AppHeader from "@components/customer/AppHeader";
import BottomNav from "@components/customer/BottomNav";
import ProfileHeader from "@components/account/ProfileHeader";
import SavedAddressesList from "@components/account/SavedAddressesList";
import { authApi } from "@lib/api";
import { useAuth } from "@context/AuthContext";

function AccountLoading() {
  return (
    <div className="mt-6 md:mt-8 space-y-6" aria-busy="true" aria-label="جاري تحميل حسابك">
      <div className="h-52 rounded-[24px] bg-clay/10 animate-pulse motion-reduce:animate-none" />
      <div className="h-44 rounded-[24px] bg-clay/10 animate-pulse motion-reduce:animate-none" />
    </div>
  );
}

function AccountPage() {
  const { user, status, updateUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await authApi.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err?.message || "صارت مشكلة في تحميل بياناتك");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleProfileSaved = useCallback(
    async (payload) => {
      const updated = await updateUser(payload);
      setProfile(updated);
    },
    [updateUser],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (status === "authenticated") fetchProfile();
  }, [status, fetchProfile]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
        <AppHeader userName={user?.firstName} showSearch={false} />
        <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-20 md:pb-0">
          <AccountLoading />
        </main>
        <BottomNav activeKey="account" />
      </div>
    );
  }

  const fallbackUser = profile ?? user;
  const userName = fallbackUser
    ? `${fallbackUser.firstName} ${fallbackUser.lastName}`.trim()
    : "";

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={userName} showSearch={false} />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-20 md:pb-0">
        <header>
          <h1 className="font-display font-black text-[clamp(24px,3vw,32px)] text-cocoa">
            حسابي
          </h1>
          <p className="mt-1 text-cocoa-soft text-[14px]">
            بياناتك وعناوينك المحفوظة — كلها بمكان وحدة.
          </p>
        </header>

        {isLoading && !profile ? (
          <AccountLoading />
        ) : error && !profile ? (
          <div
            role="alert"
            className="mt-6 md:mt-8 rounded-[24px] border border-clay/10 bg-cream-deep p-8 text-center"
          >
            <p className="font-display font-bold text-lg text-cocoa">
              صارت مشكلة في تحميل بياناتك
            </p>
            <p className="text-cocoa-soft text-[14px] mt-2">{error}</p>
            <button
              type="button"
              onClick={fetchProfile}
              className="mt-5 h-11 px-6 rounded-full bg-terra text-cream font-bold text-[14.5px] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
            >
              أعد المحاولة
            </button>
          </div>
        ) : fallbackUser ? (
          <div className="mt-6 md:mt-8 space-y-6">
            <ProfileHeader user={fallbackUser} onSaved={handleProfileSaved} />
            <SavedAddressesList addresses={fallbackUser.addresses ?? []} />
          </div>
        ) : (
          <div className="mt-6 md:mt-8 text-center text-cocoa-soft text-[14px]">
            <Loader2 className="w-5 h-5 mx-auto animate-spin motion-reduce:animate-none" aria-hidden="true" />
          </div>
        )}
      </main>

      <BottomNav activeKey="account" />
    </div>
  );
}

export default AccountPage;
