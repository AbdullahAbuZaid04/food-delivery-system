// src/components/orders/LastOrderTracking.jsx
// Client-side fallback for the /orders/[id] tracking route when the id is NOT one
// of the 6 static mock orders: the checkout screen persists the just-placed order
// in localStorage (wajba-last-order), so a brand-new order placed in this session
// can still render the full tracking screen instead of a 404.
//
// Reads localStorage in a useEffect (same hydration-safe pattern as
// CartContext, AGENTS.md §2), normalizes the stored checkout order onto the
// props shape OrderTrackingView expects, and calls notFound() when the id doesn't
// match — keeping the unknown-id behavior identical to the server-side lookup.
// Must never render during the pre-hydration pass, hence the loader.
"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import AppHeader from "@components/customer/AppHeader";
import OrderTrackingView from "@components/orders/OrderTrackingView";

const LAST_ORDER_KEY = "wajba-last-order";
const MOCK_USER_NAME = "أحمد";

export default function LastOrderTracking({ id }) {
  const [result, setResult] = useState({ order: null, resolved: false });

  useEffect(() => {
    let foundOrder = null;
    try {
      const raw = window.localStorage.getItem(LAST_ORDER_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        if (stored && stored.id === id) {
          // Normalize the checkout shape (address + phone) onto the tracking
          // shape (deliveryAddress) so OrderTrackingView stays agnostic.
          const street = [
            stored.address?.neighborhood,
            stored.address?.landmark,
          ]
            .filter(Boolean)
            .join(" — ");
          foundOrder = {
            id: stored.id,
            restaurantName: stored.restaurantName,
            status: stored.status ?? "قيد التحضير",
            timeline: stored.timeline ?? [],
            courierName: stored.courierName ?? null,
            courierPhone: stored.courierPhone ?? null,
            deliveryAddress: {
              area: stored.address?.area ?? "",
              street: street || "—",
              phone: stored.phone ?? "",
            },
            items: stored.items ?? [],
            total: stored.total ?? 0,
            estimatedDeliveryAt: stored.estimatedDeliveryAt ?? null,
            // Checkout stores the lowercase method ("cash"/"card"); the tracking
            // view expects the uppercase tokens of PAYMENT_METHOD_LABELS.
            paymentMethod:
              stored.paymentMethod === "card" ? "CARD" : "CASH",
            paymentStatus: stored.paymentStatus ?? "PENDING",
          };
        }
      }
    } catch {}

    // Single setState keeps the hydration-safe read of localStorage in one
    // effect pass (AGENTS.md §2); eslint-disable matches the same pattern the
    // order-confirmation page uses for its localStorage read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult({ order: foundOrder, resolved: true });
  }, [id]);

  if (!result.resolved) {
    return (
      <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
        <AppHeader userName={MOCK_USER_NAME} showSearch={false} />
        <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-16">
          <div className="mt-10 md:mt-12 min-h-[320px] flex flex-col items-center justify-center rounded-[24px] border border-dashed border-clay/25 bg-cream-deep/60 px-6 py-14 text-center">
            <span className="w-14 h-14 rounded-full bg-terra/10 flex items-center justify-center">
              <Loader2
                className="w-7 h-7 text-terra animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            </span>
            <p
              role="status"
              className="mt-4 font-display font-semibold text-[15px] text-cocoa"
            >
              عم نقرا تفاصيل طلبك…
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!result.order) {
    notFound();
  }

  return <OrderTrackingView order={result.order} />;
}
