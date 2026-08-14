"use client";

import Link from "next/link";
import { CircleCheck, MapPin, Phone } from "lucide-react";

export default function SavedAddressPicker({
  addresses,
  selectedId,
  onSelect,
  phone,
}) {
  return (
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

      {addresses.length > 0 ? (
        <div
          role="radiogroup"
          aria-label="اختار عنوان التوصيل"
          className="mt-5 grid gap-3"
        >
          {addresses.map((address) => {
            const isSelected = address.id === selectedId;
            const extraLine = [address.building, address.details]
              .filter(Boolean)
              .join(" — ");
            return (
              <label
                key={address.id}
                className={`relative flex items-start gap-3 rounded-[20px] border-2 p-4 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-terra/40 ${
                  isSelected
                    ? "border-terra bg-white ring-1 ring-terra/30"
                    : "border-clay/20 bg-white hover:border-terra/40"
                }`}
              >
                <input
                  type="radio"
                  name="checkout-address"
                  value={address.id}
                  checked={isSelected}
                  onChange={() => onSelect(address.id)}
                  className="sr-only"
                />
                <span
                  className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-terra/12 text-terra"
                      : "bg-clay/10 text-cocoa-soft"
                  }`}
                >
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold text-cocoa">
                      {address.label}
                    </span>
                    {address.isDefault ? (
                      <span className="rounded-full bg-terra/12 text-terra px-3 py-1 text-[11.5px] font-bold">
                        افتراضي
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-cocoa-soft leading-relaxed">
                    {address.city} · {address.street}
                  </span>
                  {extraLine ? (
                    <span className="mt-0.5 block text-[12.5px] text-cocoa-soft/80 leading-relaxed">
                      {extraLine}
                    </span>
                  ) : null}
                </span>
                {isSelected ? (
                  <CircleCheck
                    className="w-6 h-6 text-terra shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className="w-6 h-6 shrink-0 rounded-full border-2 border-clay/30"
                    aria-hidden="true"
                  />
                )}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-[20px] border-2 border-dashed border-clay/25 bg-white/60 p-4 sm:p-5">
          <p className="text-[13.5px] text-cocoa-soft leading-relaxed">
            لسا ما عندك عناوين محفوظة — ضيف عنوانك من الصفحة الشخصية وتعال أكمل
            طلبك.
          </p>
          <Link
            href="/account"
            className="mt-3 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-terra text-cream font-bold text-[14px] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            <MapPin className="w-5 h-5" aria-hidden="true" />
            أضف عنوانك
          </Link>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-dashed border-clay/20">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-cocoa">
            <Phone className="w-4 h-4 text-terra shrink-0" aria-hidden="true" />
            رقم الهاتف للتواصل
          </p>
          <p
            dir="ltr"
            className="mt-2 w-full rounded-2xl border-2 border-clay/15 bg-clay/10 px-4 py-3 text-left text-cocoa-soft/70 select-none cursor-not-allowed"
          >
            {phone}
          </p>
          <p className="mt-1.5 text-[12.5px] text-cocoa-soft/80">
            رقمك المسجّل في حسابك — السائق بيعتمد عليه لو احتاج يتواصل معك.
          </p>
        </div>
        <p className="mt-2 text-[12.5px] text-cocoa-soft/80">
          بتقدر تدير عناوينك المحفوظة و رقم الهاتف من{" "}
          <Link
            href="/account"
            className="text-terra font-semibold underline underline-offset-2 hover:text-terra-dark transition-colors"
          >
            الصفحة الشخصية
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
