"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ChevronRight, Loader2 } from "lucide-react";
import AppHeader from "@components/customer/AppHeader";
import DeliveryAddressForm from "@components/checkout/DeliveryAddressForm";
import PaymentMethodSelector from "@components/checkout/PaymentMethodSelector";
import OrderSummaryCard from "@components/checkout/OrderSummaryCard";
import { useCart } from "@context/CartContext";
import { GAZA_AREAS } from "@lib/mock/gazaAreas";
import { formatPrice } from "@lib/format";
import { ORDER_PROGRESS_STEPS } from "@components/orders/OrderProgressSteps";

const DELIVERY_FEE = 5;
const MOCK_USER_NAME = "أحمد";
const LAST_ORDER_KEY = "wajba-last-order";
const CONFIRM_LOADING_MS = 800;
// Mock ETA for a fresh order — 40 minutes out, matching the mock timeline pace.
const ESTIMATED_DELIVERY_MS = 40 * 60 * 1000;

function ConfirmOrderButton({ canSubmit, isSubmitting, className = "" }) {
  return (
    <button
      type="submit"
      disabled={!canSubmit}
      aria-disabled={!canSubmit}
      className={`items-center justify-center gap-2 h-14 rounded-full bg-terra text-cream font-bold text-[15px] shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-terra ${className}`}
    >
      {isSubmitting ? (
        <>
          <Loader2
            className="w-5 h-5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          عم نأكد طلبك...
        </>
      ) : (
        <>
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
          أكّد الطلب
        </>
      )}
    </button>
  );
}

function CheckoutPage() {
  const router = useRouter();
  const { hydrated, restaurantName, items, totalPrice, clearCart } = useCart();

  const [area, setArea] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated || isSubmitting) return;
    if (items.length === 0) router.replace("/cart");
  }, [hydrated, isSubmitting, items.length, router]);

  const canSubmit = !isSubmitting && area !== "" && phone.trim() !== "";
  const grandTotal = totalPrice + DELIVERY_FEE;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const areaName = GAZA_AREAS.find((item) => item.id === area)?.name ?? area;
    const createdAt = new Date().toISOString();
    // Fake but unique tracking id — must match the /orders/[id] route so the
    // confirmation's "تتبع طلبك" link resolves to this stored order.
    const id = `ord-${String(Date.now()).slice(-6)}`;
    const order = {
      id,
      orderNumber: `WB-${String(Date.now()).slice(-6)}`,
      createdAt,
      status: "قيد التحضير",
      restaurantName,
      items,
      subtotal: totalPrice,
      deliveryFee: DELIVERY_FEE,
      total: grandTotal,
      address: {
        area: areaName,
        neighborhood: neighborhood.trim(),
        landmark: landmark.trim(),
      },
      phone: phone.trim(),
      paymentMethod,
      paymentStatus: "PENDING",
      estimatedDeliveryAt: new Date(
        Date.now() + ESTIMATED_DELIVERY_MS,
      ).toISOString(),
      // New order = confirmed + being prepared (the tracking screen reads this
      // timeline). Steps come from the shared ORDER_PROGRESS_STEPS list so the
      // canonical journey stays single-sourced (AGENTS.md §12).
      timeline: ORDER_PROGRESS_STEPS.map((step, index) => ({
        step,
        timestamp: index < 2 ? createdAt : null,
        completed: index === 0,
      })),
      courierName: null,
      courierPhone: null,
    };

    try {
      window.localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    } catch {}

    setIsSubmitting(true);
    window.setTimeout(() => {
      clearCart();
      toast.success("تأكد طلبك — شكرًا!");
      router.push("/order-confirmation");
    }, CONFIRM_LOADING_MS);
  };

  if (!hydrated) {
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
              عم نقرا سلتك…
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={MOCK_USER_NAME} showSearch={false} />

      <form onSubmit={handleSubmit} noValidate>
        <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-40 md:pb-16">
          <header>
            <h1 className="font-display font-black text-[clamp(24px,3vw,32px)] text-cocoa">
              إتمام الطلب
            </h1>
            <p className="mt-1 text-cocoa-soft text-[14px]">
              من {restaurantName} — خطوة وحدة وبيتأكد طلبك
            </p>
          </header>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
            <div className="space-y-6">
              <DeliveryAddressForm
                area={area}
                onAreaChange={setArea}
                neighborhood={neighborhood}
                onNeighborhoodChange={setNeighborhood}
                landmark={landmark}
                onLandmarkChange={setLandmark}
                phone={phone}
                onPhoneChange={setPhone}
              />

              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>

            <aside className="space-y-4 lg:sticky lg:top-[88px]">
              <OrderSummaryCard
                items={items}
                subtotal={totalPrice}
                deliveryFee={DELIVERY_FEE}
                total={grandTotal}
                restaurantName={restaurantName}
                editHref="/cart"
                footer={
                  <ConfirmOrderButton
                    canSubmit={canSubmit}
                    isSubmitting={isSubmitting}
                    className="hidden md:inline-flex w-full"
                  />
                }
              />
            </aside>
          </div>
        </main>

        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-clay/10 bg-cream/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 py-3 flex items-center gap-4">
            <div className="shrink-0">
              <p className="text-[11.5px] text-cocoa-soft">المجموع الكلي</p>
              <p className="font-display font-black text-[18px] text-terra">
                {formatPrice(grandTotal)}
              </p>
            </div>
            <div className="flex-1">
              <ConfirmOrderButton
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                className="flex md:hidden w-full"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
