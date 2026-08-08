"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ChevronRight, Loader2 } from "lucide-react";
import AppHeader from "@components/customer/AppHeader";
import SavedAddressPicker from "@components/checkout/SavedAddressPicker";
import PaymentMethodSelector from "@components/checkout/PaymentMethodSelector";
import OrderSummaryCard from "@components/checkout/OrderSummaryCard";
import { useCart } from "@context/CartContext";
import { useAuth } from "@context/AuthContext";
import { addAddress, getProfile } from "@lib/api/auth";
import { addToCart, clearCart as clearServerCart } from "@lib/api/cart";
import { createOrder } from "@lib/api/orders";
import { formatPrice } from "@lib/format";

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

function CheckoutLoadingShell() {
  const { user } = useAuth();
  const userName = user?.firstName ?? "";

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={userName} showSearch={false} />
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

function CheckoutPage() {
  const router = useRouter();
  const {
    hydrated,
    restaurantName,
    items,
    totalPrice,
    deliveryFee,
    clearCart,
  } = useCart();
  const { status, user } = useAuth();

  const [addresses, setAddresses] = useState(user?.addresses ?? []);
  const [selectedAddressId, setSelectedAddressId] = useState(
    () =>
      user?.addresses?.find((address) => address.isDefault)?.id ??
      user?.addresses?.[0]?.id ??
      "",
  );
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?next=/checkout");
    }
  }, [status, router]);

  useEffect(() => {
    if (!hydrated || isSubmitting) return;
    if (items.length === 0) router.replace("/cart");
  }, [hydrated, isSubmitting, items.length, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    getProfile()
      .then((profile) => {
        if (!active) return;
        const list = profile?.addresses ?? [];
        setAddresses(list);
        setPhone((current) => current || profile?.phone || "");
        setSelectedAddressId((current) =>
          current && list.some((address) => address.id === current)
            ? current
            : (list.find((address) => address.isDefault)?.id ??
              list[0]?.id ??
              ""),
        );
      })
      .catch(() => {})
      .finally(() => {
        if (active) setProfileLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [status]);

  const handleAddAddress = useCallback(
    async (payload) => {
      setIsSavingAddress(true);
      try {
        const created = await addAddress(payload);
        setAddresses((current) =>
          created.isDefault
            ? [...current.map((address) => ({ ...address, isDefault: false })), created]
            : [...current, created],
        );
        setSelectedAddressId(created.id);
        toast.success("ضيفنا عنوانك الجديد");
      } catch (err) {
        toast.error(err?.message || "صارت مشكلة في حفظ العنوان");
        throw err;
      } finally {
        setIsSavingAddress(false);
      }
    },
    [],
  );

  const phoneIsValid = /^05\d{8}$/.test(phone.trim());
  const canSubmit =
    !isSubmitting && selectedAddressId !== "" && phoneIsValid;
  const grandTotal = totalPrice + (deliveryFee || 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await clearServerCart();
      for (const entry of items) {
        await addToCart(entry.menuItemId, entry.quantity);
      }

      const order = await createOrder({
        addressId: selectedAddressId,
        phone: phone.trim(),
        paymentMethod: paymentMethod === "card" ? "CARD" : "CASH",
      });

      clearCart();
      toast.success("تأكد طلبك — شكرًا!");
      router.push(`/order-confirmation?order=${order.id}`);
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err?.message || "صارت مشكلة في تأكيد الطلب، جرب مرة تانية.");
    }
  };

  if (!hydrated || status === "loading" || status === "unauthenticated") {
    return <CheckoutLoadingShell />;
  }

  const userName = user?.firstName ?? "";

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={userName} showSearch={false} />

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
              <SavedAddressPicker
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                phone={phone}
                onPhoneChange={setPhone}
                onAddAddress={handleAddAddress}
                isAdding={isSavingAddress}
                autoOpenForm={profileLoaded && addresses.length === 0}
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
                deliveryFee={deliveryFee || 0}
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
