"use client";

import Link from "next/link";
import {
  ChevronDown,
  History,
  LogOut,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import BrandMark from "@components/ui/BrandMark";
import SearchField from "@components/customer/SearchField";
import { useCart } from "@context/CartContext";
import { useAuth } from "@context/AuthContext";
import { formatArabicCount, toArabicDigits } from "@lib/format";

export const APP_HEADER_HEIGHT = 72;

function AppHeader({
  userName,
  searchQuery,
  onSearchChange,
  showSearch = true,
}) {
  const { totalItems } = useCart();
  const { user, logout, status } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const avatarButtonRef = useRef(null);

  const displayName = user?.firstName ?? (userName ? userName.trim() : "");
  const isAuthLoading = status === "loading";
  const isGuest = !displayName && !isAuthLoading;

  const cartBadge = totalItems > 0 ? toArabicDigits(totalItems) : null;
  const cartLabel =
    totalItems > 0
      ? `سلة الطلبات — فيك ${formatArabicCount(totalItems)}`
      : "سلة الطلبات — فاضية";

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
    avatarButtonRef.current?.focus();
  };

  const handleLogout = async () => {
    closeUserMenu();
    await logout();
    toast.success("منوّر، بلاستقبال في أي وقت");
    router.push("/home");
  };

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onPointerDown = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        closeUserMenu();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeUserMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isUserMenuOpen]);

  const initial = displayName.trim().charAt(0) || "ز";

  return (
    <header className="sticky top-0 z-50 w-full bg-cream/90 backdrop-blur-md border-b border-clay/10">
      <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-3">
        <Link
          href="/home"
          aria-label="وجبة — الرجوع لصفحة المطاعم الرئيسية"
          className="flex items-center gap-2.5 text-terra shrink-0"
        >
          <BrandMark />
          <span className="font-display font-black text-2xl text-cocoa">
            وجبة
          </span>
        </Link>

        {showSearch ? (
          <div
            role="search"
            className="hidden md:block flex-1 min-w-0 max-w-md mx-auto w-full"
          >
            <SearchField value={searchQuery} onChange={onSearchChange} />
          </div>
        ) : null}

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/cart"
            className="relative w-11 h-11 flex items-center justify-center rounded-full border-2 border-clay/20 text-cocoa hover:border-terra hover:text-terra transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
            aria-label={cartLabel}
          >
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            {cartBadge ? (
              <span
                aria-hidden="true"
                className="absolute -top-1 -end-1 min-w-5 h-5 px-1 rounded-full bg-terra text-cream text-[11px] font-bold flex items-center justify-center border-2 border-cream"
              >
                {cartBadge}
              </span>
            ) : null}
          </Link>

          {isGuest ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border-2 border-terra text-terra font-bold text-[13.5px] sm:text-sm px-4 sm:px-5 py-3 rounded-full hover:bg-terra/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
            >
              <UserRound className="w-4 h-4" aria-hidden="true" />
              سجّل الدخول
            </Link>
          ) : isAuthLoading ? (
            <span
              aria-hidden="true"
              className="w-11 h-11 rounded-full bg-terra/20 text-terra font-display font-bold text-sm flex items-center justify-center shrink-0"
            >
              ز
            </span>
          ) : (
            <div className="relative" ref={userMenuRef}>
            <button
              ref={avatarButtonRef}
              type="button"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              aria-label="قائمة الحساب"
              className="flex items-center gap-2 ps-1.5 pe-2.5 py-1 rounded-full border-2 border-clay/20 text-cocoa hover:border-terra hover:text-terra transition-colors shrink-0"
            >
              <span className="w-9 h-9 rounded-full bg-terra text-cream font-display font-bold text-sm flex items-center justify-center">
                {initial}
              </span>
              <span className="hidden lg:block text-[14px] font-bold">
                {displayName}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`w-4 h-4 transition-transform ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isUserMenuOpen ? (
              <div
                role="menu"
                aria-label="قائمة الحساب"
                className="absolute end-0 top-full mt-2 w-52 rounded-2xl border border-clay/10 bg-white shadow-[0_24px_48px_-24px_rgba(42,36,28,0.45)] p-2 animate-rise"
              >
                <Link
                  href="/account"
                  role="menuitem"
                  onClick={closeUserMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14.5px] font-semibold text-cocoa hover:bg-terra/10 hover:text-terra transition-colors"
                >
                  <UserRound
                    className="w-5 h-5 text-terra shrink-0"
                    aria-hidden="true"
                  />
                  حسابي
                </Link>
                <Link
                  href="/orders"
                  role="menuitem"
                  onClick={closeUserMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14.5px] font-semibold text-cocoa hover:bg-terra/10 hover:text-terra transition-colors"
                >
                  <History
                    className="w-5 h-5 text-terra shrink-0"
                    aria-hidden="true"
                  />
                  طلباتي
                </Link>
                <div
                  role="separator"
                  aria-hidden="true"
                  className="h-px bg-clay/10 my-1"
                />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-[14.5px] font-semibold text-error hover:bg-error/10 transition-colors"
                >
                  <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
                  تسجيل خروج
                </button>
              </div>
            ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
