"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@context/AuthContext";
import { OwnerProvider, useOwner } from "@context/OwnerContext";
import OwnerApprovalScreen from "./RestaurantApprovalView";
import OwnerDrawer from "./OwnerDrawer";
import OwnerSidebar from "./OwnerSidebar";
import OwnerTopbar from "./OwnerTopbar";

// OwnerApp — the (dashboard) route group's client root: it owns the restaurant
// context and the dashboard chrome. The layout is a server component that just
// renders <OwnerApp>{children}</OwnerApp>.
export default function OwnerApp({ children }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/login?next=/owner");
    } else if (user.role !== "OWNER") {
      router.replace("/home");
    }
  }, [status, user, router]);

  if (status === "loading" || !user || user.role !== "OWNER") {
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
    <OwnerProvider>
      <div className="min-h-screen bg-background text-foreground">
        <OwnerSidebar />
        <OwnerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <div className="flex min-h-screen flex-col lg:ps-64">
          <OwnerTopbar onOpenDrawer={() => setDrawerOpen(true)} />
          <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[1280px]">
            <OwnerMain>{children}</OwnerMain>
          </main>
        </div>
      </div>
    </OwnerProvider>
  );
}

// While the restaurant awaits admin approval (PENDING) or was rejected, the
// dashboard pages are hidden behind a single status screen — there's nothing
// to manage until the restaurant is live, and the owner can't self-approve.
// SUSPENDED keeps the normal dashboard (the owner can still review data).
function OwnerMain({ children }) {
  const { restaurant, restaurantLoading } = useOwner();
  if (
    !restaurantLoading &&
    restaurant?.status &&
    (restaurant.status === "PENDING" || restaurant.status === "REJECTED")
  ) {
    return <OwnerApprovalScreen status={restaurant.status} />;
  }
  return children;
}
