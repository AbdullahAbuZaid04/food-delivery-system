// src/components/orders/OrderTrackingView.jsx
// Full per-order tracking screen, shared by two entry points so the layout is
// defined ONCE (AGENTS.md §3/§12):
//  - the static /orders/[id] route for the 6 mock orders, and
//  - a just-placed order stored in localStorage by the checkout screen, whose
//    route falls back to <LastOrderTracking/>, which reads the same storage and
//    renders this view with the exact same props shape.
// Pure presentational component (no hooks) — safe to render from both a Server
// Component and a Client Component.
//
// Layout (all read-only except the two placeholder actions at the bottom):
// header (restaurant + order # + ETA for active orders + status badge) →
// OrderProgressSteps summary → CourierInfoCard (only when the order is
// "بالطريق") → OrderTimeline details → read-only delivery address + payment
// info → OrderSummaryCard → disabled "إلغاء الطلب" (only for "قيد التحضير") +
// "تواصل مع الدعم" link.
import Link from "next/link";
import { ChevronRight, Clock, Headset, Lock, MapPin } from "lucide-react";
import AppHeader from "@components/customer/AppHeader";
import OrderStatusBadge from "@components/orders/OrderStatusBadge";
import OrderProgressSteps from "@components/orders/OrderProgressSteps";
import CourierInfoCard from "@components/orders/CourierInfoCard";
import OrderTimeline from "@components/orders/OrderTimeline";
import OrderSummaryCard from "@components/checkout/OrderSummaryCard";
import { formatTime, toArabicDigits } from "@lib/format";

const MOCK_USER_NAME = "أحمد";

const PAYMENT_METHOD_LABELS = {
  CASH: "كاش عند الاستلام",
  CARD: "بطاقة ائتمان",
};

const PAYMENT_STATUS_LABELS = {
  PAID: "مدفوع",
  PENDING: "غير مدفوع",
  CANCELLED: "أُلغي",
};

// ETA is only meaningful while the order is still moving toward the customer.
const ACTIVE_STATUSES = new Set(["قيد التحضير", "بالطريق"]);

export default function OrderTrackingView({ order }) {
  const subtotal = (order.items ?? []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = order.total - subtotal;
  const isCancelled = order.status === "ملغي";
  // "ord-1006" → "#١٠٠٦" — digits are Arabic-Indic, never Latin (AGENTS.md §5).
  const orderNumber = toArabicDigits(String(order.id).replace(/\D/g, ""));
  const showEta =
    ACTIVE_STATUSES.has(order.status) && Boolean(order.estimatedDeliveryAt);
  const showPayment = !isCancelled;
  const paymentMethodLabel =
    PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod ?? "—";
  const paymentStatusLabel =
    PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus ?? "—";

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={MOCK_USER_NAME} showSearch={false} />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-20 md:pb-0">
        <Link
          href="/orders"
          className="inline-flex h-11 items-center gap-1 text-[14px] font-bold text-cocoa-soft hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          كل الطلبات
        </Link>

        <header className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display font-black text-[clamp(24px,3vw,32px)] text-cocoa">
              {order.restaurantName}
            </h1>
            <p className="mt-1 text-[14px] text-cocoa-soft">
              رقم الطلب #{orderNumber}
            </p>
            {showEta ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-olive/10 px-3 py-1.5 text-[13px] font-bold text-olive-deep">
                <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                الوصول المتوقع: {formatTime(order.estimatedDeliveryAt)}
              </p>
            ) : null}
          </div>
          <OrderStatusBadge status={order.status} />
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

              <dl className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[13.5px] text-cocoa-soft">المنطقة</dt>
                  <dd className="text-[14px] font-bold text-cocoa">
                    {order.deliveryAddress.area}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[13.5px] text-cocoa-soft">الحي / الشارع</dt>
                  <dd className="text-end text-[14px] font-bold text-cocoa">
                    {order.deliveryAddress.street}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[13.5px] text-cocoa-soft">
                    رقم الهاتف للتواصل
                  </dt>
                  <dd
                    dir="ltr"
                    className="text-left text-[14px] font-bold text-cocoa"
                  >
                    {order.deliveryAddress.phone}
                  </dd>
                </div>

                {showPayment ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[13.5px] text-cocoa-soft">طريقة الدفع</dt>
                      <dd className="text-[14px] font-bold text-cocoa">
                        {paymentMethodLabel}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[13.5px] text-cocoa-soft">حالة الدفع</dt>
                      <dd
                        className={`text-[14px] font-bold ${
                          order.paymentStatus === "PAID"
                            ? "text-success"
                            : "text-cocoa"
                        }`}
                      >
                        {paymentStatusLabel}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>
            </section>
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

        <section className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          {order.status === "قيد التحضير" ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="إلغاء الطلب — قريبًا"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-dashed border-clay/25 bg-white/60 px-6 text-cocoa-soft font-bold text-[15px] cursor-not-allowed"
            >
              <Lock className="w-4.5 h-4.5" aria-hidden="true" />
              إلغاء الطلب
              <span className="rounded-full bg-gold/20 text-gold px-2.5 py-0.5 text-[11.5px] font-bold">
                قريبًا
              </span>
            </button>
          ) : null}

          <Link
            href="/account"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terra px-8 text-cream font-bold text-[15px] shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            <Headset className="w-5 h-5" aria-hidden="true" />
            تواصل مع الدعم
          </Link>
        </section>
      </main>
    </div>
  );
}
