// src/components/account/SavedAddressesList.jsx
// قائمة عناوين التوصيل المحفوظة بصفحة "حسابي". بتمشي على نفس شكل
// user.addresses اللي بترجعه استجابة GET /api/auth/profile (label، city،
// street، building، details، isDefault). الحذف بشيل العنوان من state محلي
// مباشرة — بدون تأكيد معقد ولا API (مرحلة UI بس). زر "أضف عنوان جديد" معطّل
// بصريًا مع badge "قريبًا" — فورم إضافة عنوان كامل خارج نطاق هالمرحلة.
"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";

function SavedAddressesList({ addresses }) {
  const [items, setItems] = useState(addresses);

  const handleDelete = (id) => {
    setItems((current) => current.filter((address) => address.id !== id));
  };

  return (
    <section
      aria-labelledby="saved-addresses-title"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
    >
      <h2
        id="saved-addresses-title"
        className="flex items-center gap-2 font-display font-bold text-[17px] text-cocoa"
      >
        <MapPin className="w-5 h-5 text-terra shrink-0" aria-hidden="true" />
        العناوين المحفوظة
      </h2>

      {items.length > 0 ? (
        <ul className="mt-4 divide-y divide-clay/10">
          {items.map((address) => {
            const extraLine = [address.building, address.details]
              .filter(Boolean)
              .join(" — ");
            return (
              <li
                key={address.id}
                className="flex items-center gap-3 py-3.5 first:pt-1 last:pb-1"
              >
                <span className="w-11 h-11 shrink-0 rounded-full bg-terra/10 text-terra flex items-center justify-center">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[15px] font-bold text-cocoa">
                      {address.label}
                    </p>
                    {address.isDefault ? (
                      <span className="shrink-0 rounded-full bg-terra/12 text-terra px-3 py-1 text-[11.5px] font-bold">
                        افتراضي
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[13px] text-cocoa-soft leading-relaxed">
                    {address.city} · {address.street}
                  </p>
                  {extraLine ? (
                    <p className="mt-0.5 text-[12.5px] text-cocoa-soft/80 leading-relaxed">
                      {extraLine}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  aria-label={`احذف عنوان ${address.label}`}
                  className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-cocoa-soft hover:text-error hover:bg-error/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
                >
                  <Trash2 className="w-5 h-5" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-[13.5px] text-cocoa-soft leading-relaxed">
          لسا ما أضفت عناوين محفوظة — إضافة عنوان هتكون متاحة قريبًا.
        </p>
      )}

      <div className="mt-5 pt-5 border-t border-dashed border-clay/20">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full border-2 border-dashed border-clay/25 bg-white/60 text-cocoa-soft font-bold text-[14px] disabled:cursor-not-allowed select-none"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          أضف عنوان جديد
          <span className="rounded-full bg-gold/20 text-gold px-3 py-1 text-[11.5px] font-bold">
            قريبًا
          </span>
        </button>
        {/* TODO: فورم "أضف عنوان جديد" كامل (label + city/street/building/details
            + حفظ بالحساب عبر الـ API) خارج نطاق هالمرحلة — الزر فوق معطّل عن
            قصد ومحدد بمرحلة لاحقة (AGENTS.md §11). */}
      </div>
    </section>
  );
}

export default SavedAddressesList;
