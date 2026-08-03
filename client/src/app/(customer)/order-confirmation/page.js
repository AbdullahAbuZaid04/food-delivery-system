"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Loader2, MapPin } from "lucide-react";
import AppHeader from "@components/customer/AppHeader";
import OrderSummaryCard from "@components/checkout/OrderSummaryCard";
import OrderSuccessHeader from "@components/checkout/OrderSuccessHeader";
import OrderProgressSteps from "@components/checkout/OrderProgressSteps";

const LAST_ORDER_KEY = "wajba-last-order";
const MOCK_USER_NAME = "أحمد";

function OrderConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let storedOrder = null;
    try {
      const raw = window.localStorage.getItem(LAST_ORDER_KEY);
      if (raw) storedOrder = JSON.parse(raw);
    } catch {}

    if (!storedOrder || !storedOrder.orderNumber) {
      router.replace("/home");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(storedOrder);
    setIsReady(true);
  }, [router]);

  if (!isReady || !order) {
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

  const addressLine = [order.address?.area, order.address?.neighborhood]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={MOCK_USER_NAME} showSearch={false} />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-8 md:pt-12 pb-16">
        <OrderSuccessHeader orderNumber={order.orderNumber} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="space-y-6">
            <OrderProgressSteps activeStep={0} />

            <section
              aria-labelledby="delivery-address-title"
              className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
            >
              <h2
                id="delivery-address-title"
                className="flex items-center gap-2 font-display font-bold text-[17px] text-cocoa"
              >
                <MapPin className="w-5 h-5 text-terra shrink-0" aria-hidden="true" />
                عنوان التوصيل
              </h2>
              <p className="mt-3 text-[15px] font-semibold text-cocoa">
                {addressLine}
              </p>
              {order.address?.landmark ? (
                <p className="mt-1 text-[13.5px] text-cocoa-soft">
                  أقرب معلم: {order.address.landmark}
                </p>
              ) : null}
              <p
                dir="ltr"
                className="mt-2 text-left text-[14px] font-medium text-cocoa-soft"
              >
                {order.phone}
              </p>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[88px]">
            <OrderSummaryCard
              items={order.items ?? []}
              subtotal={order.subtotal}
              deliveryFee={order.deliveryFee}
              total={order.total}
              restaurantName={order.restaurantName}
            />
          </aside>
        </div>

        <section className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex items-center justify-center gap-2 h-12 rounded-full border-2 border-dashed border-clay/25 bg-white/60 px-6 text-cocoa-soft font-bold text-[15px] cursor-not-allowed"
          >
            <Lock className="w-4.5 h-4.5" aria-hidden="true" />
            تتبع طلبك
            <span className="rounded-full bg-gold/20 text-gold px-2.5 py-0.5 text-[11.5px] font-bold">
              قريبًا
            </span>
          </button>
          <Link
            href="/home"
            className="inline-flex items-center justify-center gap-2 h-12 rounded-full bg-terra text-cream font-bold text-[15px] px-8 shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            ارجع للرئيسية
          </Link>
        </section>
      </main>
    </div>
  );
}

export default OrderConfirmationPage;
