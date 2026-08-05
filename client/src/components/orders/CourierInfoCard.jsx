// src/components/orders/CourierInfoCard.jsx
// Small card for the active courier — rendered ONLY when the order is on the way
// (courierName exists). Shows a circular avatar with the courier's first letter,
// their name and role, plus a call button that opens the dialer via a `tel:`
// link (phone numbers are LTR, AGENTS.md §5).
//
// If a courier has no phone number yet (mock/API gap), the button falls back to
// the disabled "قريبًا" placeholder instead of a dead link — the disabled state
// is still never communicated by color alone (AGENTS.md §7).
import { Phone } from "lucide-react";

export default function CourierInfoCard({ courierName, courierPhone }) {
  if (!courierName) return null;

  const initial = courierName.trim().charAt(0) || "؟";
  const canCall = Boolean(courierPhone);

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

      {canCall ? (
        <a
          href={`tel:${courierPhone}`}
          aria-label={`اتصال بالمندوب ${courierName}`}
          className="mt-4 inline-flex w-full h-12 items-center justify-center gap-2 rounded-full bg-olive text-cream font-bold text-[14px] shadow-[0_12px_28px_-10px_rgba(58,68,41,0.6)] hover:bg-olive-deep transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40"
        >
          <Phone className="w-4.5 h-4.5" aria-hidden="true" />
          اتصال
          <span dir="ltr" className="text-[12px] font-semibold opacity-90">
            {courierPhone}
          </span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label={`اتصال بالمندوب ${courierName} — قريبًا`}
          className="mt-4 inline-flex w-full h-12 items-center justify-center gap-2 rounded-full border-2 border-dashed border-clay/25 bg-white/60 px-5 text-cocoa-soft font-bold text-[14px] cursor-not-allowed"
        >
          <Phone className="w-4.5 h-4.5" aria-hidden="true" />
          اتصال
          <span className="rounded-full bg-gold/20 text-gold px-2.5 py-0.5 text-[11.5px] font-bold">
            قريبًا
          </span>
        </button>
      )}
    </section>
  );
}
