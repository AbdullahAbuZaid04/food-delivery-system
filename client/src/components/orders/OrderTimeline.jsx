// src/components/orders/OrderTimeline.jsx
// Detailed vertical timeline of the order's journey — the expanded version of the
// horizontal OrderProgressSteps summary (which stays a one-line glance up top).
// Each row: a small dot (filled terra when completed, empty outline otherwise) +
// a vertical connector running down to the next dot + the step name and its
// timestamp beside it. Future steps have no timestamp yet and show a short
// "لم يصل بعد" hint instead (AGENTS.md §6: no info by color alone — text carries
// the state too).
//
// The month-name array mirrors the one in @lib/format.js; it's kept local on
// purpose so this read-only display doesn't grow format.js's API for a single
// consumer. Arabic-Indic digits come from toArabicDigits (AGENTS.md §5).
import { Clock } from "lucide-react";
import { toArabicDigits } from "@lib/format";

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

function formatTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const period = date.getHours() >= 12 ? "م" : "ص";
  const hour12 = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${toArabicDigits(date.getDate())} ${ARABIC_MONTHS[date.getMonth()]} ${toArabicDigits(date.getFullYear())} · ${toArabicDigits(hour12)}:${toArabicDigits(minutes)} ${period}`;
}

export default function OrderTimeline({ timeline = [] }) {
  if (!timeline.length) return null;

  return (
    <section
      aria-labelledby="order-timeline-title"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
    >
      <h2
        id="order-timeline-title"
        className="font-display font-bold text-[17px] text-cocoa"
      >
        خط سير الطلب
      </h2>

      <ol className="mt-5">
        {timeline.map((entry, index) => {
          const isLast = index === timeline.length - 1;
          const formatted = entry.timestamp
            ? formatTimestamp(entry.timestamp)
            : null;

          return (
            <li key={entry.step} className="flex gap-3">
              <div className="flex flex-col items-center" aria-hidden="true">
                <span
                  className={`w-3 h-3 rounded-full border-2 ${
                    entry.completed
                      ? "border-terra bg-terra"
                      : "border-clay/30 bg-white"
                  }`}
                />
                {!isLast ? (
                  <span className="w-0.5 flex-1 my-1.5 rounded-full bg-clay/20" />
                ) : null}
              </div>

              <div className={`min-w-0 ${isLast ? "pb-1" : "pb-5"}`}>
                <p
                  className={`text-[14.5px] font-bold ${
                    entry.completed ? "text-cocoa" : "text-cocoa-soft"
                  }`}
                >
                  {entry.step}
                </p>
                {formatted ? (
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-cocoa-soft">
                    <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {formatted}
                  </p>
                ) : (
                  <p className="mt-1 text-[12px] text-cocoa-soft/70">
                    لسّه ما صار
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
