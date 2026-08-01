"use client";

import Link from "next/link";
import { X, ChevronLeft, UserRound } from "lucide-react";
import { useEffect, useRef } from "react";
import BrandMark from "@components/ui/BrandMark";
import { mobileMenuLinks } from "@lib/constants";

/**
 * MobileMenu — opaque full-screen overlay with body scroll lock, focus move on
 * open, Escape-to-close and a Tab focus trap (AGENTS.md §7).
 * @param {boolean} open - whether the menu is currently shown.
 * @param {() => void} onClose - closes the menu and restores focus to the hamburger.
 */
function MobileMenu({ open, onClose }) {
  const menuRef = useRef(null);

  // lock body scroll while the menu is open, and move focus into it
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    menuRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // close with Escape and keep Tab focus trapped inside the menu
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = menuRef.current?.querySelectorAll(
        "a[href], button:not([disabled])",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="القائمة الرئيسية"
      tabIndex={-1}
      className="fixed inset-0 z-[60] md:hidden flex flex-col bg-cream animate-menu-in outline-none"
    >
      <div className="shrink-0 border-b border-clay/10 bg-cream/95 backdrop-blur-md">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <a
            href="#"
            onClick={onClose}
            className="flex items-center gap-2.5 text-terra"
          >
            <BrandMark />
            <span className="font-display font-black text-2xl text-cocoa">
              وجبة
            </span>
          </a>
          <button
            className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-clay/20 text-cocoa hover:border-terra hover:text-terra transition-colors"
            onClick={onClose}
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-6 pb-12">
        <p className="text-[13px] font-bold text-terra mb-3">شو بدك تشوف؟</p>
        <nav className="flex flex-col gap-2.5">
          {mobileMenuLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between gap-3 rounded-2xl border border-clay/10 bg-cream-deep px-4 py-3.5 text-[16px] font-semibold text-cocoa hover:border-terra/40 hover:text-terra transition"
            >
              <span className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-terra/10 text-terra flex items-center justify-center shrink-0">
                  {item.icon}
                </span>
                {item.label}
              </span>
              <ChevronLeft className="w-4 h-4 text-cocoa-soft shrink-0" />
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3 mt-8">
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-terra text-terra font-bold text-base py-3.5 hover:bg-terra/5 transition-colors"
          >
            <UserRound className="w-5 h-5" />
            سجّل الدخول
          </Link>
          <a
            href="#restaurants"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-full bg-terra text-cream font-bold text-base py-3.5 shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors"
          >
            اطلب الآن
          </a>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
