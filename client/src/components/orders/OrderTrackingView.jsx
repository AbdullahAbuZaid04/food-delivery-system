"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Ban, ChevronRight, Clock, MapPin, X } from "lucide-react";
import AppHeader from "@components/customer/AppHeader";
import OrderStatusBadge from "@components/orders/OrderStatusBadge";
import OrderProgressSteps from "@components/orders/OrderProgressSteps";
import OrderReviewCard from "@components/orders/OrderReviewCard";
import CourierInfoCard from "@components/orders/CourierInfoCard";
import OrderTimeline from "@components/orders/OrderTimeline";
import OrderSummaryCard from "@components/checkout/OrderSummaryCard";
import { formatTime } from "@lib/format";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  ACTIVE_STATUS_CODES,
} from "@lib/constants";

function CancelOrderModal({
  open,
  orderNumber,
  isCancelling,
  error,
  onClose,
  onConfirm,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll(
        "button:not([disabled])",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (previouslyFocused?.focus) previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cocoa/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label="تأكيد إلغاء الطلب"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-[24px] bg-cream p-6 sm:p-7 shadow-[0_32px_64px_-32px_rgba(42,36,28,0.6)] outline-none animate-rise"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق التنبيه"
          className="absolute top-3 end-3 w-11 h-11 flex items-center justify-center rounded-full text-cocoa-soft hover:text-error hover:bg-error/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <span className="w-14 h-14 rounded-full bg-error/15 text-error flex items-center justify-center">
          <Ban className="w-7 h-7" strokeWidth={1.8} aria-hidden="true" />
        </span>

        <h2 className="mt-5 font-display font-black text-[20px] sm:text-[22px] text-cocoa leading-snug">
          إلغاء الطلب؟
        </h2>
        <p className="mt-2 text-cocoa-soft text-[14.5px] leading-relaxed">
          متأكد تريد إلغاء طلبك رقم{" "}
          <span
            dir="ltr"
            className="inline-block font-bold text-cocoa"
          >
            #{orderNumber}
          </span>
          ؟
        </p>
        <p className="mt-1.5 text-cocoa-soft text-[13px] leading-relaxed">
          هالإجراء ما رح يترجع.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-[13.5px] font-semibold text-error leading-relaxed"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-row gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isCancelling}
            className="h-12 flex-1 rounded-full bg-error text-cream font-bold text-[15px] flex items-center justify-center shadow-[0_12px_28px_-10px_rgba(220,38,38,0.7)] hover:bg-error/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCancelling ? "عم نلغي..." : "نعم، ألغِ الطلب"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="h-12 flex-1 rounded-full border-2 border-clay/20 text-cocoa font-bold text-[15px] flex items-center justify-center hover:border-terra hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            لا، رجّع
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelOrderControl({ onCancel, orderNumber }) {
  const [open, setOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setOpen(false);
    setError("");
  };

  const confirmCancel = async () => {
    setIsCancelling(true);
    setError("");
    try {
      await onCancel();
      setOpen(false);
    } catch (err) {
      setError(err?.message || "صارت مشكلة في إلغاء الطلب، جرب مرة تانية.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-error/30 bg-white px-6 text-error font-bold text-[15px] hover:border-error hover:bg-error/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
      >
        إلغاء الطلب
      </button>

      <CancelOrderModal
        open={open}
        orderNumber={orderNumber}
        isCancelling={isCancelling}
        error={error}
        onClose={close}
        onConfirm={confirmCancel}
      />
    </>
  );
}

export default function OrderTrackingView({ order, userName = "", onCancel, onReview }) {
  const subtotal = (order.items ?? []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = order.total - subtotal;
  const isCancelled = order.statusCode === "CANCELLED";
  const orderNumber = order.orderNumber
    ? order.orderNumber
    : String(order.id).replace(/\D/g, "");
  const showEta =
    ACTIVE_STATUS_CODES.has(order.statusCode) && Boolean(order.estimatedDeliveryAt);
  const showPayment = !isCancelled;
  const paymentMethodLabel =
    PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod ?? "—";
  const paymentStatusLabel =
    PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus ?? "—";

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={userName} showSearch={false} />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-20 md:pb-0">
        <Link
          href="/orders"
          className="inline-flex h-11 items-center gap-1 text-[14px] font-bold text-cocoa-soft hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          كل الطلبات
        </Link>

        <header className="mt-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 font-display font-black text-[clamp(24px,3vw,32px)] text-cocoa">
              {order.restaurantName}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="text-[14px] text-cocoa-soft">
              رقم الطلب{" "}
              <span dir="ltr" className="inline-block">
                #{orderNumber}
              </span>
            </p>
            {showEta ? (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-olive/10 px-3 py-1.5 text-[13px] font-bold text-olive-deep">
                <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                الوصول المتوقع: {formatTime(order.estimatedDeliveryAt)}
              </p>
            ) : null}
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="space-y-6">
            <OrderProgressSteps
              timeline={order.timeline ?? []}
              cancelled={isCancelled}
            />

            {order.courierName ? (
              <CourierInfoCard
                courierName={order.courierName}
                courierPhone={order.courierPhone}
              />
            ) : null}

            <OrderTimeline timeline={order.timeline ?? []} />

            {order.statusCode === "DELIVERED" ? (
              <OrderReviewCard
                review={order.review ?? null}
                onSubmit={onReview}
              />
            ) : null}

            <section
              aria-labelledby="delivery-address-title"
              className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
            >
              <h2
                id="delivery-address-title"
                className="flex items-center gap-2 font-display font-bold text-[17px] text-cocoa"
              >
                <MapPin
                  className="w-5 h-5 text-terra shrink-0"
                  aria-hidden="true"
                />
                عنوان التوصيل
              </h2>

              <dl className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[13.5px] font-bold text-cocoa">المنطقة</dt>
                  <dd className="text-[14px] text-cocoa-soft">
                    {order.deliveryAddress.area}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[13.5px] font-bold text-cocoa">
                    الحي / الشارع
                  </dt>
                  <dd className="text-end text-[14px] text-cocoa-soft">
                    {order.deliveryAddress.street}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[13.5px] font-bold text-cocoa">
                    رقم الهاتف للتواصل
                  </dt>
                  <dd
                    dir="ltr"
                    className="text-left text-[14px] text-cocoa-soft"
                  >
                    {order.deliveryAddress.phone}
                  </dd>
                </div>

                {showPayment ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[13.5px] font-bold text-cocoa">
                        طريقة الدفع
                      </dt>
                      <dd className="text-[14px] text-cocoa-soft">
                        {paymentMethodLabel}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[13.5px] font-bold text-cocoa">
                        حالة الدفع
                      </dt>
                      <dd
                        className={`text-[14px] ${
                          order.paymentStatus === "PAID"
                            ? "text-success"
                            : "text-cocoa-soft"
                        }`}
                      >
                        {paymentStatusLabel}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>
            </section>

            {(order.statusCode === "PENDING" || order.statusCode === "ACCEPTED") &&
            onCancel ? (
              <div className="hidden lg:flex justify-center">
                <CancelOrderControl
                  onCancel={onCancel}
                  orderNumber={orderNumber}
                />
              </div>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[88px]">
            <OrderSummaryCard
              items={order.items ?? []}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={order.total}
              restaurantName={order.restaurantName}
            />
          </aside>
        </div>

        {(order.statusCode === "PENDING" || order.statusCode === "ACCEPTED") &&
        onCancel ? (
          <div className="mt-6 flex lg:hidden justify-center">
            <CancelOrderControl
              onCancel={onCancel}
              orderNumber={orderNumber}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
