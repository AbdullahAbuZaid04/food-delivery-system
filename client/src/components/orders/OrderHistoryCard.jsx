"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, ChevronLeft, Loader2, RotateCcw } from "lucide-react";
import OrderStatusBadge from "@components/orders/OrderStatusBadge";
import { useCart } from "@context/CartContext";
import { formatOrderDate, formatPrice, toArabicDigits } from "@lib/format";

const ACTIVE_STATUS_CODES = new Set([
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
]);

function summarizeItems(items) {
  const names = items.map((item) => item.name);
  if (names.length <= 2) return names.join("، ");
  return `${names.slice(0, 2).join("، ")} +${toArabicDigits(names.length - 2)} صنف تاني`;
}

function OrderHistoryCard({ order }) {
  const router = useRouter();
  const { clearCart, setDeliveryFee, addItem } = useCart();
  const [isReordering, setIsReordering] = useState(false);

  const isActive = ACTIVE_STATUS_CODES.has(order.statusCode);

  const handleReorder = async () => {
    if (!order.restaurantSlug || order.items.length === 0) {
      toast.error("ما بنقدر نعيد نفس الطلبية لهالطلب");
      return;
    }
    setIsReordering(true);
    clearCart();
    setDeliveryFee(order.deliveryFee);
    order.items.forEach((item) => {
      addItem(
        { id: item.menuItemId, name: item.name, price: item.price, image: item.image },
        order.restaurantId,
        order.restaurantName,
      );
    });
    toast.success("عبّينا سلتك بنفس الطلبية — كمل من عندك");
    router.push(`/restaurants/${order.restaurantSlug}`);
    setIsReordering(false);
  };

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
          onClick={handleReorder}
          disabled={isReordering}
          className="relative z-20 inline-flex items-center justify-center gap-2 h-12 rounded-full bg-terra text-cream font-bold text-[14px] px-5 shadow-[0_10px_22px_-10px_rgba(184,74,38,0.9)] hover:bg-terra-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
        >
          {isReordering ? (
            <Loader2
              className="w-4 h-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          )}
          اطلب نفس الطلبية
        </button>
      </div>
    </article>
  );
}

export default OrderHistoryCard;
