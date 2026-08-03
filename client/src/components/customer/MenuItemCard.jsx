"use client";

import Image from "next/image";
import { Ban, Minus, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCart } from "@context/CartContext";
import { formatPrice, toArabicDigits } from "@lib/format";

/**
 * MenuItemCard — reads quantity + cart actions straight from CartContext
 * (no more addItem/updateQuantity props from the parent page). When addItem
 * reports a restaurant conflict it calls the optional `onConflict` callback so
 * the parent page can open RestaurantConflictModal.
 */
function MenuItemCard({ item, restaurantId, restaurantName, onConflict }) {
  const { items, addItem, updateQuantity } = useCart();

  const isAvailable = item.isAvailable;
  const quantity =
    items.find((entry) => entry.menuItemId === item.id)?.quantity ?? 0;
  const hasQuantity = quantity > 0;

  const handleAdd = () => {
    const result = addItem(item, restaurantId, restaurantName);
    if (result?.conflict) {
      onConflict?.({ item, restaurantId, restaurantName });
      return;
    }
    toast.success(`ضفنا "${item.name}" عالسلة`);
  };

  const handleIncrement = () => {
    const result = addItem(item, restaurantId, restaurantName);
    if (result?.conflict) {
      onConflict?.({ item, restaurantId, restaurantName });
    }
  };

  const handleDecrement = () => {
    updateQuantity(item.id, quantity - 1);
    if (quantity - 1 <= 0) {
      toast.success(`شلنا "${item.name}" من السلة`);
    }
  };

  return (
    <article
      className={`relative flex items-center gap-4 rounded-[24px] border border-clay/10 bg-cream-deep p-4 sm:p-5 transition ${
        isAvailable ? "" : "opacity-50"
      }`}
    >
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden border border-clay/10 bg-cream">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 96px, 128px"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-[16px] sm:text-[17px] text-cocoa">
            {item.name}
          </h3>
          {!isAvailable ? (
            <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-clay/15 text-cocoa-soft text-[11.5px] font-bold px-3 py-1.5">
              <Ban className="w-3.5 h-3.5" aria-hidden="true" />
              غير متوفر حاليًا
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-[13.5px] text-cocoa-soft leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="font-display font-bold text-[16px] text-terra">
            {formatPrice(item.price)}
          </p>

          {hasQuantity ? (
            <div className="flex items-center rounded-full bg-terra text-cream overflow-hidden shrink-0">
              <button
                type="button"
                onClick={handleIncrement}
                aria-label={`زِد كمية ${item.name}`}
                className="w-11 h-11 flex items-center justify-center hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream"
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
              </button>
              <span
                aria-live="polite"
                className="min-w-8 text-center font-bold text-[14px]"
              >
                {toArabicDigits(quantity)}
              </span>
              <button
                type="button"
                onClick={handleDecrement}
                aria-label={`نقّص كمية ${item.name}`}
                className="w-11 h-11 flex items-center justify-center hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream"
              >
                <Minus className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={isAvailable ? handleAdd : undefined}
              disabled={!isAvailable}
              aria-disabled={!isAvailable}
              aria-label={`أضف ${item.name} إلى السلة`}
              className="w-11 h-11 shrink-0 rounded-full bg-terra text-cream text-[12.5px] font-bold flex items-center justify-center shadow-[0_10px_22px_-10px_rgba(184,74,38,0.9)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              أضف
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default MenuItemCard;
