"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@context/AuthContext";
import AdminDrawer from "./AdminDrawer";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

// AdminApp — the (admin) route group's client root: role guard + dashboard
// chrome. The layout is a server component that just renders
// <AdminApp>{children}</AdminApp>.
export default function AdminApp({ children }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/login?next=/admin");
    } else if (user.role !== "ADMIN") {
      router.replace("/home");
    }
  }, [status, user, router]);

  if (status === "loading" || !user || user.role !== "ADMIN") {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <AdminDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex min-h-screen flex-col lg:ps-64">
        <AdminTopbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[1280px]">
          {children}
        </main>
      </div>
    </div>
  );
}
