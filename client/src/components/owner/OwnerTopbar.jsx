"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import BrandMark from "@components/ui/BrandMark";
import { useAuth } from "@context/AuthContext";
import { useOwner } from "@context/OwnerContext";
import { RESTAURANT_STATUS_LABELS } from "@lib/api/presenters";

export default function OwnerTopbar({ onOpenDrawer }) {
  const { user, logout } = useAuth();
  const { restaurant } = useOwner();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const isOpen = restaurant?.status === "OPEN";
  const initial = user?.firstName?.trim().charAt(0) ?? "م";

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
          aria-label="فتح قائمة لوحة المالك"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-muted/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Brand — shown below lg (the sidebar carries it on lg+). */}
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <BrandMark />
          </div>
          <span className="font-display text-[17px] font-black leading-none text-foreground">
            وجبة
          </span>
        </div>

        {restaurant ? (
          <>
            {/* lg+: centered name + status. */}
            <div className="hidden lg:flex min-w-0 flex-1 items-center justify-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span
                  aria-hidden="true"
                  className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping motion-reduce:animate-none ${
                    isOpen ? "bg-success" : "bg-muted"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    isOpen ? "bg-success" : "bg-muted"
                  }`}
                />
              </span>
              <span className="min-w-0 truncate text-sm font-bold text-foreground">
                {restaurant.name}
              </span>
              <span
                className={`hidden sm:inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isOpen ? "bg-success/15 text-success" : "bg-muted/15 text-muted"
                }`}
              >
                {RESTAURANT_STATUS_LABELS[restaurant.status] ?? restaurant.status}
              </span>
            </div>

            {/* <lg+: spacer, then the name pinned to the far end (left) of the
                header, right before the account menu. */}
            <div className="min-w-0 flex-1 lg:hidden" />
            <span className="min-w-0 max-w-[40vw] truncate text-sm font-bold text-foreground lg:hidden">
              {restaurant.name}
            </span>
          </>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="text-sm text-muted">مش فاعل بعد — أكمّل إعداد المطعم</span>
          </div>
        )}

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
              {user?.firstName ?? "المالك"}
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
                  <p className="text-[12px] text-cocoa-soft">مالك مطعم</p>
                </div>
              </div>
              <div role="separator" aria-hidden="true" className="my-1 h-px bg-clay/10" />
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
