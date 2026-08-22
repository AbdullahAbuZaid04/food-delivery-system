"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@context/AuthContext";

// Routes that are safe for ANY authenticated role to browse — the public
// storefront + home. Everything else in the customer group (cart, checkout,
// orders, account…) is customer-only.
const CUSTOMER_ONLY_PATHS = [
  "/cart",
  "/checkout",
  "/orders",
  "/account",
  "/order-confirmation",
];

function isCustomerOnlyRoute(pathname) {
  return CUSTOMER_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// Role guard for the CUSTOMER route group. Guests may browse freely (each
// customer-only page handles its own "login required" redirect). An
// authenticated non-customer (OWNER/DRIVER/ADMIN) may still view the public
// storefront, but any customer-only route sends them to their dashboard
// (DRIVER → /driver, ADMIN → /admin, otherwise → /owner).
export default function CustomerGuard({ children }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      status === "authenticated" &&
      user?.role !== "CUSTOMER" &&
      isCustomerOnlyRoute(pathname)
    ) {
      router.replace(
        user?.role === "DRIVER"
          ? "/driver"
          : user?.role === "ADMIN"
            ? "/admin"
            : "/owner",
      );
    }
  }, [status, user, pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-cocoa">
        <span
          aria-hidden="true"
          className="w-10 h-10 rounded-full border-4 border-terra/30 border-t-terra animate-spin motion-reduce:animate-none"
        />
        <span className="sr-only">جارٍ تحميل الجلسة…</span>
      </div>
    );
  }

  return children;
}
