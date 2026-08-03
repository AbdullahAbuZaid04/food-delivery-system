import { Fragment } from "react";
import { Bike, CircleCheck, CookingPot, PackageCheck } from "lucide-react";

const STEPS = [
  {
    key: "confirmed",
    label: "تم التأكيد",
    icon: <CircleCheck className="w-5 h-5" aria-hidden="true" />,
  },
  {
    key: "preparing",
    label: "عم يتحضر",
    icon: <CookingPot className="w-5 h-5" aria-hidden="true" />,
  },
  {
    key: "on-the-way",
    label: "بالطريق",
    icon: <Bike className="w-5 h-5" aria-hidden="true" />,
  },
  {
    key: "delivered",
    label: "وصل",
    icon: <PackageCheck className="w-5 h-5" aria-hidden="true" />,
  },
];

export default function OrderProgressSteps({ activeStep = 0 }) {
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
        {STEPS.map((step, index) => {
          const isActive = index === activeStep;
          const isDone = index < activeStep;
          const isLast = index === STEPS.length - 1;

          return (
            <Fragment key={step.key}>
              <li
                aria-current={isActive ? "step" : undefined}
                className="flex shrink-0 flex-col items-center"
              >
                <span
                  className={`relative flex w-11 h-11 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive || isDone
                      ? "border-terra bg-terra/10 text-terra"
                      : "border-clay/20 bg-white text-cocoa-soft"
                  }`}
                >
                  {isActive ? (
                    <span
                      className="absolute -inset-1.5 rounded-full bg-terra/10 animate-pulse motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="relative">{step.icon}</span>
                </span>
                <span
                  className={`mt-2 text-[12px] font-bold ${
                    isActive ? "text-terra" : "text-cocoa-soft"
                  }`}
                >
                  {step.label}
                </span>
              </li>

              {!isLast ? (
                <li className="mx-1 flex flex-1 items-center mt-5 sm:mx-2" aria-hidden="true">
                  <span
                    className={`h-0.5 w-full rounded-full ${
                      index < activeStep ? "bg-terra/40" : "bg-clay/20"
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
