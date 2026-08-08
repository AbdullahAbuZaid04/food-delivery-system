import { Bike, CircleCheck, CircleX, Clock, CookingPot } from "lucide-react";

const STATUS_ICONS = {
  "تم التوصيل": CircleCheck,
  "قيد التحضير": CookingPot,
  "بالطريق": Bike,
  "ملغي": CircleX,
};

const STATUS_STYLES = {
  "تم التوصيل": "bg-success/15 text-success",
  "قيد التحضير": "bg-gold/20 text-terra-dark",
  "بالطريق": "bg-terra/15 text-terra-dark",
  "ملغي": "bg-error/15 text-error",
};

const FALLBACK_STYLE = "bg-clay/15 text-cocoa-soft";

function OrderStatusBadge({ status }) {
  const Icon = STATUS_ICONS[status] ?? Clock;
  const style = STATUS_STYLES[status] ?? FALLBACK_STYLE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold ${style}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

export default OrderStatusBadge;
