"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import BrandMark from "@components/ui/BrandMark";
import { useAuth } from "@context/AuthContext";

// DriverApp — the (driver) route group's client root. It guards the driver
// dashboard (unauthenticated → /login?next=/driver, non-DRIVER → /home) and
// renders the slim mobile-first chrome: brand wordmark + account menu. The
// layout is a server component that just renders <DriverApp>{children}</DriverApp>.
export default function DriverApp({ children }) {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/login?next=/driver");
    } else if (user.role !== "DRIVER") {
      router.replace("/home");
    }
  }, [status, user, router]);

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

  if (status === "loading" || !user || user.role !== "DRIVER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <span
          aria-hidden="true"
          className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin motion-reduce:animate-none"
        />
        <span className="sr-only">جارٍ تحميل اللوحة…</span>
      </div>
    );
  }

  const initial = user?.firstName?.trim().charAt(0) ?? "س";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 h-[72px] shrink-0 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="flex h-full items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              <BrandMark />
            </div>
            <div className="min-w-0">
              <p className="font-display text-[17px] font-black leading-none text-foreground">
                وجبة
              </p>
              <p className="mt-1 truncate text-[12px] font-semibold text-muted">
                لوحة السائق
              </p>
            </div>
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="قائمة الحساب"
              className="flex items-center gap-2 ps-1.5 pe-2.5 py-1 rounded-full border-2 border-border bg-white/60 text-foreground transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="w-9 h-9 rounded-full bg-primary text-white font-display font-bold text-sm flex items-center justify-center">
                {initial}
              </span>
              <span className="hidden sm:block text-[14px] font-bold">
                {user?.firstName ?? "السائق"}
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
                className="absolute end-0 top-full mt-2 w-52 rounded-2xl border border-border bg-white p-2 shadow-[0_24px_48px_-24px_rgba(42,36,28,0.45)] animate-rise"
              >
                <div className="flex items-center gap-3 rounded-xl px-3 py-3">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-primary text-white font-display font-bold text-sm flex items-center justify-center">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[12px] text-muted">سائق توصيل</p>
                  </div>
                </div>
                <div
                  role="separator"
                  aria-hidden="true"
                  className="my-1 h-px bg-border"
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

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-6 xl:max-w-[1280px]">
        {children}
      </main>
    </div>
  );
}
