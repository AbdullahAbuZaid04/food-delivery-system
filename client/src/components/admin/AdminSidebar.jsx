"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "@components/ui/BrandMark";
import { adminNavLinks, isAdminRouteActive } from "./AdminNavLinks";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 flex-col border-e border-border bg-surface">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <BrandMark />
        <span className="font-display font-black text-xl text-foreground">
          وجبة
        </span>
      </div>

      <div className="shrink-0 border-b border-border px-5 py-4">
        <p className="text-[11px] font-bold text-muted mb-1.5">المنصة</p>
        <p className="text-[14.5px] font-bold text-foreground">لوحة الإدارة</p>
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
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
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
    </aside>
  );
}
