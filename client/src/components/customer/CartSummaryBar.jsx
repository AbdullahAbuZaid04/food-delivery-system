"use client";

import { ShoppingBag } from "lucide-react";
import { formatArabicCount, formatPrice } from "@lib/format";

function CartSummaryBar({ totalCount, totalPrice, onCheckout }) {
  const hasItems = totalCount > 0;

  return (
    <div
      inert={!hasItems}
      className={`fixed inset-x-0 bottom-0 z-40 pointer-events-none ${
        hasItems
          ? "animate-rise"
          : "opacity-0 translate-y-2 transition-all duration-200 motion-reduce:transition-none motion-reduce:opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1180px] xl:max-w-[1280px] px-4 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="pointer-events-auto flex items-center gap-3 rounded-[24px] bg-olive-deep text-cream p-3 sm:p-4 shadow-[0_-12px_40px_-12px_rgba(42,36,28,0.55)]">
          <div
            className="flex items-center gap-3 flex-1 min-w-0"
            aria-live="polite"
          >
            <span className="w-11 h-11 shrink-0 rounded-full bg-terra flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] text-cream/80 truncate">
                {formatArabicCount(totalCount)}
              </p>
              <p className="font-display font-bold text-[17px]">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            aria-label={`اطلب الآن — ${formatArabicCount(totalCount)}، المجموع ${formatPrice(totalPrice)}`}
            className="shrink-0 h-11 min-w-[120px] px-5 rounded-full bg-terra text-cream font-bold text-[14.5px] flex items-center justify-center shadow-[0_10px_24px_-10px_rgba(184,74,38,0.9)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cream"
          >
            اطلب الآن
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartSummaryBar;
