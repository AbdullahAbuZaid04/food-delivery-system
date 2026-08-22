"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import BrandMark from "@components/ui/BrandMark";
import { useAuth } from "@context/AuthContext";
import { adminNavLinks, isAdminRouteActive } from "./AdminNavLinks";

// AdminDrawer — mobile side navigation with body scroll lock, Escape-to-close
// and a Tab focus trap (same accessibility pattern as OwnerDrawer, AGENTS.md §7).
export default function AdminDrawer({ open, onClose }) {
  const panelRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    onClose();
    await logout();
    toast.success("منوّر، بلاستقبال في أي وقت");
    router.push("/home");
  };

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll(
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
      className="fixed inset-0 z-[60] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="قائمة لوحة الإدارة"
    >
      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-y-0 start-0 flex w-72 max-w-[85%] flex-col bg-surface shadow-2xl outline-none animate-menu-in"
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-display font-black text-xl text-foreground">
              وجبة
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="shrink-0 border-b border-border px-5 py-4">
          <p className="text-[11px] font-bold text-muted mb-1.5">المنصة</p>
          <p className="text-[14.5px] font-bold text-foreground">
            لوحة الإدارة
          </p>
        </div>

        <nav
          aria-label="قائمة لوحة الإدارة"
          className="flex-1 space-y-1 overflow-y-auto p-3"
        >
          {adminNavLinks.map(({ href, label, icon: Icon }) => {
            const active = isAdminRouteActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-semibold transition-colors ${
                  active
                    ? "bg-primary/10 text-primary-dark"
                    : "text-muted hover:bg-muted/10 hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark font-display text-sm font-bold text-white shadow-sm ring-1 ring-primary/10">
              {user?.firstName?.trim().charAt(0) ?? "أ"}
            </span>
            <span className="truncate text-[14.5px] font-bold text-foreground">
              {user?.firstName ?? "الأدمن"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-error/30 px-3 py-3 text-[14px] font-bold text-error transition-colors hover:border-error hover:bg-error/5"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            تسجيل خروج
          </button>
        </div>
      </div>
    </div>
  );
}
