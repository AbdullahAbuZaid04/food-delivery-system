import { Fragment } from "react";
import {
  Bike,
  CircleAlert,
  CircleCheck,
  CookingPot,
  PackageCheck,
} from "lucide-react";

export const ORDER_PROGRESS_STEPS = [
  "تم التأكيد",
  "قيد التحضير",
  "بالطريق",
  "وصل",
];

const STEP_ICONS = {
  "تم التأكيد": CircleCheck,
  "قيد التحضير": CookingPot,
  "بالطريق": Bike,
  "وصل": PackageCheck,
};

export default function OrderProgressSteps({ timeline = [], cancelled = false }) {
  if (cancelled) {
    return (
      <section
        aria-labelledby="order-status-title"
        className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
      >
        <h2
          id="order-status-title"
          className="font-display font-bold text-[17px] text-cocoa"
        >
          حالة الطلب
        </h2>
        <div
          role="status"
          className="mt-5 flex items-center gap-3 rounded-2xl border border-error/20 bg-error/10 px-4 py-3.5"
        >
          <CircleAlert
            className="w-5 h-5 text-error shrink-0"
            aria-hidden="true"
          />
          <p className="text-[14.5px] font-bold text-error">
            تم إلغاء هالطلب
          </p>
        </div>
      </section>
    );
  }

  if (!timeline.length) return null;

  const currentIndex = timeline.findIndex((entry) => !entry.completed);

  return (
    <section
      aria-labelledby="order-status-title"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
    >
      <h2
        id="order-status-title"
        className="font-display font-bold text-[17px] text-cocoa"
      >
        حالة الطلب
      </h2>

      <ol className="mt-6 flex items-start">
        {timeline.map((entry, index) => {
          const Icon = STEP_ICONS[entry.step] ?? CircleCheck;
          const isDone = entry.completed;
          const isCurrent = index === currentIndex;
          const isLast = index === timeline.length - 1;

          return (
            <Fragment key={entry.step}>
              <li
                aria-current={isCurrent ? "step" : undefined}
                className="flex shrink-0 flex-col items-center"
              >
                <span
                  className={`relative flex w-11 h-11 items-center justify-center rounded-full border-2 transition-colors ${
                    isDone || isCurrent
                      ? "border-terra bg-terra/10 text-terra"
                      : "border-clay/20 bg-white text-cocoa-soft"
                  }`}
                >
                  {isCurrent ? (
                    <span
                      className="absolute -inset-1.5 rounded-full bg-terra/10 animate-pulse motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="relative">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                </span>
                <span
                  className={`mt-2 text-[12px] font-bold ${
                    isDone || isCurrent ? "text-terra" : "text-cocoa-soft"
                  }`}
                >
                  {entry.step}
                </span>
              </li>

              {!isLast ? (
                <li
                  className="mx-1 flex flex-1 items-center mt-5 sm:mx-2"
                  aria-hidden="true"
                >
                  <span
                    className={`h-0.5 w-full rounded-full ${
                      isDone ? "bg-terra/40" : "bg-clay/20"
                    }`}
                  />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </section>
  );
}
