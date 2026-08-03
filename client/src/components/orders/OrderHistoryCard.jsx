// src/components/orders/OrderHistoryCard.jsx
// One card per past order in the "طلباتي" screen: restaurant, date, status
// badge, a short item summary, the total and a "اطلب نفس الطلبية" button.
//
// Click behavior depends on the order status:
// - Active orders (قيد التحضير / بالطريق): the WHOLE card is a Link (absolute
//   overlay, same pattern as RestaurantCard) so tapping anywhere on the card
//   opens the per-order tracking page /orders/[order.id] — with a hover bg
//   change + a small "اضغط لمتابعة التتبع" hint as the visual affordance
//   (AGENTS.md §6).
// - Past orders (تم التوصيل / ملغي): the card is NOT clickable as a whole —
//   the reorder button is the only interactive element.
// The reorder button is a visual-only placeholder this phase.
import Link from "next/link";
import { CalendarDays, ChevronLeft, RotateCcw } from "lucide-react";
import OrderStatusBadge from "@components/orders/OrderStatusBadge";
import { formatOrderDate, formatPrice, toArabicDigits } from "@lib/format";

const ACTIVE_STATUSES = ["قيد التحضير", "بالطريق"];

function summarizeItems(items) {
  const names = items.map((item) => item.name);
  if (names.length <= 2) return names.join("، ");
  return `${names.slice(0, 2).join("، ")} +${toArabicDigits(names.length - 2)} صنف تاني`;
}

function OrderHistoryCard({ order }) {
  const isActive = ACTIVE_STATUSES.includes(order.status);

  return (
    <article
      className={`relative rounded-[24px] border bg-cream-deep p-5 sm:p-6 transition-colors ${
        isActive
          ? "border-terra/25 hover:border-terra/40 hover:bg-cream"
          : "border-clay/10"
      }`}
    >
      {isActive ? (
        <Link
          href={`/orders/${order.id}`}
          aria-label={`متابعة تتبع طلبك من ${order.restaurantName}`}
          className="absolute inset-0 z-10 rounded-[24px] focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-[16.5px] text-cocoa">
          {order.restaurantName}
        </h3>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-cocoa-soft">
        <CalendarDays className="w-4 h-4 shrink-0" aria-hidden="true" />
        {formatOrderDate(order.date)} · {order.deliveryArea}
      </p>

      {isActive ? (
        <p className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-terra">
          اضغط لمتابعة التتبع
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </p>
      ) : null}

      <p className="mt-3 text-[13.5px] text-cocoa leading-relaxed">
        {summarizeItems(order.items)}
      </p>

      <div className="mt-4 pt-4 border-t border-dashed border-clay/20 flex flex-wrap items-center justify-between gap-3">
        <p className="font-display font-bold text-[16px] text-terra">
          {formatPrice(order.total)}
        </p>

        <button
          type="button"
          onClick={(event) => {
            // لا تدع ضغطة "اطلب نفس الطلبية" تفعّل Link البطاقة (للطلبات
            // الجارية) — بوقف انتشار الحدث والسلوك الافتراضي عشان ما يصير
            // تعارض بين الضغطتين. الـ z-20 كمان بيفصلها عن overlay الـ Link.
            event.preventDefault();
            event.stopPropagation();
            // TODO: "اطلب نفس الطلبية" — هاد الزر لاحقًا رح يعبّي CartContext
            // تلقائيًا بنفس عناصر الطلب القديم وينقل المستخدم لصفحة المطعم.
            // خارج نطاق هالمرحلة — بس console.log للتوثيق.
            console.log("reorder", order.id);
          }}
          className="relative z-20 inline-flex items-center justify-center gap-2 h-12 rounded-full bg-terra text-cream font-bold text-[14px] px-5 shadow-[0_10px_22px_-10px_rgba(184,74,38,0.9)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          اطلب نفس الطلبية
        </button>
      </div>
    </article>
  );
}

export default OrderHistoryCard;
