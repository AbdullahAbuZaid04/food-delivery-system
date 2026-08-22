import Link from "next/link";
import { Pencil } from "lucide-react";
import { formatPrice, toArabicDigits } from "@lib/format";

export default function OrderSummaryCard({
  items,
  subtotal,
  deliveryFee,
  total,
  restaurantName,
  editHref,
  footer,
}) {
  return (
    <section
      aria-labelledby="order-summary-title"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="order-summary-title"
          className="font-display font-bold text-[17px] text-cocoa"
        >
          ملخص طلبك
        </h2>
        {editHref ? (
          <Link
            href={editHref}
            className="inline-flex items-center gap-1.5 h-11 px-3 rounded-full text-terra font-bold text-[13px] hover:bg-terra/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            عدّل السلة
          </Link>
        ) : null}
      </div>

      {restaurantName ? (
        <p className="mt-1 text-[13px] text-cocoa-soft">{restaurantName}</p>
      ) : null}

      <ul className="mt-4 divide-y divide-clay/10">
        {items.map((entry) => (
          <li
            key={entry.menuItemId ?? entry.name}
            className="py-2.5 flex items-start justify-between gap-3"
          >
            <span className="text-[14.5px] font-medium text-cocoa">
              {entry.name}
              <span className="ms-1.5 text-[12.5px] text-cocoa-soft">
                × {toArabicDigits(entry.quantity)}
              </span>
            </span>
            <span className="shrink-0 font-display font-bold text-[14px] text-cocoa">
              {formatPrice(entry.price * entry.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-3 space-y-2.5 border-t border-clay/10 pt-4">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[14px] text-cocoa-soft">المجموع الفرعي</dt>
          <dd className="text-[14px] font-bold text-cocoa">
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[14px] text-cocoa-soft">رسوم التوصيل</dt>
          <dd className="text-[14px] font-bold text-cocoa">
            {formatPrice(deliveryFee)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-clay/10 pt-3">
          <dt className="text-[15px] font-bold text-cocoa">المجموع الكلي</dt>
          <dd className="font-display font-black text-[20px] text-terra">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>

      {footer ? <div className="mt-5">{footer}</div> : null}
    </section>
  );
}
