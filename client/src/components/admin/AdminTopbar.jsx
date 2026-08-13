"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import BrandMark from "@components/ui/BrandMark";
import { useAuth } from "@context/AuthContext";

export default function AdminTopbar({ onOpenDrawer }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const initial = user?.firstName?.trim().charAt(0) ?? "أ";

  const closeMenu = () => {
    setMenuOpen(false);
    buttonRef.current?.focus();
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    toast.success("منوّر، بلاستقبال في أي وقت");
    router.push("/home");
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) closeMenu();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 h-[72px] shrink-0 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-full items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="فتح قائمة لوحة الإدارة"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-muted/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Brand — mobile (lg:hidden); the sidebar carries it on lg+. */}
        <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <BrandMark />
          </div>
          <div className="min-w-0">
            <p className="font-display text-[17px] font-black leading-none text-foreground">
              وجبة
            </p>
            <p className="mt-1 truncate text-[12px] font-semibold text-muted">
              لوحة الإدارة
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-2.5 lg:flex">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 truncate text-sm font-bold text-foreground">
            لوحة الإدارة
          </span>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="قائمة الحساب"
            className="flex items-center gap-2 ps-1.5 pe-2.5 py-1 rounded-full border-2 border-clay/20 text-cocoa hover:border-terra hover:text-terra transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            <span className="w-9 h-9 rounded-full bg-terra text-cream font-display font-bold text-sm flex items-center justify-center">
              {initial}
            </span>
            <span className="hidden lg:block text-[14px] font-bold">
              {user?.firstName ?? "الأدمن"}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              aria-label="قائمة الحساب"
              className="absolute end-0 top-full mt-2 w-52 rounded-2xl border border-clay/10 bg-white shadow-[0_24px_48px_-24px_rgba(42,36,28,0.45)] p-2 animate-rise"
            >
              <div className="flex items-center gap-3 rounded-xl px-3 py-3">
                <span className="w-10 h-10 shrink-0 rounded-full bg-terra text-cream font-display font-bold text-sm flex items-center justify-center">
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-cocoa">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[12px] text-cocoa-soft">مدير المنصة</p>
                </div>
              </div>
              <div
                role="separator"
                aria-hidden="true"
                className="my-1 h-px bg-clay/10"
              />
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold text-error transition-colors hover:bg-error/10"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                تسجيل خروج
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
