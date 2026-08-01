"use client";

import Link from "next/link";
import { ShoppingCart, UserRound, Menu } from "lucide-react";
import { useRef, useState } from "react";
import BrandMark from "@components/ui/BrandMark";
import MobileMenu from "@components/layout/MobileMenu";

/**
 * Header — fixed site header: brand, desktop nav, cart, login/CTA and the mobile
 * hamburger. Owns the mobile-menu open state and renders <MobileMenu />.
 */
function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef(null);

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    hamburgerRef.current?.focus();
  };

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
            {/* Cart icon, 44px touch target, visible on all breakpoints. Badge will show real count when the cart exists. */}
            <button
              className="relative w-11 h-11 flex items-center justify-center rounded-full border-2 border-clay/20 text-cocoa hover:border-terra hover:text-terra transition-colors shrink-0"
              aria-label="سلة الطلبات"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 border-2 border-terra text-terra font-bold text-sm px-5 py-3 rounded-full hover:bg-terra/5 transition-colors"
            >
              <UserRound className="w-4 h-4" />
              سجّل الدخول
            </Link>

            <a
              href="#restaurants"
              className="bg-terra text-cream font-bold text-sm px-5 sm:px-6 py-3 rounded-full shadow-[0_8px_20px_-8px_rgba(184,74,38,0.7)] hover:bg-terra-dark transition-colors"
            >
              اطلب الآن
            </a>

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
