// src/components/orders/CourierInfoCard.jsx
// Small card for the active courier — rendered ONLY when the order is on the way
// (courierName exists). Shows a circular avatar with the courier's first letter,
// their name and role, plus a call button.
//
// The call button is a deliberate visual-only placeholder: it needs a real
// call/contact system (or at least a verified phone number), which is out of
// scope for this phase. It is `disabled` + `aria-disabled` and carries a visible
// "قريبًا" badge + aria-describedby note so the disabled state is never
// communicated by color alone (AGENTS.md §7).
import { Phone } from "lucide-react";

export default function CourierInfoCard({ courierName }) {
  if (!courierName) return null;

  const initial = courierName.trim().charAt(0) || "؟";

  return (
    <section
      aria-labelledby="courier-title"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
    >
      <h2
        id="courier-title"
        className="font-display font-bold text-[17px] text-cocoa"
      >
        المندوب
      </h2>

      <div className="mt-4 flex items-center gap-3">
        <span
          className="w-12 h-12 shrink-0 rounded-full bg-terra text-cream font-display font-bold text-lg flex items-center justify-center"
          aria-hidden="true"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-cocoa">
            {courierName}
          </p>
          <p className="text-[12.5px] text-cocoa-soft">مندوب التوصيل</p>
        </div>
      </div>

      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label={`اتصال بالمندوب ${courierName} — قريبًا`}
        aria-describedby="courier-call-note"
        className="mt-4 inline-flex w-full h-12 items-center justify-center gap-2 rounded-full border-2 border-dashed border-clay/25 bg-white/60 px-5 text-cocoa-soft font-bold text-[14px] cursor-not-allowed"
      >
        <Phone className="w-4.5 h-4.5" aria-hidden="true" />
        اتصال
        <span className="rounded-full bg-gold/20 text-gold px-2.5 py-0.5 text-[11.5px] font-bold">
          قريبًا
        </span>
      </button>

      <p
        id="courier-call-note"
        className="mt-2 text-center text-[12px] text-cocoa-soft"
      >
        خدمة الاتصال المباشر بالمندوب لسّا ما اشتغلت — هيجي قريبًا
      </p>
    </section>
  );
}
