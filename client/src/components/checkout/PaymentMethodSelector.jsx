import { Banknote, CircleCheck, CreditCard, Lock } from "lucide-react";

const PAYMENT_OPTIONS = [
  {
    id: "cash",
    label: "الدفع عند الاستلام",
    description: "بتحاسب المندوب كاش لما توصلك الطلبية",
    icon: <Banknote className="w-6 h-6" strokeWidth={1.7} aria-hidden="true" />,
    disabled: false,
  },
  {
    id: "card",
    label: "بطاقة ائتمان",
    description: "ادفع بالبطاقة — ما تزال قيد التفعيل",
    icon: <CreditCard className="w-6 h-6" strokeWidth={1.7} aria-hidden="true" />,
    disabled: true,
  },
];

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <section
      aria-labelledby="payment-method-title"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
    >
      <h2
        id="payment-method-title"
        className="font-display font-bold text-[17px] text-cocoa"
      >
        طريقة الدفع
      </h2>

      <div
        role="radiogroup"
        aria-labelledby="payment-method-title"
        className="mt-5 grid gap-3 sm:grid-cols-2"
      >
        {PAYMENT_OPTIONS.map((option) => {
          if (option.disabled) {
            return (
              <div
                key={option.id}
                aria-disabled="true"
                className="relative flex items-start gap-3 rounded-[20px] border-2 border-dashed border-clay/25 bg-white/60 p-4 cursor-not-allowed select-none"
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={option.id}
                  disabled
                  className="sr-only"
                />
                <span className="w-11 h-11 shrink-0 rounded-full bg-clay/10 text-cocoa-soft flex items-center justify-center">
                  {option.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[15px] font-bold text-cocoa-soft">
                    {option.label}
                    <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  </span>
                  <span className="mt-1 block text-[13px] text-cocoa-soft/80 leading-relaxed">
                    {option.description}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-gold/20 text-gold px-3 py-1 text-[11.5px] font-bold">
                  قريبًا
                </span>
              </div>
            );
          }

          const isSelected = value === option.id;
          return (
            <label
              key={option.id}
              className={`relative flex items-start gap-3 rounded-[20px] border-2 p-4 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-terra/40 ${
                isSelected
                  ? "border-terra bg-white ring-1 ring-terra/30"
                  : "border-clay/20 bg-white hover:border-terra/40"
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                value={option.id}
                checked={isSelected}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              <span
                className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-terra/12 text-terra"
                    : "bg-clay/10 text-cocoa-soft"
                }`}
              >
                {option.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-cocoa">
                  {option.label}
                </span>
                <span className="mt-1 block text-[13px] text-cocoa-soft leading-relaxed">
                  {option.description}
                </span>
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
    </section>
  );
}
