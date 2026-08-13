"use client";

import Link from "next/link";
import {
  ChevronDown,
  History,
  LogOut,
  Menu,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import BrandMark from "@components/ui/BrandMark";
import MobileMenu from "@components/layout/MobileMenu";
import { useCart } from "@context/CartContext";
import { useAuth } from "@context/AuthContext";
import { formatArabicCount, toArabicDigits } from "@lib/format";

/**
 * Header — fixed marketing header: brand, desktop nav, cart (live count, links
 * to /cart) and an auth-aware sign-in/avatar area. Owns the mobile-menu open
 * state and renders <MobileMenu />. The "اطلب الآن" CTA was removed by product
 * decision — the "المطاعم" nav link (and hero "شوف المطاعم") already anchor to
 * the same #restaurants section.
 *
 * Auth state comes from AuthContext (the marketing page is public — signed-in
 * users are allowed to visit it), so the header shows the avatar menu when
 * signed in and the sign-in CTA only for guests (same pattern as AppHeader).
 */
function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const { totalItems } = useCart();
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const avatarButtonRef = useRef(null);

  // While AuthContext is still restoring we don't know yet whether the visitor
  // is signed in — render a neutral placeholder so a returning user doesn't
  // flash a "سجل الدخول" button (same rule as AppHeader).
  const isAuthLoading = status === "loading";
  const displayName = user?.firstName ?? "";
  const isGuest = !displayName && !isAuthLoading;

  const cartBadge = totalItems > 0 ? toArabicDigits(totalItems) : null;
  const cartLabel =
    totalItems > 0
      ? `سلة الطلبات — فيك ${formatArabicCount(totalItems)}`
      : "سلة الطلبات — فاضية";

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    hamburgerRef.current?.focus();
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
    avatarButtonRef.current?.focus();
  };

  const handleLogout = async () => {
    closeUserMenu();
    await logout();
    toast.success("منوّر، بلاستقبال في أي وقت");
    router.push("/");
  };

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onPointerDown = (event) => {
      if (!userMenuRef.current?.contains(event.target)) closeUserMenu();
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
    <>
      <header className="fixed top-0 z-50 w-full bg-cream/90 backdrop-blur-md border-b border-clay/10">
        <nav className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4 sm:gap-6">
          <a href="#" className="flex items-center gap-2.5 text-terra">
            <BrandMark />
            <span className="font-display font-black text-2xl text-cocoa">
              وجبة
            </span>
          </a>

          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-7 text-[15px] font-medium text-cocoa-soft">
            <a
              href="#restaurants"
              className="py-2 hover:text-terra transition-colors"
            >
              المطاعم
            </a>
            <a href="#how" className="py-2 hover:text-terra transition-colors">
              كيف بتوصل؟
            </a>
            <a
              href="#voice"
              className="py-2 hover:text-terra transition-colors"
            >
              كلام الزباين
            </a>
            <a
              href="#contact"
              className="py-2 hover:text-terra transition-colors"
            >
              كلمنا
            </a>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Cart icon → live /cart link with real count (AGENTS.md §11). */}
            <Link
              href="/cart"
              aria-label={cartLabel}
              className="relative w-11 h-11 flex items-center justify-center rounded-full border-2 border-clay/20 text-cocoa hover:border-terra hover:text-terra transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
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
                className="hidden sm:inline-flex items-center gap-2 border-2 border-terra text-terra font-bold text-sm px-5 py-3 rounded-full hover:bg-terra/5 transition-colors"
              >
                <UserRound className="w-4 h-4" />
                سجّل الدخول
              </Link>
            ) : isAuthLoading ? (
              <span
                aria-hidden="true"
                className="hidden sm:flex w-11 h-11 rounded-full bg-terra/20 text-terra font-display font-bold text-sm items-center justify-center shrink-0"
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
                    className="absolute start-0 top-full mt-2 w-52 rounded-2xl border border-clay/10 bg-white shadow-[0_24px_48px_-24px_rgba(42,36,28,0.45)] p-2 animate-rise"
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

            {/* Hamburger menu button for mobile (visible below md) */}
            <button
              ref={hamburgerRef}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-full border-2 border-clay/20 text-cocoa hover:border-terra hover:text-terra transition-colors shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={isMobileMenuOpen} onClose={closeMenu} />
    </>
  );
}

export default Header;
